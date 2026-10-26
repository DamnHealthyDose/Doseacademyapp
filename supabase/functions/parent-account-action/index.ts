import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.99.2'
import { escapeHtml, getEmailConfig, sendEmail, type EmailConfig } from '../_shared/email.ts'
import { newToken, sha256Hex } from '../_shared/tokens.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LINK_COOLDOWN_MS = 60 * 1000

// Two kinds of token, both stored only as SHA-256 hashes:
//   consent token  - one-time, expires, emailed when the child requests consent
//   manage token   - long-lived, rotated on every grant / resend, emailed after consent is granted
// Actions: validate-consent + grant-consent use the consent token;
//          validate + revoke-consent + delete use the manage token;
//          resend-dashboard-link takes the parent's email instead of a token.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { action } = body ?? {}
    if (typeof action !== 'string') return json({ error: 'Missing or invalid fields' }, 400)

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    if (action === 'resend-dashboard-link') {
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      // Same response whether or not the email matched, so this can't be used to probe
      // which addresses are registered. The work runs after the response is sent so
      // response time doesn't leak it either.
      const work = resendDashboardLink(supabase, email).catch(() => console.error('resend-dashboard-link failed'))
      const runtime = (globalThis as { EdgeRuntime?: { waitUntil: (p: Promise<unknown>) => void } }).EdgeRuntime
      if (runtime?.waitUntil) runtime.waitUntil(work)
      else await work
      return json({ success: true })
    }

    const token = body.token
    if (!token || typeof token !== 'string' || token.length > 100) return json({ error: 'Missing or invalid fields' }, 400)
    const tokenHash = await sha256Hex(token)

    if (action === 'validate-consent' || action === 'grant-consent') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, display_name, age_verified, consent_token_expires_at, parent_manage_token_hash, parent_email')
        .eq('consent_token_hash', tokenHash)
        .maybeSingle()
      if (!profile) return json({ error: 'Invalid or expired token' }, 404)
      if (profile.consent_token_expires_at && new Date(profile.consent_token_expires_at) < new Date()) {
        return json({ error: 'Token has expired' }, 410)
      }

      if (action === 'validate-consent') return json({ display_name: profile.display_name })

      // grant-consent: email the parent their dashboard link BEFORE granting, so consent is
      // never active without a way to revoke it. If the email fails, nothing has changed.
      const email = getEmailConfig()
      if (!email || !profile.parent_email) return json({ error: 'Could not complete consent right now' }, 503)

      const manageToken = newToken()
      const rotate = await supabase
        .from('profiles')
        .update({ parent_manage_token_hash: await sha256Hex(manageToken), parent_manage_link_sent_at: new Date().toISOString() })
        .eq('user_id', profile.user_id)
      if (rotate.error) return json({ error: 'An error occurred' }, 500)

      const link = `${email.appUrl}/parent-dashboard/${manageToken}`
      const sent = await sendEmail(email, {
        to: profile.parent_email,
        subject: 'Consent confirmed - your DOSE Academy dashboard link',
        html:
          `<p>You've given consent for ${escapeHtml(profile.display_name || 'your child')} to use peer features in DOSE Academy.</p>` +
          `<p>Use this link any time to see what's stored, withdraw consent, or delete the account:</p>` +
          `<p><a href="${escapeHtml(link)}">Open your parent dashboard</a></p>` +
          `<p>Keep this email. If you lose it, you can request a new link from the dashboard page.</p>`,
      })
      if (!sent) {
        // Restore the previous manage hash (if any); consent is untouched and the consent link still works.
        await supabase
          .from('profiles')
          .update({ parent_manage_token_hash: profile.parent_manage_token_hash })
          .eq('user_id', profile.user_id)
        return json({ error: 'Could not send your confirmation email. Please try again.' }, 502)
      }

      const grant = await supabase
        .from('profiles')
        .update({
          parent_consent_given: true,
          parent_consent_at: new Date().toISOString(),
          age_verified: true,
          consent_token_hash: null,
          consent_token_expires_at: null,
        })
        .eq('user_id', profile.user_id)
      if (grant.error) return json({ error: 'An error occurred' }, 500)

      return json({ success: true })
    }

    if (action === 'validate' || action === 'revoke-consent' || action === 'delete') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, display_name, age_bracket, age_verified, parent_consent_given, created_at')
        .eq('parent_manage_token_hash', tokenHash)
        .maybeSingle()
      if (!profile) return json({ error: 'Invalid or expired token' }, 404)

      if (action === 'validate') {
        // Aggregated IGNITE data for the parent dashboard
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
        const { data: igniteSessions } = await supabase
          .from('barkley_memory')
          .select('steps_completed, spark_handoff, session_completed, streak_day, created_at')
          .eq('student_id', profile.user_id)

        const { data: streakData } = await supabase
          .from('ignite_streaks')
          .select('current_streak, last_activity_date')
          .eq('user_id', profile.user_id)
          .maybeSingle()

        const allSessions = igniteSessions || []
        const weeklySessions = allSessions.filter((s) => new Date(s.created_at) >= new Date(weekAgo))

        const igniteData = {
          currentStreak: streakData?.current_streak ?? 0,
          lastActivity: streakData?.last_activity_date ?? null,
          weeklySessionCount: weeklySessions.length,
          weeklyAvgSteps: weeklySessions.length
            ? Math.round(weeklySessions.reduce((a, s) => a + s.steps_completed, 0) / weeklySessions.length * 10) / 10
            : 0,
          weeklySparkHandoffs: weeklySessions.filter((s) => s.spark_handoff).length,
          totalSessions: allSessions.length,
          todayActive: allSessions.some((s) => new Date(s.created_at).toDateString() === new Date().toDateString()),
        }

        return json({
          display_name: profile.display_name,
          age_bracket: profile.age_bracket,
          age_verified: profile.age_verified,
          parent_consent_given: profile.parent_consent_given,
          created_at: profile.created_at,
          ignite: igniteData,
        })
      }

      if (action === 'revoke-consent') {
        // The manage token is kept so the parent can still delete the account afterwards.
        const { error } = await supabase
          .from('profiles')
          .update({ parent_consent_given: false, age_verified: false, parent_consent_at: null })
          .eq('user_id', profile.user_id)
        if (error) return json({ error: 'An error occurred' }, 500)
        return json({ success: true })
      }

      // delete: remove everything keyed to the child. Any failure returns an error instead of
      // success. The profile row (which holds the manage token hash) goes last so the parent
      // can retry with the same link if a step fails. Deletes are idempotent, so retrying is safe.
      // Chat history is keyed by browser device_id, not user, so it can't be linked to the child.
      const userId = profile.user_id
      for (const [table, column] of [['barkley_memory', 'student_id'], ['ignite_streaks', 'user_id']] as const) {
        const { error } = await supabase.from(table).delete().eq(column, userId)
        if (error) {
          console.error(`delete failed: ${table}`)
          return json({ error: 'Could not delete all data. Please try again.' }, 500)
        }
      }

      // Deleting the auth user also cascades to profiles and user_roles.
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      if (authError && authError.status !== 404) {
        console.error('delete failed: auth user')
        return json({ error: 'Could not delete the account. Please try again.' }, 500)
      }

      const { error: profileError } = await supabase.from('profiles').delete().eq('user_id', userId)
      if (profileError) {
        console.error('delete failed: profiles')
        return json({ error: 'Could not delete the account. Please try again.' }, 500)
      }
      return json({ success: true, message: 'Account deleted' })
    }

    return json({ error: 'Unknown action' }, 400)
  } catch (_err) {
    return json({ error: 'An error occurred' }, 500)
  }
})

