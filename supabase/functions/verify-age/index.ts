import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.2'
import { escapeHtml, getEmailConfig, sendEmail } from '../_shared/email.ts'
import { newToken, sha256Hex } from '../_shared/tokens.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

type Bracket = 'under-13' | '13-15' | '16+'
const RANK: Record<Bracket, number> = { 'under-13': 0, '13-15': 1, '16+': 2 }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000

const bracketFromDob = (dob: string): Bracket | null => {
  if (!DATE_RE.test(dob)) return null
  const birth = new Date(`${dob}T00:00:00Z`)
  if (Number.isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getUTCFullYear() - birth.getUTCFullYear()
  const beforeBirthday =
    now.getUTCMonth() < birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())
  if (beforeBirthday) age--
  if (age < 0 || age > 120) return null
  return age < 13 ? 'under-13' : age < 16 ? '13-15' : '16+'
}

// Age fields and parental-consent state are service-role only (see the
// lock_profile_protected_columns migration). This is the only place a user's age
// bracket is set and the only place a consent token is created.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Not signed in' }, 401)

    const url = Deno.env.get('SUPABASE_URL')!
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userError } = await asUser.auth.getUser()
    if (userError || !userData.user) return json({ error: 'Not signed in' }, 401)
    const userId = userData.user.id

    const body = await req.json().catch(() => ({}))
    const submittedDob = typeof body?.dob === 'string' ? body.dob : ''
    const parentEmail = typeof body?.parent_email === 'string' ? body.parent_email.trim().toLowerCase() : ''

    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('date_of_birth, age_bracket, age_verified, consent_token_expires_at')
      .eq('user_id', userId)
      .single()
    if (profileError || !profile) return json({ error: 'Profile not found' }, 404)

    if (profile.age_verified) return json({ status: 'verified' })

    // The stored DOB wins over a resubmitted one, and a stored younger bracket is never loosened.
    const dob = profile.date_of_birth ?? submittedDob
    const computed = dob ? bracketFromDob(dob) : null
    const stored = (profile.age_bracket as Bracket | null) ?? null
    if (!computed && !stored) return json({ error: 'A valid date of birth is required' }, 400)
    const candidates = [computed, stored].filter((b): b is Bracket => b !== null)
    const bracket = candidates.reduce((a, b) => (RANK[a] <= RANK[b] ? a : b))

    const update: Record<string, unknown> = { age_bracket: bracket }
    if (!profile.date_of_birth && computed) update.date_of_birth = dob
    if (bracket === '16+') update.age_verified = true

    const save = await admin.from('profiles').update(update).eq('user_id', userId)
    if (save.error) return json({ error: 'Could not save' }, 500)

    if (bracket === '16+') return json({ status: 'verified' })
    if (bracket === 'under-13') return json({ status: 'under13' })

    // 13-15: needs a parent. The first call just records the bracket.
    if (!parentEmail) return json({ status: 'needs-parent' })
    if (parentEmail.length > 254 || !EMAIL_RE.test(parentEmail)) return json({ error: 'Invalid parent email' }, 400)

    const email = getEmailConfig()
    if (!email) {
      console.error('verify-age: RESEND_API_KEY / CONSENT_EMAIL_FROM / APP_URL not configured')
      return json({ error: 'Consent emails are not available right now' }, 503)
    }

    if (profile.consent_token_expires_at) {
      const issuedAt = new Date(profile.consent_token_expires_at).getTime() - TOKEN_TTL_MS
      if (Date.now() - issuedAt < RESEND_COOLDOWN_MS) {
        return json({ error: 'A request was just sent. Please wait a minute and try again.' }, 429)
      }
    }

    // The raw token only ever leaves via the parent's email; the database keeps its hash.
    const token = newToken()
    const store = await admin
      .from('profiles')
      .update({
        parent_email: parentEmail,
        consent_token_hash: await sha256Hex(token),
        consent_token_expires_at: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
        parent_consent_given: false,
      })
      .eq('user_id', userId)
    if (store.error) return json({ error: 'Could not save' }, 500)

    const link = `${email.appUrl}/parent-consent/${token}`
    const sent = await sendEmail(email, {
      to: parentEmail,
      subject: 'Parental consent request for DOSE Academy',
      html:
        `<p>Your child has asked to use the study-with-a-friend features in DOSE Academy.</p>` +
        `<p>Because they are under 16, we need your permission first.</p>` +
        `<p><a href="${escapeHtml(link)}">Review and respond to this request</a></p>` +
        `<p>This link expires in 7 days. If you don't recognise this request, you can ignore this email.</p>`,
    })
    if (!sent) {
      await admin
        .from('profiles')
        .update({ consent_token_hash: null, consent_token_expires_at: null })
        .eq('user_id', userId)
      return json({ error: 'Could not send the consent email' }, 502)
    }

    return json({ status: 'consent-requested' })
  } catch (_err) {
    return json({ error: 'An error occurred' }, 500)
  }
})
