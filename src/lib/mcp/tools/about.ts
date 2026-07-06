import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "about_dose_academy",
  title: "About DOSE Academy",
  description:
    "Returns a short overview of DOSE Academy — an ADHD support app for teens (ages 10–17) with four core tools: SPARK, WAVE, RSD, and Squad Focus.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: [
          "DOSE Academy is a calm, teen-friendly ADHD support app (ages 10–17).",
          "",
          "Core tools:",
          "• SPARK — 5-step tap-only emotional reset wizard.",
          "• WAVE — Pomodoro-style focus timer built for task paralysis.",
          "• RSD — Rejection-sensitivity intervention that validates first, then reframes.",
          "• Squad Focus — Body-doubling with ambient peers or invited squads.",
          "",
          "Tone: non-judgmental, affirming, never clinical or shaming.",
        ].join("\n"),
      },
    ],
  }),
});
