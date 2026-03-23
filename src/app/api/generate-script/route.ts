import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const SCRIPT_SYSTEM_PROMPT = `You are a professional Korean video narrator scriptwriter.
Given content analysis data, write a natural narration script for a video.

## ABSOLUTE RULES
1. NEVER include metadata: tone labels, scene counts, duration specs, version numbers, technical percentages
2. NEVER include system text like '톤:', '장면당', '콘텐츠 버전수', '인프라 활용률'
3. Write as a human narrator speaking naturally to viewers
4. Use broadcast narration tone (방송 나레이션) — warm, clear, engaging
5. Break into scenes with time markers
6. End with a natural call-to-action
7. Each scene should be 2-3 sentences max
8. Numbers should be spoken naturally: '1억 4천만 원' not '140000000원'
9. Flow naturally between scenes — no abrupt topic changes

## OUTPUT FORMAT (exactly this format, no extra text)
[씬1]
(narration text for scene 1)

[씬2]
(narration text for scene 2)

...

## INPUT
You will receive a content analysis JSON. Extract ONLY the human-readable information (title, summary, key messages, data points as natural language). Ignore all metadata fields.`;

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
    const { analysis } = body as { analysis: unknown };

    if (!analysis) {
      return Response.json(
        { error: "analysis is required" },
        { status: 400 },
      );
    }

    const result = await generateText({
      model: getModel() as Parameters<typeof generateText>[0]["model"],
      system: SCRIPT_SYSTEM_PROMPT,
      prompt: `Generate a natural Korean narration script for this content:\n\n${JSON.stringify(analysis, null, 2)}`,
    });

    return new Response(result.text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Generate script error:", error);
    return Response.json(
      { error: "스크립트 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
