import { RemotionExample } from "./index";

export const productLaunchCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyAnimation = () => {
  /**
   * Product launch countdown with dark navy/deep purple gradient.
   * Features bouncing countdown numbers (3, 2, 1), product name reveal
   * with glow typing effect, and 30 sparkle particles. Dramatic and cinematic.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ═══════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════

  const PRODUCT_NAME = "NovaPro";
  const TAGLINE = "The future is here";
  const COMING_SOON_TEXT = "Coming Soon";

  const COLOR_BG_1 = "#0f172a";
  const COLOR_BG_2 = "#1e1b4b";
  const COLOR_ACCENT = "#8b5cf6";
  const COLOR_GLOW = "#a78bfa";
  const COLOR_TEXT_LIGHT = "#ffffff";
  const COLOR_TEXT_DIM = "#94a3b8";
  const COLOR_SPARKLE_1 = "#fbbf24";
  const COLOR_SPARKLE_2 = "#a78bfa";
  const COLOR_SPARKLE_3 = "#38bdf8";

  const FONT_FAMILY = "Inter, system-ui, sans-serif";

  // Timing (frames)
  const TIMING_COMING_SOON_IN = 0;
  const TIMING_COMING_SOON_OUT = 50;
  const TIMING_COUNT_3 = 60;
  const TIMING_COUNT_2 = 100;
  const TIMING_COUNT_1 = 140;
  const TIMING_REVEAL_START = 180;
  const TIMING_TAGLINE = 220;
  const TIMING_SPARKLE_BURST = 190;

  // ═══════════════════════════════════════════
  // SPRING HELPERS
  // ═══════════════════════════════════════════

  const springAt = (delay: number, damping = 14, stiffness = 100) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping, stiffness }, durationInFrames: 30 });

  const springBounce = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 25 });

  // ═══════════════════════════════════════════
  // COMING SOON
  // ═══════════════════════════════════════════

  const comingSoonIn = springAt(TIMING_COMING_SOON_IN);
  const comingSoonOut = frame >= TIMING_COMING_SOON_OUT
    ? interpolate(frame, [TIMING_COMING_SOON_OUT, TIMING_COMING_SOON_OUT + 15], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // ═══════════════════════════════════════════
  // COUNTDOWN NUMBERS
  // ═══════════════════════════════════════════

  const countdownNumber = (num: number, startFrame: number) => {
    const entryProgress = frame >= startFrame ? springBounce(startFrame) : 0;
    const exitFrame = startFrame + 30;
    const exitProgress = frame >= exitFrame
      ? interpolate(frame, [exitFrame, exitFrame + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 1;
    const scale = interpolate(entryProgress, [0, 1], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const opacity = entryProgress * exitProgress;

    return (
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        opacity,
        transform: \\\`scale(\\\${scale})\\\`,
      }}>
        <div style={{
          fontFamily: FONT_FAMILY, fontSize: 200, fontWeight: 900, color: COLOR_TEXT_LIGHT,
          textShadow: \\\`0 0 60px \\\${COLOR_GLOW}, 0 0 120px \\\${COLOR_ACCENT}40\\\`,
        }}>
          {num}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════
  // PRODUCT NAME REVEAL (TYPING + GLOW)
  // ═══════════════════════════════════════════

  const revealProgress = frame >= TIMING_REVEAL_START
    ? interpolate(frame, [TIMING_REVEAL_START, TIMING_REVEAL_START + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const charsToShow = Math.floor(revealProgress * PRODUCT_NAME.length);
  const revealOpacity = frame >= TIMING_REVEAL_START ? springAt(TIMING_REVEAL_START) : 0;
  const cursorBlink = Math.sin(frame * 0.3) > 0 ? 1 : 0;
  const showCursor = frame >= TIMING_REVEAL_START && charsToShow < PRODUCT_NAME.length;

  const glowIntensity = interpolate(revealProgress, [0.8, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ═══════════════════════════════════════════
  // TAGLINE
  // ═══════════════════════════════════════════

  const taglineEntry = frame >= TIMING_TAGLINE ? springAt(TIMING_TAGLINE) : 0;

  // ═══════════════════════════════════════════
  // SPARKLE PARTICLES
  // ═══════════════════════════════════════════

  const sparkleColors = [COLOR_SPARKLE_1, COLOR_SPARKLE_2, COLOR_SPARKLE_3];
  const sparkles = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * Math.PI * 2;
    const radius = 80 + (i % 5) * 60;
    const cx = 50 + Math.cos(angle + i * 0.5) * (radius / (width / 100));
    const cy = 50 + Math.sin(angle + i * 0.3) * (radius / (height / 100));
    const size = 3 + (i % 4) * 2;
    const delay = TIMING_SPARKLE_BURST + (i % 10) * 2;
    const sparkleLife = frame >= delay
      ? interpolate(frame - delay, [0, 15, 50, 70], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 0;
    const color = sparkleColors[i % 3];

    return (
      <div key={i} style={{
        position: "absolute",
        left: \\\`\\\${cx}%\\\`,
        top: \\\`\\\${cy}%\\\`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        opacity: sparkleLife,
        boxShadow: \\\`0 0 \\\${size * 2}px \\\${color}\\\`,
        transform: \\\`scale(\\\${interpolate(sparkleLife, [0, 0.5, 1], [0.5, 1.2, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})\\\`,
      }} />
    );
  });

  return (
    <AbsoluteFill style={{ background: \\\`linear-gradient(160deg, \\\${COLOR_BG_1}, \\\${COLOR_BG_2})\\\`, fontFamily: FONT_FAMILY }}>
      {sparkles}

      {/* Coming Soon */}
      {frame < TIMING_COUNT_3 && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          opacity: comingSoonIn * comingSoonOut,
          transform: \\\`scale(\\\${interpolate(comingSoonIn, [0, 1], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})\\\`,
        }}>
          <div style={{
            fontFamily: FONT_FAMILY, fontSize: 48, fontWeight: 300, color: COLOR_TEXT_DIM,
            letterSpacing: 12, textTransform: "uppercase",
          }}>
            {COMING_SOON_TEXT}
          </div>
        </div>
      )}

      {/* Countdown */}
      {countdownNumber(3, TIMING_COUNT_3)}
      {countdownNumber(2, TIMING_COUNT_2)}
      {countdownNumber(1, TIMING_COUNT_1)}

      {/* Product Name */}
      {frame >= TIMING_REVEAL_START && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 24,
        }}>
          <div style={{
            fontFamily: FONT_FAMILY, fontSize: 72, fontWeight: 900, color: COLOR_TEXT_LIGHT,
            opacity: revealOpacity,
            textShadow: \\\`0 0 \\\${40 + glowIntensity * 40}px \\\${COLOR_GLOW}, 0 0 \\\${80 + glowIntensity * 60}px \\\${COLOR_ACCENT}50\\\`,
          }}>
            {PRODUCT_NAME.slice(0, charsToShow)}
            {showCursor && <span style={{ opacity: cursorBlink, color: COLOR_GLOW }}>|</span>}
          </div>
          <div style={{
            fontFamily: FONT_FAMILY, fontSize: 24, color: COLOR_TEXT_DIM, fontWeight: 300,
            opacity: taglineEntry,
            transform: \\\`translateY(\\\${interpolate(taglineEntry, [0, 1], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\`,
            letterSpacing: 4,
          }}>
            {TAGLINE}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};`;

export const productLaunchExample: RemotionExample = {
  id: "product-launch",
  name: "제품 런칭",
  description:
    "딥퍼플 그라디언트 위 카운트다운 3-2-1 → 제품 공개. 글로우 타이핑, 스파클 파티클, 시네마틱 스프링",
  code: productLaunchCode,
  durationInFrames: 300,
  fps: 30,
  category: "Other",
};
