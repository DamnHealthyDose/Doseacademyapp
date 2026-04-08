import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task, age_group, completed_steps, current_step_index } = await req.json();

    if (!task || typeof task !== "string" || task.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid task input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validAgeGroups = ["middle_school", "high_school"];
    if (!validAgeGroups.includes(age_group)) {
      return new Response(JSON.stringify({ error: "Invalid age group" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isYounger = age_group === "middle_school";
    const maxTime = isYounger ? "2-3 minutes" : "3-5 minutes";
    const toneGuide = isYounger
      ? "Use warm, encouraging, simple language appropriate for ages 10-12. Short sentences. Very specific physical actions."
      : "Use peer-level, direct language appropriate for ages 13-17. Respect autonomy. No condescension.";

    const stepContext = completed_steps && completed_steps.length > 0
      ? `\nSteps already completed:\n${completed_steps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}\n\nGenerate the NEXT logical micro-step (step ${(current_step_index || completed_steps.length) + 1}).`
      : "Generate the FIRST micro-step to get started.";

    const systemPrompt = `You are IGNITE, a task activation assistant for students with ADHD (ages ${isYounger ? "10-12" : "13-17"}).

RULES:
- Every step MUST be a physical, observable action. NEVER use "think about", "consider", or "reflect on".
- Each step must be completable in under ${maxTime}.
- Use specific numbers: "write 3 sentences" not "start writing".
- Steps should ladder logically toward completing the full task.
- ${toneGuide}
- If the task is vague or emotionally loaded (e.g. "I don't want to do anything"), interpret charitably and generate a gentle, grounded physical first action.
- Common categories: homework, studying, cleaning, school prep, social situations, creative projects.

RESPOND WITH ONLY a JSON object with these fields:
- "step": the micro-step text (string)
- "time_estimate": estimated minutes as a number (1-${isYounger ? "3" : "5"})
- "is_final": boolean, true ONLY if this step would reasonably complete the entire task
- "total_estimated_steps": rough estimate of how many total steps the full task needs (number)`;

    const userPrompt = `Task: "${task}"${stepContext}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_step",
                description: "Generate a micro-step for the student",
                parameters: {
                  type: "object",
                  properties: {
                    step: { type: "string", description: "The micro-step instruction" },
                    time_estimate: { type: "number", description: "Estimated minutes (1-5)" },
                    is_final: { type: "boolean", description: "True if this completes the task" },
                    total_estimated_steps: { type: "number", description: "Total steps estimate" },
                  },
                  required: ["step", "time_estimate", "is_final", "total_estimated_steps"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "generate_step" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Failed to generate step" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ignite-steps error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
