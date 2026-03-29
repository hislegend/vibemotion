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
  infographic: `데이터 시각화 중심 모션 그래픽.

차트 구현 패턴 (공식):
- 바 차트: stagger delay(5프레임 간격) + spring({ damping: 200 }) — 순차 등장
- 파이 차트: stroke-dashoffset 애니메이션 + rotate(-90) 12시 시작
- 서드파티 차트 라이브러리 자체 애니메이션 비활성화 필수 (깜빡임)
- 모든 애니메이션은 useCurrentFrame()에서 직접 드라이브

인포그래픽 디자인 원칙:
- 숫자와 데이터가 주인공. 숫자는 72~120px로 매우 크게, 라벨은 24~32px로 보조
- 시원시원한 레이아웃: 요소 하나하나가 크고 명확하게 보여야 함
- 차트/그래프는 화면의 40~60%를 차지하는 큰 덩어리로
- 숫자 카운트업 애니메이션 필수 (spring으로 0→목표값)
- 데이터 포인트는 카드/패널 안에 배치, 떠다니는 텍스트 금지
- 색상으로 데이터 카테고리를 구획 (각 데이터에 다른 accent 색)
- 여백은 "시원한 여백"으로 활용 — 빽빽하게 채우지 말고 핵심 숫자를 돋보이게
- 씬당 데이터 포인트 최대 3~4개 (과부하 금지)
- 큰 숫자 → 작은 라벨 → 보조 설명 순으로 시각 위계 명확하게`,
  presenter:
    "프레젠터 스타일 영상. 중앙 텍스트와 서포팅 비주얼로 설명하는 형식.",
  cinematic:
    "시네마틱 스토리텔링 영상. 드라마틱한 전환, 영화적 색감, 감성적 연출.",
  showcase:
    "제품/서비스 쇼케이스 영상. 세련된 애니메이션으로 특징을 부각하는 형식.",
  social:
    "SNS 숏폼 최적화 영상. 빠른 전환, 굵은 텍스트, 시선을 사로잡는 트렌디한 포맷.",
};

const DENSITY_GUIDE: Record<string, string> = {
  short: `콘텐츠 밀도: 짧게 (8~15초)
- 핵심 메시지만 빠르게 전달
- 씬 2~3개, 각 씬 4~6초
- 텍스트 최소화, 임팩트 극대화`,
  normal: `콘텐츠 밀도: 보통 (15~30초)
- 적절한 분량으로 정보 전달
- 씬 3~4개, 각 씬 5~8초
- 핵심 포인트 + 서포팅 정보`,
  long: `콘텐츠 밀도: 길게 (30~60초)
- 상세한 정보 전달
- 씬 4~6개, 각 씬 8~12초
- 데이터, 사례, 설명을 풍부하게`,
};

export function generateRemotionPrompt(
  analysis: ContentAnalysis,
  style: string,
  duration: number,
  density?: string,
): string {
  const fps = 30;
  const totalFrames = duration * fps;
  const styleDesc = STYLE_DESCRIPTIONS[style] || style;
  const densityGuide = DENSITY_GUIDE[density || "normal"] || DENSITY_GUIDE.normal;

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

${densityGuide}

먼저 아래 형식으로 텍스트 콘티를 내부적으로 계획해:
- 씬 1: [타입] — [제목] — [핵심 텍스트 1~2줄]
- 씬 2: [타입] — [제목] — [핵심 텍스트 1~2줄]
...
그 콘티를 기반으로 Remotion React 코드를 생성해.
콘티의 텍스트량이 영상 길이를 결정한다.

영상 길이 가이드: 약 ${duration}초 (${totalFrames}프레임, ${fps}fps)
비율: 9:16 (세로형, 1080×1920)

9:16 세로형 필수 규칙:
- 글자 크기: 타이틀 64-96px, 본문 32-44px. 작은 글자 금지.
- 화면의 80-90%를 콘텐츠로 채울 것. 빈 공간 30% 이상이면 실패.
- 카드/패널은 화면 너비의 90%+. 작은 카드를 중앙에 띄우지 말 것.
- 패딩: 좌우 최대 48px, 상하 60px. 과도한 여백 금지.
- 세로로 요소를 꽉 채워서 스택할 것. 갭은 16-24px.
- 모바일에서 바로 읽을 수 있는 크기로.

위 내용을 기반으로 ${style} 스타일의 모션 그래픽을 만들어주세요.
데이터 포인트는 숫자 애니메이션으로, 키워드는 타이포그래피로 강조해주세요.

콘텐츠 양에 맞춰 씬 수와 시간을 자율 판단하되, ${densityGuide.split("\n")[0]}을 따라라.`.trim();
}
