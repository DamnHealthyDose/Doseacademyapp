import { defineMcp } from "@lovable.dev/mcp-js";
import aboutTool from "./tools/about";
import listToolsTool from "./tools/list-tools";

export default defineMcp({
  name: "dose-academy-mcp",
  title: "DOSE Academy",
  version: "0.1.0",
  instructions:
    "Read-only tools that describe DOSE Academy — an ADHD support app for teens — and its in-app tools (SPARK, WAVE, RSD, Squad, IGNITE). Use `about_dose_academy` for a high-level overview and `list_dose_tools` to enumerate the app's features.",
  tools: [aboutTool, listToolsTool],
});
