import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const CONTENT_ANALYSIS_PROMPT = `You are a content analysis engine for a motion graphics generation tool.

Analyze the given content and extract structured information that will be used to create engaging video content.

Your analysis should identify:
1. The main topic and a concise summary
2. Key data points (numbers, statistics, percentages) that could be visualized
3. Named entities (people, companies, products, places)
4. The overall emotional tone
5. A suggested video duration based on content complexity
6. Content category (news, tutorial, product, data, story, social)

Be thorough but concise. Focus on elements that translate well to visual/motion content.`;

const ContentAnalysisSchema = z.object({
  title: z.string().describe("A short, catchy title for the video"),
  summary: z.string().describe("2-3 sentence summary of the content"),
  dataPoints: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        unit: z.string().optional(),
      }),
    )
    .describe("Key numbers, statistics, or metrics found in the content"),
  entities: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(["person", "company", "product", "place", "other"]),
      }),
    )
    .describe("Named entities mentioned in the content"),
  tone: z
    .enum([
      "informative",
      "exciting",
      "serious",
      "playful",
      "inspirational",
      "urgent",
    ])
    .describe("Overall emotional tone of the content"),
  suggestedDuration: z
    .number()
    .describe("Suggested video duration in seconds (8, 15, 30, or 60)"),
  category: z
    .enum(["news", "tutorial", "product", "data", "story", "social"])
    .describe("Content category"),
  keywords: z
    .array(z.string())
    .describe("3-5 keywords that capture the essence"),
});

export type ContentAnalysis = z.infer<typeof ContentAnalysisSchema>;

async function extractTextFromUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Vibemotion/1.0)" },
    signal: AbortSignal.timeout(10000),
  });
  const html = await res.text();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract meta description
  const metaMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i,
  );
  const metaDesc = metaMatch ? metaMatch[1].trim() : "";

  // Extract body text (strip tags)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : html;
  const bodyText = bodyHtml
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);

  return `Title: ${title}\nDescription: ${metaDesc}\n\nContent:\n${bodyText}`;
}

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
    const body = await request.json();
    const { input, inputType } = body as {
      input: string;
      inputType: "text" | "url";
    };

    if (!input || !inputType) {
      return Response.json(
        { error: "input and inputType are required" },
        { status: 400 },
      );
    }

    let content = input;
    if (inputType === "url") {
      try {
        content = await extractTextFromUrl(input);
      } catch {
        return Response.json(
          { error: "URL을 가져올 수 없습니다. URL을 확인해주세요." },
          { status: 400 },
        );
      }
    }

    const result = await generateObject({
      model: getModel() as Parameters<typeof generateObject>[0]["model"],
      system: CONTENT_ANALYSIS_PROMPT,
      prompt: `Analyze the following content:\n\n${content}`,
      schema: ContentAnalysisSchema,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error("Analyze error:", error);
    return Response.json(
      { error: "분석 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
