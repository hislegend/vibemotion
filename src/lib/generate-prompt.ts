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

const STYLE_DESCRIPTIONS: Record<string, string> = {
  infographic:
    "데이터 시각화 중심 모션 그래픽. 차트, 그래프, 숫자 애니메이션을 활용한 정보 전달형 영상.",
  presenter:
    "프레젠터 스타일 영상. 중앙 텍스트와 서포팅 비주얼로 설명하는 형식.",
  cinematic:
    "시네마틱 스토리텔링 영상. 드라마틱한 전환, 영화적 색감, 감성적 연출.",
  showcase:
    "제품/서비스 쇼케이스 영상. 세련된 애니메이션으로 특징을 부각하는 형식.",
  social:
    "SNS 숏폼 최적화 영상. 빠른 전환, 굵은 텍스트, 시선을 사로잡는 트렌디한 포맷.",
};

export function generateRemotionPrompt(
  analysis: ContentAnalysis,
  style: string,
  duration: number,
): string {
  const fps = 30;
  const totalFrames = duration * fps;
  const styleDesc = STYLE_DESCRIPTIONS[style] || style;

  const dataSection =
    analysis.dataPoints.length > 0
      ? `\n핵심 데이터:\n${analysis.dataPoints.map((d) => `- ${d.label}: ${d.value}${d.unit ? ` ${d.unit}` : ""}`).join("\n")}`
      : "";

  const entitySection =
    analysis.entities.length > 0
      ? `\n주요 키워드: ${analysis.entities.map((e) => e.name).join(", ")}`
      : "";

  return `${analysis.title}

${analysis.summary}
${dataSection}
${entitySection}

스타일: ${styleDesc}
톤: ${analysis.tone}
키워드: ${analysis.keywords.join(", ")}

CRITICAL — 영상 길이: 정확히 ${duration}초 (${totalFrames}프레임, ${fps}fps)
비율: 9:16 (세로형)

위 내용을 기반으로 ${style} 스타일의 모션 그래픽을 만들어주세요.
데이터 포인트는 숫자 애니메이션으로, 키워드는 타이포그래피로 강조해주세요.

IMPORTANT: The Remotion Player will use exactly ${totalFrames} durationInFrames. Your animation MUST use the full ${totalFrames} frames. Plan ${Math.max(3, Math.floor(duration / 8))} scenes, each scene lasting ~${Math.round(totalFrames / Math.max(3, Math.floor(duration / 8)))} frames. Do NOT use durationInFrames less than ${totalFrames} in your code.`.trim();
}
