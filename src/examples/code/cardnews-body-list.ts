import { RemotionExample } from "./index";

export const cardnewsBodyListCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyAnimation = () => {
  /**
   * Card News Body Slide — "list" visual mode (세로 목록)
   * Instagram 4:5 (1080×1350), 3-second animation, 30fps.
   * Top brand stripe, title with word-by-word entrance, numbered items
   * with staggered slide-up, and optional highlight box at bottom.
   * Professional theme.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ═══════════════════════════════════════════
  // CONTENT
  // ═══════════════════════════════════════════

  const SLIDE_NUMBER = "02";
  const TITLE = "디자인 특허의 4가지 핵심 요소";
  const ITEMS = [
    "독창적인 외관 — 기존에 없던 형상·모양·색채 조합",
    "시각적 심미감 — 기능이 아닌 '보는 즐거움' 기준",
    "물품성 — 양산 가능한 구체적 물건에 적용",
    "신규성 — 출원일 기준 공개된 적 없는 디자인",
  ];
  const HIGHLIGHT = "외관이 곧 경쟁력입니다";
  const BRAND_NAME = "BRAND";

  // ═══════════════════════════════════════════
  // COLORS
  // ═══════════════════════════════════════════

  const COLOR_BG = "#fafafa";
  const COLOR_ACCENT = "#3b82f6";
  const COLOR_ACCENT_LIGHT = "#dbeafe";
  const COLOR_TEXT = "#171717";
  const COLOR_TEXT_SECONDARY = "#525252";
  const COLOR_BADGE_TEXT = "#ffffff";
  const COLOR_HIGHLIGHT_BG = "#eff6ff";
  const COLOR_HIGHLIGHT_BORDER = "#3b82f6";

  const FONT = "Pretendard Variable, Inter, system-ui, sans-serif";

  // ═══════════════════════════════════════════
  // SAFE ZONES
  // ═══════════════════════════════════════════

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
  // BRAND STRIPE + SLIDE NUMBER
  // ═══════════════════════════════════════════

  const stripeWidth = interpolate(frame, [0, 15], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const numberEntry = springSnappy(5);

  // ═══════════════════════════════════════════
  // TITLE (word-by-word)
  // ═══════════════════════════════════════════

  const titleWords = TITLE.split(" ");
  const titleElements = titleWords.map((word, i) => {
    const delay = 10 + i * 3;
    const wordEntry = frame >= delay ? springSnappy(delay) : 0;
    const y = interpolate(wordEntry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <span key={i} style={{
        display: "inline-block",
        marginRight: 10,
        opacity: wordEntry,
        transform: \\\`translateY(\\\${y}px)\\\`,
      }}>
        {word}
      </span>
    );
  });

  // ═══════════════════════════════════════════
  // LIST ITEMS (staggered)
  // ═══════════════════════════════════════════

  const itemElements = ITEMS.map((item, i) => {
    const delay = 25 + i * 5;
    const itemEntry = frame >= delay ? springSmooth(delay) : 0;
    const y = interpolate(itemEntry, [0, 1], [25, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
      <div key={i} style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        opacity: itemEntry,
        transform: \\\`translateY(\\\${y}px)\\\`,
      }}>
        {/* Number badge */}
        <div style={{
          minWidth: 36,
          height: 36,
          borderRadius: "50%",
          background: COLOR_ACCENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontSize: 16,
          fontWeight: 700,
          color: COLOR_BADGE_TEXT,
          marginTop: 2,
        }}>
          {i + 1}
        </div>
        {/* Item text */}
        <div style={{
          fontFamily: FONT,
          fontSize: 24,
          fontWeight: 400,
          color: COLOR_TEXT_SECONDARY,
          lineHeight: 1.5,
          flex: 1,
        }}>
          {item}
        </div>
      </div>
    );
  });

  // ═══════════════════════════════════════════
  // HIGHLIGHT BOX
  // ═══════════════════════════════════════════

  const highlightEntry = springSmooth(50);
  const highlightScale = interpolate(highlightEntry, [0, 1], [0.95, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ═══════════════════════════════════════════
  // PAGE INDICATOR
  // ═══════════════════════════════════════════

  const dotsEntry = springSnappy(60);

  return (
    <AbsoluteFill style={{
      background: COLOR_BG,
      fontFamily: FONT,
      overflow: "hidden",
    }}>
      {/* Content with safe zones */}
      <div style={{
        position: "absolute",
        top: SAFE_TOP,
        left: SAFE_SIDES,
        right: SAFE_SIDES,
        bottom: SAFE_BOTTOM,
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Top: accent stripe + slide number */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{
            width: \\\`\\\${stripeWidth * 0.3}%\\\`,
            height: 4,
            background: COLOR_ACCENT,
            borderRadius: 2,
          }} />
          <div style={{
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 600,
            color: COLOR_ACCENT,
            opacity: numberEntry,
            letterSpacing: 2,
          }}>
            {SLIDE_NUMBER}
          </div>
          <div style={{
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 600,
            color: COLOR_TEXT_SECONDARY,
            opacity: numberEntry * 0.6,
            letterSpacing: 3,
            marginLeft: "auto",
          }}>
            {BRAND_NAME}
          </div>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 700,
          color: COLOR_TEXT,
          lineHeight: 1.3,
          marginBottom: 36,
          display: "flex",
          flexWrap: "wrap",
        }}>
          {titleElements}
        </div>

        {/* Items list */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          flex: 1,
        }}>
          {itemElements}
        </div>

        {/* Highlight box */}
        <div style={{
          marginTop: 28,
          padding: "20px 24px",
          background: COLOR_HIGHLIGHT_BG,
          borderLeft: \\\`4px solid \\\${COLOR_HIGHLIGHT_BORDER}\\\`,
          borderRadius: 12,
          opacity: highlightEntry,
          transform: \\\`scale(\\\${highlightScale})\\\`,
        }}>
          <div style={{
            fontFamily: FONT,
            fontSize: 22,
            fontWeight: 600,
            color: COLOR_ACCENT,
          }}>
            💡 {HIGHLIGHT}
          </div>
        </div>

        {/* Page indicator dots */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 24,
          opacity: dotsEntry,
        }}>
          {[0, 1, 2, 3, 4].map((dot) => (
            <div key={dot} style={{
              width: dot === 1 ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: dot === 1 ? COLOR_ACCENT : "#d4d4d4",
            }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const cardnewsBodyListExample: RemotionExample = {
  id: "cardnews-body-list",
  name: "카드뉴스 본문 (목록형)",
  description:
    "인스타 카드뉴스 본문 list 모드. 번호 뱃지 + 순차 slide-up 애니메이션, 강조 박스, 페이지 인디케이터",
  code: cardnewsBodyListCode,
  durationInFrames: 90,
  fps: 30,
  category: "Other",
};
