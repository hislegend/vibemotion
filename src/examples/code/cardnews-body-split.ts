import { RemotionExample } from "./index";

export const cardnewsBodySplitCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyAnimation = () => {
  /**
   * Card News Body Slide — "split" visual mode (2열 비교)
   * Instagram 4:5 (1080×1350), 3-second animation, 30fps.
   * Side-by-side comparison layout with divider line draw,
   * left column (negative/before) vs right column (positive/after).
   * Professional theme.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ═══════════════════════════════════════════
  // CONTENT
  // ═══════════════════════════════════════════

  const SLIDE_NUMBER = "04";
  const TITLE = "디자인 보호 전 vs 후";
  const BRAND_NAME = "BRAND";

  const LEFT_LABEL = "BEFORE";
  const LEFT_ITEMS = [
    "경쟁사가 외관을 그대로 복제",
    "시장에서 브랜드 혼동 발생",
    "법적 대응 수단 없음",
  ];

  const RIGHT_LABEL = "AFTER";
  const RIGHT_ITEMS = [
    "디자인권으로 즉시 침해 차단",
    "독보적 브랜드 아이덴티티",
    "손해배상 + 판매금지 청구 가능",
  ];

  // ═══════════════════════════════════════════
  // COLORS
  // ═══════════════════════════════════════════

  const COLOR_BG = "#fafafa";
  const COLOR_ACCENT = "#3b82f6";
  const COLOR_TEXT = "#171717";
  const COLOR_TEXT_SECONDARY = "#525252";
  const COLOR_LEFT_ACCENT = "#ef4444";
  const COLOR_LEFT_BG = "#fef2f2";
  const COLOR_RIGHT_ACCENT = "#22c55e";
  const COLOR_RIGHT_BG = "#f0fdf4";
  const COLOR_DIVIDER = "#e5e5e5";

  const FONT = "Pretendard Variable, Inter, system-ui, sans-serif";

  const SAFE_TOP = 60;
  const SAFE_BOTTOM = 80;
  const SAFE_SIDES = 48;

  // ═══════════════════════════════════════════
  // SPRINGS
  // ═══════════════════════════════════════════

  const springSnappy = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 15, stiffness: 200 }, durationInFrames: 25 });

  const springSmooth = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 120 }, durationInFrames: 30 });

  // ═══════════════════════════════════════════
  // TOP BAR
  // ═══════════════════════════════════════════

  const stripeWidth = interpolate(frame, [0, 15], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const numberEntry = springSnappy(5);

  // ═══════════════════════════════════════════
  // TITLE
  // ═══════════════════════════════════════════

  const titleEntry = springSnappy(10);
  const titleY = interpolate(titleEntry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ═══════════════════════════════════════════
  // DIVIDER LINE (draw from top)
  // ═══════════════════════════════════════════

  const dividerHeight = interpolate(frame, [18, 45], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ═══════════════════════════════════════════
  // LEFT COLUMN
  // ═══════════════════════════════════════════

  const leftLabelEntry = springSnappy(20);
  const leftItems = LEFT_ITEMS.map((item, i) => {
    const delay = 28 + i * 5;
    const entry = frame >= delay ? springSmooth(delay) : 0;
    const y = interpolate(entry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div key={i} style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        opacity: entry,
        transform: \\\`translateY(\\\${y}px)\\\`,
      }}>
        <span style={{ color: COLOR_LEFT_ACCENT, fontSize: 20, marginTop: 2 }}>✕</span>
        <span style={{
          fontFamily: FONT,
          fontSize: 22,
          fontWeight: 400,
          color: COLOR_TEXT_SECONDARY,
          lineHeight: 1.5,
        }}>
          {item}
        </span>
      </div>
    );
  });

  // ═══════════════════════════════════════════
  // RIGHT COLUMN
  // ═══════════════════════════════════════════

  const rightLabelEntry = springSnappy(24);
  const rightItems = RIGHT_ITEMS.map((item, i) => {
    const delay = 35 + i * 5;
    const entry = frame >= delay ? springSmooth(delay) : 0;
    const y = interpolate(entry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div key={i} style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        opacity: entry,
        transform: \\\`translateY(\\\${y}px)\\\`,
      }}>
        <span style={{ color: COLOR_RIGHT_ACCENT, fontSize: 20, marginTop: 2 }}>✓</span>
        <span style={{
          fontFamily: FONT,
          fontSize: 22,
          fontWeight: 400,
          color: COLOR_TEXT_SECONDARY,
          lineHeight: 1.5,
        }}>
          {item}
        </span>
      </div>
    );
  });

  // ═══════════════════════════════════════════
  // PAGE INDICATOR
  // ═══════════════════════════════════════════

  const dotsEntry = springSnappy(60);

  const contentWidth = width - SAFE_SIDES * 2;
  const columnWidth = (contentWidth - 24) / 2; // 24px gap for divider

  return (
    <AbsoluteFill style={{
      background: COLOR_BG,
      fontFamily: FONT,
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: SAFE_TOP,
        left: SAFE_SIDES,
        right: SAFE_SIDES,
        bottom: SAFE_BOTTOM,
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{
            width: \\\`\\\${stripeWidth * 0.3}%\\\`,
            height: 4,
            background: COLOR_ACCENT,
            borderRadius: 2,
          }} />
          <div style={{
            fontFamily: FONT, fontSize: 16, fontWeight: 600,
            color: COLOR_ACCENT, opacity: numberEntry, letterSpacing: 2,
          }}>
            {SLIDE_NUMBER}
          </div>
          <div style={{
            fontFamily: FONT, fontSize: 14, fontWeight: 600,
            color: COLOR_TEXT_SECONDARY, opacity: numberEntry * 0.6,
            letterSpacing: 3, marginLeft: "auto",
          }}>
            {BRAND_NAME}
          </div>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: FONT, fontSize: 32, fontWeight: 700,
          color: COLOR_TEXT, lineHeight: 1.3, marginBottom: 36,
          opacity: titleEntry,
          transform: \\\`translateY(\\\${titleY}px)\\\`,
        }}>
          {TITLE}
        </div>

        {/* Comparison columns */}
        <div style={{
          display: "flex",
          flex: 1,
          gap: 0,
          position: "relative",
        }}>
          {/* Left column */}
          <div style={{
            width: columnWidth,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingRight: 20,
          }}>
            {/* Label */}
            <div style={{
              fontFamily: FONT, fontSize: 16, fontWeight: 700,
              color: COLOR_LEFT_ACCENT, letterSpacing: 3,
              opacity: leftLabelEntry,
              padding: "8px 16px",
              background: COLOR_LEFT_BG,
              borderRadius: 8,
              alignSelf: "flex-start",
              marginBottom: 8,
            }}>
              {LEFT_LABEL}
            </div>
            {leftItems}
          </div>

          {/* Center divider */}
          <div style={{
            width: 1,
            background: COLOR_DIVIDER,
            alignSelf: "stretch",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: \\\`\\\${dividerHeight}%\\\`,
              background: \\\`linear-gradient(\\\${COLOR_LEFT_ACCENT}40, \\\${COLOR_RIGHT_ACCENT}40)\\\`,
            }} />
          </div>

          {/* Right column */}
          <div style={{
            width: columnWidth,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingLeft: 20,
          }}>
            {/* Label */}
            <div style={{
              fontFamily: FONT, fontSize: 16, fontWeight: 700,
              color: COLOR_RIGHT_ACCENT, letterSpacing: 3,
              opacity: rightLabelEntry,
              padding: "8px 16px",
              background: COLOR_RIGHT_BG,
              borderRadius: 8,
              alignSelf: "flex-start",
              marginBottom: 8,
            }}>
              {RIGHT_LABEL}
            </div>
            {rightItems}
          </div>
        </div>

        {/* Page indicator */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 24,
          opacity: dotsEntry,
        }}>
          {[0, 1, 2, 3, 4].map((dot) => (
            <div key={dot} style={{
              width: dot === 3 ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: dot === 3 ? COLOR_ACCENT : "#d4d4d4",
            }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const cardnewsBodySplitExample: RemotionExample = {
  id: "cardnews-body-split",
  name: "카드뉴스 본문 (비교형)",
  description:
    "인스타 카드뉴스 본문 split 모드. 2열 비교 레이아웃, 구분선 draw 애니메이션, Before/After 대비",
  code: cardnewsBodySplitCode,
  durationInFrames: 90,
  fps: 30,
  category: "Other",
};
