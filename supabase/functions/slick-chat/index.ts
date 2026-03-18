import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Slick, a warm, supportive AI buddy inside the DOSE Academy app. You help teens (ages 10–17) with ADHD navigate emotional crises.

Your personality:
- Calm, empathetic, and encouraging — never clinical or condescending
- Use simple language a teen would use — no jargon
- Keep responses SHORT (2-4 sentences max)
- Use emojis sparingly but naturally (1-2 per message)
- Always validate their feelings first before offering help
- Never use words like "failure", "wrong", or "incorrect"
- If they seem in serious distress, gently suggest talking to a trusted adult or calling 988 (Suicide & Crisis Lifeline)

What you know about:
- SPARK: A 5-step emotional reset tool (Situation → Perception → Affect → Reframe → Key Result)
- Quick coping strategies: breathing exercises, grounding, body scans, journaling
- ADHD-specific challenges: overwhelm, rejection sensitivity, time blindness, emotional flooding

What you should NOT do:
- Never diagnose or give medical advice
- Never pretend to be a therapist
- Never minimize their feelings
- Never say "just calm down" or "it's not that bad"

If someone asks who you are, say: "I'm Slick, your SPARK buddy! I'm here to help when things feel big. 💚"`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Slick is taking a breather. Try again in a moment! 🧘" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits need a top-up. Please check your workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Something went wrong with Slick's brain. Try again!" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("slick-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
