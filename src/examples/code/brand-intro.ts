import { RemotionExample } from "./index";

export const brandIntroCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyAnimation = () => {
  /**
   * Premium brand intro/outro on dark background (#0f172a).
   * Circular logo placeholder scales in with spring, brand name appears
   * letter-by-letter with staggered translateY springs, slogan fades in,
   * and website URL appears at bottom. Glow/shadow effects for premium feel.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ═══════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════

  const BRAND_NAME = "CRABS";
  const SLOGAN = "Build faster, ship smarter";
  const WEBSITE_URL = "crabs.studio";

  const COLOR_BG = "#0f172a";
  const COLOR_LOGO_BG = "linear-gradient(135deg, #6366f1, #8b5cf6)";
  const COLOR_LOGO_GLOW = "#818cf8";
  const COLOR_TEXT_LIGHT = "#ffffff";
  const COLOR_TEXT_DIM = "#94a3b8";
  const COLOR_ACCENT = "#a78bfa";
  const COLOR_GLOW_1 = "#6366f1";
  const COLOR_GLOW_2 = "#8b5cf6";

  const FONT_FAMILY = "Inter, system-ui, sans-serif";

  const TIMING_LOGO = 10;
  const TIMING_NAME_START = 40;
  const TIMING_LETTER_GAP = 5;
  const TIMING_SLOGAN = 80;
  const TIMING_URL = 110;
  const TIMING_GLOW_PULSE_START = 130;

  // ═══════════════════════════════════════════
  // SPRING HELPERS
  // ═══════════════════════════════════════════

  const springAt = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 30 });

  const springSnappy = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 25 });

  // ═══════════════════════════════════════════
  // LOGO
  // ═══════════════════════════════════════════

  const logoEntry = springSnappy(TIMING_LOGO);
  const logoScale = interpolate(logoEntry, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoGlow = interpolate(logoEntry, [0, 1], [0, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Glow pulse after settling
  const glowPulse = frame >= TIMING_GLOW_PULSE_START
    ? 30 + Math.sin((frame - TIMING_GLOW_PULSE_START) * 0.08) * 15
    : logoGlow;

  // ═══════════════════════════════════════════
  // BRAND NAME (letter-by-letter stagger)
  // ═══════════════════════════════════════════

  const letters = BRAND_NAME.split("").map((char, i) => {
    const delay = TIMING_NAME_START + i * TIMING_LETTER_GAP;
    const letterEntry = frame >= delay ? springSnappy(delay) : 0;
    const y = interpolate(letterEntry, [0, 1], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const opacity = letterEntry;

    return (
      <span key={i} style={{
        display: "inline-block",
        transform: \\\`translateY(\\\${y}px)\\\`,
        opacity,
      }}>
        {char}
      </span>
    );
  });

  // ═══════════════════════════════════════════
  // SLOGAN
  // ═══════════════════════════════════════════

  const sloganEntry = frame >= TIMING_SLOGAN ? springAt(TIMING_SLOGAN) : 0;
  const sloganY = interpolate(sloganEntry, [0, 1], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ═══════════════════════════════════════════
  // WEBSITE URL
  // ═══════════════════════════════════════════

  const urlEntry = frame >= TIMING_URL ? springAt(TIMING_URL) : 0;

  // ═══════════════════════════════════════════
  // AMBIENT PARTICLES
  // ═══════════════════════════════════════════

  const particles = Array.from({ length: 10 }, (_, i) => {
    const x = ((i * 137.5 + 15) % 100);
    const y = ((i * 97.3 + 10) % 100);
    const size = 3 + (i % 3) * 2;
    const delay = 20 + i * 8;
    const opacity = frame > delay
      ? interpolate(frame - delay, [0, 30, 80, 110], [0, 0.12, 0.12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 0;
    return <div key={i} style={{ position: "absolute", left: \\\`\\\${x}%\\\`, top: \\\`\\\${y}%\\\`, width: size, height: size, borderRadius: "50%", background: COLOR_ACCENT, opacity, filter: "blur(1px)" }} />;
  });

  // ═══════════════════════════════════════════
  // DECORATIVE GLOW CIRCLES (background)
  // ═══════════════════════════════════════════

  const bgGlowOpacity = interpolate(frame, [0, 40, 200], [0, 0.15, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: COLOR_BG,
      fontFamily: FONT_FAMILY,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 28,
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: \\\`radial-gradient(circle, \\\${COLOR_GLOW_1}40, transparent 70%)\\\`,
        opacity: bgGlowOpacity,
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        filter: "blur(40px)",
      }} />

      {particles}

      {/* Logo circle */}
      <div style={{
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: COLOR_LOGO_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: \\\`scale(\\\${logoScale})\\\`,
        boxShadow: \\\`0 0 \\\${glowPulse}px \\\${COLOR_LOGO_GLOW}, 0 0 \\\${glowPulse * 2}px \\\${COLOR_GLOW_1}30\\\`,
      }}>
        <div style={{
          fontFamily: FONT_FAMILY, fontSize: 36, fontWeight: 900, color: COLOR_TEXT_LIGHT,
        }}>
          C
        </div>
      </div>

      {/* Brand name */}
      <div style={{
        fontFamily: FONT_FAMILY,
        fontSize: 60,
        fontWeight: 900,
        color: COLOR_TEXT_LIGHT,
        letterSpacing: 14,
        textShadow: \\\`0 0 20px \\\${COLOR_GLOW_2}40\\\`,
        display: "flex",
      }}>
        {letters}
      </div>

      {/* Slogan */}
      <div style={{
        fontFamily: FONT_FAMILY,
        fontSize: 20,
        fontWeight: 400,
        color: COLOR_TEXT_DIM,
        opacity: sloganEntry,
        transform: \\\`translateY(\\\${sloganY}px)\\\`,
        letterSpacing: 2,
      }}>
        {SLOGAN}
      </div>

      {/* Website URL */}
      <div style={{
        position: "absolute",
        bottom: height * 0.08,
        fontFamily: FONT_FAMILY,
        fontSize: 16,
        fontWeight: 500,
        color: COLOR_ACCENT,
        opacity: urlEntry,
        letterSpacing: 3,
      }}>
        {WEBSITE_URL}
      </div>
    </AbsoluteFill>
  );
};`;

export const brandIntroExample: RemotionExample = {
  id: "brand-intro",
  name: "브랜드 인트로",
  description:
    "다크 배경 위 프리미엄 브랜드 인트로/아웃트로. 스프링 로고, 글자별 스태거, 슬로건 페이드, 글로우 효과",
  code: brandIntroCode,
  durationInFrames: 240,
  fps: 30,
  category: "Other",
};
