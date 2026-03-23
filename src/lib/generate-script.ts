interface ContentAnalysis {
  title: string;
  summary: string;
  dataPoints: { label: string; value: string; unit?: string }[];
  entities: { name: string; type: string }[];
  tone: string;
  suggestedDuration: number;
  category: string;
  keywords: string[];
}

const STYLE_TONE_MAP: Record<string, string> = {
  infographic: "명확하고 전달력 있는",
  presenter: "친근하고 설명적인",
  cinematic: "감성적이고 몰입감 있는",
  showcase: "세련되고 설득력 있는",
  social: "짧고 임팩트 있는",
};

/**
 * 분석 결과를 기반으로 내레이션 스크립트를 자동 생성합니다.
 */
export function generateNarrationScript(
  analysis: ContentAnalysis,
  style: string,
  duration: number,
): string {
  const tone = STYLE_TONE_MAP[style] || "자연스러운";
  const sceneCount = Math.max(2, Math.min(6, Math.floor(duration / 8)));
  const secondsPerScene = Math.round(duration / sceneCount);

  const lines: string[] = [];

  // 오프닝
  lines.push(`${analysis.title}.`);
  lines.push("");

  // 본문 - 요약 기반
  const summaryParts = analysis.summary
    .split(/[.!?]\s+/)
    .filter((s) => s.trim().length > 5);

  // 데이터 포인트가 있으면 포함
  if (analysis.dataPoints.length > 0) {
    const dpText = analysis.dataPoints
      .slice(0, 3)
      .map((dp) => `${dp.label} ${dp.value}${dp.unit ? ` ${dp.unit}` : ""}`)
      .join(", ");
    lines.push(dpText + ".");
    lines.push("");
  }

  // 요약 문장 분배
  for (let i = 0; i < Math.min(summaryParts.length, sceneCount - 1); i++) {
    const part = summaryParts[i].trim();
    if (part && !part.endsWith(".")) {
      lines.push(part + ".");
    } else if (part) {
      lines.push(part);
    }
    lines.push("");
  }

  // 키워드 강조
  if (analysis.keywords.length > 0) {
    lines.push(analysis.keywords.slice(0, 4).join(", ") + ".");
    lines.push("");
  }

  // 클로징
  lines.push(`${analysis.title}, 지금 확인해보세요.`);

  const script = lines.join("\n").trim();

  // 메타 정보 주석
  return `[톤: ${tone} / ${sceneCount}장면 / 장면당 약 ${secondsPerScene}초]\n\n${script}`;
}
