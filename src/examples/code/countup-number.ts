import { RemotionExample } from "./index";

export const countupNumberCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyAnimation = () => {
  /**
   * Impact number showcase with indigo-to-violet gradient (Crabs brand style).
   * Three large numbers count up from 0 to target values with interpolate,
   * each with a label below. Highlight underline springs in on completion.
   * 9:16 vertical layout.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ═══════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════

  const COLOR_BG_1 = "#312e81";
  const COLOR_BG_2 = "#5b21b6";
  const COLOR_ACCENT = "#a78bfa";
  const COLOR_HIGHLIGHT = "#fbbf24";
  const COLOR_TEXT_LIGHT = "#ffffff";
  const COLOR_TEXT_DIM = "#c4b5fd";
  const COLOR_CARD_BG = "rgba(255,255,255,0.06)";
  const COLOR_CARD_BORDER = "rgba(255,255,255,0.1)";

  const FONT_FAMILY = "Inter, system-ui, sans-serif";

  const HEADING_TEXT = "Our Impact";

  const DATA_ITEMS = [
    { target: 12500, label: "Users", prefix: "", suffix: "+", delay: 20 },
    { target: 2.4, label: "Revenue", prefix: "$", suffix: "M", delay: 35, decimals: 1 },
    { target: 340, label: "Growth", prefix: "", suffix: "%", delay: 50 },
  ];

  const TIMING_HEADING = 5;
  const TIMING_COUNT_START = 20;
  const TIMING_COUNT_END = 140;
  const TIMING_HIGHLIGHT_START = 155;

  // ═══════════════════════════════════════════
  // SPRING HELPERS
  // ═══════════════════════════════════════════

  const springAt = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 30 });

  // ═══════════════════════════════════════════
  // HEADING
  // ═══════════════════════════════════════════

  const headingEntry = springAt(TIMING_HEADING);
  const headingY = interpolate(headingEntry, [0, 1], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ═══════════════════════════════════════════
  // DECORATIVE PARTICLES
  // ═══════════════════════════════════════════

  const particles = Array.from({ length: 12 }, (_, i) => {
    const x = ((i * 137.5 + 10) % 100);
    const y = ((i * 89.3 + 5) % 100);
    const size = 4 + (i % 3) * 3;
    const delay = 10 + i * 6;
    const opacity = frame > delay
      ? interpolate(frame - delay, [0, 25, 70, 90], [0, 0.15, 0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 0;
    return <div key={i} style={{ position: "absolute", left: \\\`\${x}%\\\`, top: \\\`\${y}%\\\`, width: size, height: size, borderRadius: "50%", background: COLOR_ACCENT, opacity, filter: "blur(1px)" }} />;
  });

  // ═══════════════════════════════════════════
  // DATA CARDS
  // ═══════════════════════════════════════════

  const dataCards = DATA_ITEMS.map((item, i) => {
    const cardEntry = springAt(item.delay);
    const cardY = interpolate(cardEntry, [0, 1], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const countProgress = interpolate(frame, [TIMING_COUNT_START + item.delay, TIMING_COUNT_END + item.delay * 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const currentValue = item.decimals
      ? (countProgress * item.target).toFixed(item.decimals)
      : Math.round(countProgress * item.target).toLocaleString();

    const highlightDelay = TIMING_HIGHLIGHT_START + i * 10;
    const highlightEntry = frame >= highlightDelay ? springAt(highlightDelay) : 0;
    const highlightWidth = interpolate(highlightEntry, [0, 1], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const highlightGlow = interpolate(highlightEntry, [0, 1], [0, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
      <div key={i} style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        padding: "32px 24px",
        borderRadius: 20,
        background: COLOR_CARD_BG,
        border: \\\`1px solid \${COLOR_CARD_BORDER}\\\`,
        backdropFilter: "blur(8px)",
        opacity: cardEntry,
        transform: \\\`translateY(\${cardY}px)\\\`,
        width: width * 0.72,
      }}>
        <div style={{
          fontFamily: FONT_FAMILY, fontSize: 56, fontWeight: 900, color: COLOR_TEXT_LIGHT,
          letterSpacing: -2,
        }}>
          {item.prefix}{currentValue}{item.suffix}
        </div>
        <div style={{
          width: \\\`\${highlightWidth}%\\\`,
          height: 3,
          borderRadius: 2,
          background: COLOR_HIGHLIGHT,
          boxShadow: \\\`0 0 \${highlightGlow}px \${COLOR_HIGHLIGHT}\\\`,
        }} />
        <div style={{
          fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: 500, color: COLOR_TEXT_DIM,
          letterSpacing: 3, textTransform: "uppercase",
        }}>
          {item.label}
        </div>
      </div>
    );
  });

  return (
    <AbsoluteFill style={{
      background: \\\`linear-gradient(160deg, \${COLOR_BG_1}, \${COLOR_BG_2})\\\`,
      fontFamily: FONT_FAMILY,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 28,
    }}>
      {particles}

      {/* Heading */}
      <div style={{
        fontFamily: FONT_FAMILY, fontSize: 44, fontWeight: 800, color: COLOR_TEXT_LIGHT,
        opacity: headingEntry,
        transform: \\\`translateY(\${headingY}px)\\\`,
        marginBottom: 12,
        letterSpacing: -1,
      }}>
        {HEADING_TEXT}
      </div>

      {dataCards}
    </AbsoluteFill>
  );
};`;

export const countupNumberExample: RemotionExample = {
  id: "countup-number",
  name: "임팩트 숫자",
  description:
    "숫자 카운트업 + 글래스 카드 + 하이라이트. 매출/유저/성장률 등 핵심 지표 강조",
  code: countupNumberCode,
  durationInFrames: 270,
  fps: 30,
  category: "Other",
};
