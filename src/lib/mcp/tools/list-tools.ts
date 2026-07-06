import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const TOOLS = [
  {
    key: "spark",
    name: "SPARK",
    purpose: "5-step emotional reset wizard for overwhelm or big feelings.",
    path: "/spark",
  },
  {
    key: "wave",
    name: "WAVE",
    purpose: "Pomodoro focus timer designed to break task paralysis.",
    path: "/wave/setup",
  },
  {
    key: "rsd",
    name: "RSD",
    purpose: "Rejection-sensitivity intervention: validate, stabilize, decode.",
    path: "/rsd",
  },
  {
    key: "squad",
    name: "Squad Focus",
    purpose: "Body-doubling with ambient peers or an invited squad.",
    path: "/squad",
  },
  {
    key: "ignite",
    name: "IGNITE",
    purpose: "AI task activation — breaks tasks into minimal observable actions.",
    path: "/ignite",
  },
] as const;

export default defineTool({
  name: "list_dose_tools",
  title: "List DOSE tools",
  description:
    "Returns the DOSE Academy in-app tools (SPARK, WAVE, RSD, Squad, IGNITE) with a short purpose and app route for each.",
  inputSchema: {
    tool_key: z
      .enum(["spark", "wave", "rsd", "squad", "ignite"])
      .optional()
      .describe("Optional: return details for a single tool only."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ tool_key }) => {
    const items = tool_key ? TOOLS.filter((t) => t.key === tool_key) : TOOLS;
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { tools: items },
    };
  },
});
