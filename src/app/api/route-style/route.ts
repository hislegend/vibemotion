import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const STYLE_ROUTING_PROMPT = `You are a creative director for a motion graphics studio.

Given a content analysis, recommend the top 3 video styles that would best present this content.

Available styles:
- infographic: Best for data-heavy content, statistics, charts, comparisons. Clean layouts with animated numbers and graphs.
- presenter: Best for tutorials, explanations, thought leadership. Features a central speaker layout with supporting visuals.
- cinematic: Best for storytelling, emotional content, brand stories. Dramatic transitions, cinematic color grading.
- showcase: Best for product launches, app demos, feature highlights. Focused on showcasing a product with sleek animations.
- social: Best for quick, attention-grabbing content. Fast-paced, bold text, trending formats optimized for social media.

Consider the content's category, tone, data density, and target audience when making recommendations.
Score each style from 0-100 based on how well it fits the content.`;

const StyleRoutingSchema = z.object({
  styles: z
    .array(
      z.object({
        style: z.enum([
          "infographic",
          "presenter",
          "cinematic",
          "showcase",
          "social",
        ]),
        score: z.number().min(0).max(100),
        reason: z.string().describe("1-2 sentence explanation in Korean"),
      }),
    )
    .length(3)
    .describe("Top 3 recommended styles, ordered by score descending"),
});

function getModel() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (anthropicApiKey) {
    return createAnthropic({ apiKey: anthropicApiKey })("claude-sonnet-4-6");
  }
  if (openaiApiKey) {
    return createOpenAI({ apiKey: openaiApiKey })("gpt-5.4");
  }
  throw new Error("No AI API key configured");
}

export async function POST(request: Request) {
  try {
    const analysis = await request.json();

    if (!analysis || !analysis.title) {
      return Response.json(
        { error: "Valid content analysis is required" },
        { status: 400 },
      );
    }

    const result = await generateObject({
      model: getModel() as Parameters<typeof generateObject>[0]["model"],
      system: STYLE_ROUTING_PROMPT,
      prompt: `Content analysis:\n${JSON.stringify(analysis, null, 2)}`,
      schema: StyleRoutingSchema,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error("Route-style error:", error);
    return Response.json(
      { error: "스타일 추천 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
