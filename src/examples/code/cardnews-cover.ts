import { RemotionExample } from "./index";

export const cardnewsCoverCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyAnimation = () => {
  /**
   * Card News Cover Slide (표지) — Instagram 4:5 (1080×1350)
   * Dark gradient background with brand mark, tag pill, headline with
   * accent keyword highlight, and subtle subtitle. Static PNG output.
   * Professional theme.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ═══════════════════════════════════════════
  // CONTENT
  // ═══════════════════════════════════════════

  const TAG = "EP.3 디자인 전략";
  const HEADLINE_PARTS = [
    { text: "경쟁사가 제일 먼저\\n베끼는 건 ", highlight: false },
    { text: "기술", highlight: true },
    { text: "이\\n아닙니다", highlight: false },
  ];
  const SUBTITLE = "디자인 특허로 브랜드를 지키는 법";
  const BRAND_NAME = "BRAND";

  // ═══════════════════════════════════════════
  // COLORS
  // ═══════════════════════════════════════════

  const COLOR_BG_START = "#1e293b";
  const COLOR_BG_END = "#0f172a";
  const COLOR_ACCENT = "#3b82f6";
  const COLOR_ACCENT_LIGHT = "#dbeafe";
  const COLOR_TEXT = "#ffffff";
  const COLOR_TEXT_DIM = "rgba(255,255,255,0.7)";
  const COLOR_TAG_BG = "rgba(59,130,246,0.15)";
  const COLOR_TAG_BORDER = "rgba(59,130,246,0.4)";

  const FONT = "Pretendard Variable, Inter, system-ui, sans-serif";

  // ═══════════════════════════════════════════
  // SAFE ZONES
  // ═══════════════════════════════════════════

  const SAFE_TOP = 60;
  const SAFE_BOTTOM = 80;
  const SAFE_SIDES = 48;

  // ═══════════════════════════════════════════
  // ANIMATIONS
  // ═══════════════════════════════════════════

  const springAt = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 15, stiffness: 200 }, durationInFrames: 30 });

  // Brand mark
  const brandEntry = springAt(5);

  // Tag pill
  const tagEntry = springAt(12);
  const tagY = interpolate(tagEntry, [0, 1], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Headline words stagger
  const headlineEntry = springAt(20);
  const headlineY = interpolate(headlineEntry, [0, 1], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtitle
  const subEntry = springAt(40);
  const subY = interpolate(subEntry, [0, 1], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Bottom accent line
  const lineWidth = interpolate(frame, [35, 60], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: \\\`linear-gradient(170deg, \\\${COLOR_BG_START} 0%, \\\${COLOR_BG_END} 100%)\\\`,
      fontFamily: FONT,
      overflow: "hidden",
    }}>
      {/* Decorative gradient circle */}
      <div style={{
        position: "absolute",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: \\\`radial-gradient(circle, \\\${COLOR_ACCENT}15, transparent 70%)\\\`,
        top: "20%",
        right: "-10%",
        filter: "blur(60px)",
      }} />

      {/* Content container with safe zones */}
      <div style={{
        position: "absolute",
        top: SAFE_TOP,
        left: SAFE_SIDES,
        right: SAFE_SIDES,
        bottom: SAFE_BOTTOM,
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Brand mark — top left */}
        <div style={{
          fontFamily: FONT,
          fontSize: 18,
          fontWeight: 700,
          color: COLOR_TEXT,
          letterSpacing: 4,
          opacity: brandEntry,
        }}>
          {BRAND_NAME}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Tag pill */}
        <div style={{
          alignSelf: "flex-start",
          padding: "8px 20px",
          borderRadius: 100,
          background: COLOR_TAG_BG,
          border: \\\`1px solid \\\${COLOR_TAG_BORDER}\\\`,
          fontFamily: FONT,
          fontSize: 20,
          fontWeight: 600,
          color: COLOR_ACCENT_LIGHT,
          letterSpacing: 1,
          opacity: tagEntry,
          transform: \\\`translateY(\\\${tagY}px)\\\`,
          marginBottom: 24,
        }}>
          {TAG}
        </div>

        {/* Headline */}
        <div style={{
          fontFamily: FONT,
          fontSize: 56,
          fontWeight: 800,
          lineHeight: 1.2,
          color: COLOR_TEXT,
          opacity: headlineEntry,
          transform: \\\`translateY(\\\${headlineY}px)\\\`,
          marginBottom: 20,
        }}>
          {HEADLINE_PARTS.map((part, i) => (
            part.highlight ? (
              <span key={i} style={{
                background: COLOR_ACCENT,
                color: COLOR_TEXT,
                padding: "2px 12px",
                borderRadius: 6,
                display: "inline",
              }}>
                {part.text}
              </span>
            ) : (
              <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part.text}</span>
            )
          ))}
        </div>

        {/* Subtitle */}
        <div style={{
          fontFamily: FONT,
          fontSize: 24,
          fontWeight: 400,
          color: COLOR_TEXT_DIM,
          opacity: subEntry,
          transform: \\\`translateY(\\\${subY}px)\\\`,
          marginBottom: 32,
        }}>
          {SUBTITLE}
        </div>

        {/* Bottom accent line */}
        <div style={{
          width: \\\`\\\${lineWidth}%\\\`,
          height: 3,
          background: \\\`linear-gradient(90deg, \\\${COLOR_ACCENT}, transparent)\\\`,
          borderRadius: 2,
        }} />
      </div>
    </AbsoluteFill>
  );
};`;

export const cardnewsCoverExample: RemotionExample = {
  id: "cardnews-cover",
  name: "카드뉴스 표지",
  description:
    "인스타 카드뉴스 표지 슬라이드. 다크 그라데이션 배경, 태그 필, 헤드라인 accent 하이라이트, 브랜드 마크",
  code: cardnewsCoverCode,
  durationInFrames: 90,
  fps: 30,
  category: "Other",
};
