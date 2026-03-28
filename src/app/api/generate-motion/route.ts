import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const MetricSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  prefix: z.string().optional(),
});

const SceneSchema = z.object({
  type: z.enum(["logo-intro", "countup", "text-reveal", "hero", "closing"]),
  title: z.string(),
  subtitle: z.string().optional(),
  brandName: z.string().optional(),
  slogan: z.string().optional(),
  metrics: z.array(MetricSchema).optional(),
  lines: z.array(z.string()).optional(),
  cta: z.string().optional(),
  url: z.string().optional(),
});

const MotionSchema = z.object({
  scenes: z.array(SceneSchema).min(2).max(6),
});

const SYSTEM_PROMPT = `You are a motion graphics scene planner. Given a topic, create a structured scene sequence for a short promotional/informational video.

Rules:
- Start with a "hero" or "logo-intro" scene
- End with a "closing" scene  
- Middle scenes can be: countup (for metrics/data), text-reveal (for key messages), hero (for section headers)
- countup: include 2-4 metrics with numeric values. Use realistic numbers.
- text-reveal: 2-4 impactful lines, each getting progressively more specific
- hero: strong title + subtitle for section transitions
- logo-intro: brandName + slogan for brand intros
- closing: brandName + cta + url
- Use Korean text for all content
- Keep it concise and impactful — each scene should have a clear purpose
- 3-5 scenes total for most videos

Return ONLY the JSON structure.`;

export async function POST(req: Request) {
  const { topic, model = "claude-sonnet-4-6" }: { topic: string; model?: string } = await req.json();

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!anthropicApiKey && !openaiApiKey) {
    return new Response(JSON.stringify({ error: "No API key" }), { status: 400 });
  }

  const isClaudeModel = (id: string) => id.startsWith("claude-");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiModel = (id: string): any => {
    if (isClaudeModel(id)) {
      if (!anthropicApiKey) throw new Error("ANTHROPIC_API_KEY required");
      return createAnthropic({ apiKey: anthropicApiKey })(id);
    } else {
      if (!openaiApiKey) throw new Error("OPENAI_API_KEY required");
      return createOpenAI({ apiKey: openaiApiKey })(id);
    }
  };

  try {
    const result = await generateObject({
      model: aiModel(model),
      system: SYSTEM_PROMPT,
      prompt: `주제: ${topic}`,
      schema: MotionSchema,
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Motion generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate motion structure" }),
      { status: 500 },
    );
  }
}
