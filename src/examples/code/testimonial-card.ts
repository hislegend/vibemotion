import { RemotionExample } from "./index";

export const testimonialCardCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyAnimation = () => {
  /**
   * Elegant customer testimonial card on warm beige background.
   * Large quote icon springs in, review text appears with typing effect,
   * 5 stars stagger in with scale spring, then customer name fades in.
   * Minimal, premium aesthetic.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ═══════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════

  const TEXT_REVIEW = "This product completely transformed how I work. The attention to detail is remarkable, and the support team is world-class.";
  const TEXT_CUSTOMER = "Sarah Chen";
  const TEXT_TITLE = "Head of Design, Acme Inc.";

  const COLOR_BG_1 = "#fefcf3";
  const COLOR_BG_2 = "#fef3c7";
  const COLOR_CARD = "#ffffff";
  const COLOR_QUOTE = "#d97706";
  const COLOR_STAR = "#f59e0b";
  const COLOR_STAR_BG = "#e5e7eb";
  const COLOR_TEXT_DARK = "#1c1917";
  const COLOR_TEXT_MID = "#57534e";
  const COLOR_TEXT_LIGHT = "#a8a29e";
  const COLOR_ACCENT = "#92400e";
  const COLOR_LINE = "#d6d3d1";

  const FONT_FAMILY = "Inter, system-ui, sans-serif";

  const TIMING_QUOTE_ICON = 10;
  const TIMING_TYPING_START = 30;
  const TIMING_TYPING_END = 140;
  const TIMING_STARS_START = 155;
  const TIMING_NAME_START = 195;
  const TIMING_TITLE_START = 210;

  // ═══════════════════════════════════════════
  // SPRING HELPERS
  // ═══════════════════════════════════════════

  const springAt = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 30 });

  // ═══════════════════════════════════════════
  // QUOTE ICON
  // ═══════════════════════════════════════════

  const quoteEntry = springAt(TIMING_QUOTE_ICON);
  const quoteScale = interpolate(quoteEntry, [0, 1], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const quoteY = interpolate(quoteEntry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ═══════════════════════════════════════════
  // TYPING EFFECT
  // ═══════════════════════════════════════════

  const typingProgress = interpolate(frame, [TIMING_TYPING_START, TIMING_TYPING_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const charsToShow = Math.floor(typingProgress * TEXT_REVIEW.length);
  const cursorBlink = Math.sin(frame * 0.25) > 0 ? 1 : 0;
  const showCursor = frame >= TIMING_TYPING_START && frame <= TIMING_TYPING_END + 20;

  // ═══════════════════════════════════════════
  // STARS
  // ═══════════════════════════════════════════

  const stars = Array.from({ length: 5 }, (_, i) => {
    const delay = TIMING_STARS_START + i * 6;
    const starEntry = frame >= delay ? springAt(delay) : 0;
    const starScale = interpolate(starEntry, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div key={i} style={{
        fontSize: 28,
        color: COLOR_STAR,
        transform: \\\`scale(\\\${starScale})\\\`,
        opacity: starEntry,
      }}>
        ★
      </div>
    );
  });

  // ═══════════════════════════════════════════
  // CUSTOMER INFO
  // ═══════════════════════════════════════════

  const nameEntry = frame >= TIMING_NAME_START ? springAt(TIMING_NAME_START) : 0;
  const titleEntry = frame >= TIMING_TITLE_START ? springAt(TIMING_TITLE_START) : 0;

  // ═══════════════════════════════════════════
  // CARD ENTRY
  // ═══════════════════════════════════════════

  const cardEntry = springAt(3);
  const cardScale = interpolate(cardEntry, [0, 1], [0.95, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardY = interpolate(cardEntry, [0, 1], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ═══════════════════════════════════════════
  // DECORATIVE ELEMENTS
  // ═══════════════════════════════════════════

  const lineWidth = interpolate(frame, [TIMING_STARS_START, TIMING_STARS_START + 40], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: \\\`linear-gradient(170deg, \\\${COLOR_BG_1} 0%, \\\${COLOR_BG_2} 100%)\\\`,
      fontFamily: FONT_FAMILY,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Card */}
      <div style={{
        width: width * 0.82,
        padding: "48px 36px",
        borderRadius: 24,
        background: COLOR_CARD,
        boxShadow: "0 4px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        transform: \\\`translateY(\\\${cardY}px) scale(\\\${cardScale})\\\`,
        opacity: cardEntry,
      }}>
        {/* Quote icon */}
        <div style={{
          fontSize: 64,
          color: COLOR_QUOTE,
          lineHeight: 1,
          opacity: quoteEntry,
          transform: \\\`scale(\\\${quoteScale}) translateY(\\\${quoteY}px)\\\`,
        }}>
          \u201C
        </div>

        {/* Review text */}
        <div style={{
          fontFamily: FONT_FAMILY,
          fontSize: 22,
          lineHeight: 1.6,
          color: COLOR_TEXT_DARK,
          textAlign: "center",
          maxWidth: "90%",
          minHeight: 100,
          fontWeight: 400,
        }}>
          {TEXT_REVIEW.slice(0, charsToShow)}
          {showCursor && <span style={{ opacity: cursorBlink, color: COLOR_QUOTE, fontWeight: 300 }}>|</span>}
        </div>

        {/* Divider line */}
        <div style={{
          width: \\\`\\\${lineWidth}%\\\`,
          height: 1,
          background: COLOR_LINE,
          marginTop: 8,
          marginBottom: 8,
        }} />

        {/* Stars */}
        <div style={{ display: "flex", gap: 8 }}>
          {stars}
        </div>

        {/* Customer info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 8 }}>
          <div style={{
            fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 700, color: COLOR_TEXT_DARK,
            opacity: nameEntry,
            transform: \\\`translateY(\\\${interpolate(nameEntry, [0, 1], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\`,
          }}>
            {TEXT_CUSTOMER}
          </div>
          <div style={{
            fontFamily: FONT_FAMILY, fontSize: 14, color: COLOR_TEXT_LIGHT, fontWeight: 400,
            opacity: titleEntry,
            transform: \\\`translateY(\\\${interpolate(titleEntry, [0, 1], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\`,
          }}>
            {TEXT_TITLE}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const testimonialCardExample: RemotionExample = {
  id: "testimonial-card",
  name: "Testimonial Card",
  description:
    "Elegant customer testimonial on warm beige with spring-animated quote icon, typing review text, staggered star ratings, and smooth name/title fade-in. Minimal premium aesthetic.",
  code: testimonialCardCode,
  durationInFrames: 270,
  fps: 30,
  category: "Other",
};