// Rotates and emails a fresh dashboard link for every consented profile registered to this
// parent email (one parent may have several children). Rate-limited per profile.
async function resendDashboardLink(supabase: SupabaseClient, parentEmail: string) {
  if (!parentEmail || parentEmail.length > 254 || !EMAIL_RE.test(parentEmail)) return
  const email: EmailConfig | null = getEmailConfig()
  if (!email) return

  const { data: rows } = await supabase
    .from('profiles')
    .select('user_id, display_name, parent_manage_link_sent_at')
    .eq('parent_email', parentEmail)
    .eq('parent_consent_given', true)
    .limit(20)

  const due = (rows ?? []).filter(
    (r) => !r.parent_manage_link_sent_at || Date.now() - new Date(r.parent_manage_link_sent_at).getTime() >= LINK_COOLDOWN_MS,
  )
  if (due.length === 0) return

  const links: { name: string; link: string }[] = []
  for (const row of due) {
    const manageToken = newToken()
    const { error } = await supabase
      .from('profiles')
      .update({ parent_manage_token_hash: await sha256Hex(manageToken), parent_manage_link_sent_at: new Date().toISOString() })
      .eq('user_id', row.user_id)
    if (!error) {
      links.push({ name: row.display_name || 'Your child', link: `${email.appUrl}/parent-dashboard/${manageToken}` })
    }
  }
  if (links.length === 0) return

  await sendEmail(email, {
    to: parentEmail,
    subject: 'Your DOSE Academy dashboard link',
    html:
      `<p>You asked for a new parent dashboard link. Any earlier link no longer works.</p><ul>` +
      links.map((l) => `<li>${escapeHtml(l.name)}: <a href="${escapeHtml(l.link)}">Open dashboard</a></li>`).join('') +
      `</ul><p>If you didn't ask for this, you can ignore this email.</p>`,
  })
}
