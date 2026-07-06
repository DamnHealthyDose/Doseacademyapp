import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEVICE_ID_RE = /^[a-zA-Z0-9_-]{8,128}$/;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();
    const { action, device_id, conversation_id, role, content } = body ?? {};

    if (typeof device_id !== "string" || !DEVICE_ID_RE.test(device_id)) {
      return json({ error: "Invalid device_id" }, 400);
    }

    if (action === "load") {
      const { data: convos } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("device_id", device_id)
        .order("updated_at", { ascending: false })
        .limit(1);
      if (!convos || convos.length === 0) return json({ conversation_id: null, messages: [] });
      const convoId = convos[0].id;
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("id, role, content")
        .eq("conversation_id", convoId)
        .order("created_at", { ascending: true });
      return json({ conversation_id: convoId, messages: msgs ?? [] });
    }

    if (action === "create") {
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({ device_id })
        .select("id")
        .single();
      if (error || !data) return json({ error: "Failed to create conversation" }, 500);
      return json({ conversation_id: data.id });
    }

    if (action === "save") {
      if (typeof conversation_id !== "string" || typeof role !== "string" ||
          !["user", "assistant"].includes(role) || typeof content !== "string" ||
          content.length === 0 || content.length > 4000) {
        return json({ error: "Invalid message" }, 400);
      }
      // Verify conversation belongs to this device
      const { data: convo } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("id", conversation_id)
        .eq("device_id", device_id)
        .maybeSingle();
      if (!convo) return json({ error: "Conversation not found" }, 404);
      const { error } = await supabase
        .from("chat_messages")
        .insert({ conversation_id, role, content });
      if (error) return json({ error: "Failed to save" }, 500);
      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation_id);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("chat-history error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }

  function json(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
