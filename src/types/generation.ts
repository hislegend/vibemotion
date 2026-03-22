export const ASPECT_RATIOS = [
  { id: "16:9", name: "16:9 (Landscape)", width: 1920, height: 1080 },
  { id: "9:16", name: "9:16 (Portrait/Reels)", width: 1080, height: 1920 },
  { id: "1:1", name: "1:1 (Square)", width: 1080, height: 1080 },
  { id: "4:5", name: "4:5 (Instagram)", width: 1080, height: 1350 },
] as const;

export type AspectRatioId = (typeof ASPECT_RATIOS)[number]["id"];

export const DEFAULT_ASPECT_RATIO: AspectRatioId = "9:16";

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
