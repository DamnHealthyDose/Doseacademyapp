const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, token } = body

    if (!action || !token || typeof token !== 'string' || token.length > 100) {
      return new Response(JSON.stringify({ error: 'Missing or invalid fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    // All actions are token-based — look up profile by consent_token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, display_name, age_bracket, age_verified, parent_consent_given, created_at, consent_token_expires_at')
      .eq('consent_token', token)
      .single()

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check token expiry
    if (profile.consent_token_expires_at && new Date(profile.consent_token_expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Token has expired' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'validate') {
      // Also fetch aggregated IGNITE data for the parent dashboard
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const { data: igniteSessions } = await supabase
        .from('barkley_memory')
        .select('steps_completed, spark_handoff, session_completed, streak_day, created_at')
        .eq('student_id', profile.user_id)

      const { data: streakData } = await supabase
        .from('ignite_streaks')
        .select('current_streak, last_activity_date')
        .eq('user_id', profile.user_id)
        .single()

      const allSessions = igniteSessions || []
      const weeklySessions = allSessions.filter(s => new Date(s.created_at) >= new Date(weekAgo))

      const igniteData = {
        currentStreak: streakData?.current_streak ?? 0,
        lastActivity: streakData?.last_activity_date ?? null,
        weeklySessionCount: weeklySessions.length,
        weeklyAvgSteps: weeklySessions.length
          ? Math.round(weeklySessions.reduce((a, s) => a + s.steps_completed, 0) / weeklySessions.length * 10) / 10
          : 0,
        weeklySparkHandoffs: weeklySessions.filter(s => s.spark_handoff).length,
        totalSessions: allSessions.length,
        todayActive: allSessions.some(s => {
          const d = new Date(s.created_at)
          const now = new Date()
          return d.toDateString() === now.toDateString()
        }),
      }

      return new Response(JSON.stringify({
        display_name: profile.display_name,
        age_bracket: profile.age_bracket,
        age_verified: profile.age_verified,
        parent_consent_given: profile.parent_consent_given,
        created_at: profile.created_at,
        ignite: igniteData,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'grant-consent') {
      await supabase
        .from('profiles')
        .update({
          parent_consent_given: true,
          parent_consent_at: new Date().toISOString(),
          age_verified: true,
          consent_token: null,
          consent_token_expires_at: null,
        })
        .eq('user_id', profile.user_id)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'revoke-consent') {
      await supabase
        .from('profiles')
        .update({
          parent_consent_given: false,
          age_verified: false,
          parent_consent_at: null,
        })
        .eq('user_id', profile.user_id)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      await supabase.from('profiles').delete().eq('user_id', profile.user_id)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(profile.user_id)
      if (deleteError) throw deleteError

      return new Response(JSON.stringify({ success: true, message: 'Account deleted' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
