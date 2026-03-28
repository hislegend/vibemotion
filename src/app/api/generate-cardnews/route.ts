import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const SlideSchema = z.object({
  type: z.enum(["cover", "list", "split", "flow", "focus", "closing"]),
  title: z.string(),
  subtitle: z.string().optional(),
  items: z.array(z.string()).optional(),
  left: z.array(z.string()).optional(),
  right: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
  quote: z.string().optional(),
  highlight: z.string().optional(),
  cta: z.string().optional(),
  url: z.string().optional(),
  brand: z.string().optional(),
});

const CardNewsSchema = z.object({
  slides: z.array(SlideSchema).min(3).max(10),
});

const SYSTEM_PROMPT = `You are a card news content planner. Given a topic or text, create a structured slide deck.

Rules:
- First slide must be type "cover" with a compelling title and subtitle
- Last slide must be type "closing" with brand, cta, and url
- Middle slides can be: list, split, flow, or focus
- list: 3-5 items. Include a highlight (bottom summary sentence)
- split: left (problems) and right (solutions). Include a highlight
- flow: 3-4 steps for a process. Include a highlight
- focus: one powerful quote
- Each slide should have a clear, concise title
- Use Korean text for all content
- Keep items/steps to short phrases (10-20 chars each)
- highlight should be a punchy summary sentence

Return ONLY the JSON structure, no explanation.`;

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
      schema: CardNewsSchema,
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Card news generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate card news structure" }),
      { status: 500 },
    );
  }
}
