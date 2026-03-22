export const MODELS = [
  { id: "gpt-5.4:low", name: "GPT-5.4 (Low Reasoning)" },
  { id: "gpt-5.4:medium", name: "GPT-5.4 (Medium Reasoning)" },
  { id: "gpt-5.4:high", name: "GPT-5.4 (High Reasoning)" },
  { id: "gpt-5.4-pro:medium", name: "GPT-5.4 Pro (Medium)" },
  { id: "gpt-5.4-pro:high", name: "GPT-5.4 Pro (High)" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" },
  { id: "claude-opus-4-6", name: "Claude Opus 4.6" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export type StreamPhase = "idle" | "reasoning" | "generating";

export type GenerationErrorType = "validation" | "api";
