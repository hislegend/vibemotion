import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const SCRIPT_SYSTEM_PROMPT = `You are a professional Korean video narrator scriptwriter.
Given content analysis data, write THREE versions of a narration script for a video.

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

## THREE VERSIONS
- Version A: '핵심 요약' — punchy, key points only, ~15초 분량 (2-3 scenes)
- Version B: '표준 나레이션' — standard narration, ~30초 분량 (4-5 scenes)
- Version C: '상세 설명' — detailed storytelling, ~60초 분량 (6-8 scenes)

## OUTPUT FORMAT (exactly this format, no extra text)
---VERSION_A---
[씬1]
(narration text)

[씬2]
(narration text)

---VERSION_B---
[씬1]
(narration text)

[씬2]
(narration text)

...

---VERSION_C---
[씬1]
(narration text)

[씬2]
(narration text)

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
      prompt: `Generate THREE versions of a natural Korean narration script for this content:\n\n${JSON.stringify(analysis, null, 2)}`,
    });

    const text = result.text;
    const labels = [
      { marker: "---VERSION_A---", label: "핵심 요약 (~15초)" },
      { marker: "---VERSION_B---", label: "표준 나레이션 (~30초)" },
      { marker: "---VERSION_C---", label: "상세 설명 (~60초)" },
    ];

    const versions: { label: string; script: string }[] = [];
    for (let i = 0; i < labels.length; i++) {
      const start = text.indexOf(labels[i].marker);
      if (start === -1) continue;
      const contentStart = start + labels[i].marker.length;
      const nextMarker = labels[i + 1]?.marker;
      const end = nextMarker ? text.indexOf(nextMarker) : text.length;
      const script = text.slice(contentStart, end === -1 ? undefined : end).trim();
      versions.push({ label: labels[i].label, script });
    }

    // Fallback: if parsing failed, return single version
    if (versions.length === 0) {
      versions.push({ label: "나레이션", script: text.trim() });
    }

    return Response.json({ versions });
  } catch (error) {
    console.error("Generate script error:", error);
    return Response.json(
      { error: "스크립트 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
