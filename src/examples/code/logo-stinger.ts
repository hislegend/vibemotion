import { RemotionExample } from "./index";

export const logoStingerCode = `import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  interpolate,
  spring,
  Sequence,
} from "remotion";

export const MyAnimation = () => {
  /**
   * Logo Stinger / Brand Bumper — 5-8초 스낵 포맷
   * 로고가 임팩트 있게 등장하고 태그라인이 따라오는 브랜드 인트로/아웃트로.
   * 광고 앞뒤, 릴스 엔딩, 프레젠테이션 오프닝에 활용.
   */
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // === BRAND (customize these) ===
  const BRAND_NAME = "CRABS";
  const TAGLINE = "AI Video Solutions";
  const COLOR_BG_START = "#0f172a";
  const COLOR_BG_END = "#1e1b4b";
  const COLOR_LOGO = "#818cf8";
  const COLOR_TAGLINE = "#94a3b8";
  const COLOR_GLOW = "rgba(129, 140, 248, 0.3)";

  // === TIMING ===
  const LOGO_ENTER = 0;
  const TAGLINE_ENTER = 18;
  const HOLD_START = 40;
  const FADE_OUT_START = durationInFrames - 20;

  // === ANIMATIONS ===
  const logoScale = spring({
    frame: frame - LOGO_ENTER,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  const logoRotation = interpolate(logoScale, [0, 1], [-15, 0]);

  const taglineProgress = spring({
    frame: frame - TAGLINE_ENTER,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  const taglineY = interpolate(taglineProgress, [0, 1], [30, 0]);

  // Glow pulse during hold
  const glowPulse =
    frame > HOLD_START
      ? Math.sin((frame - HOLD_START) * 0.12) * 0.4 + 0.6
      : logoScale * 0.6;

  // Fade out at the end
  const fadeOut = interpolate(
    frame,
    [FADE_OUT_START, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // === SIZES ===
  const LOGO_SIZE = Math.max(56, Math.round(width * 0.1));
  const TAGLINE_SIZE = Math.max(20, Math.round(width * 0.035));

  return (
    <AbsoluteFill
      style={{
        background: \`linear-gradient(160deg, \${COLOR_BG_START}, \${COLOR_BG_END})\`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      {/* Glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: width * 0.4,
          height: width * 0.4,
          borderRadius: "50%",
          background: \`radial-gradient(circle, \${COLOR_GLOW}, transparent 70%)\`,
          opacity: glowPulse,
          transform: \`scale(\${logoScale})\`,
        }}
      />

      {/* Logo text */}
      <div
        style={{
          fontSize: LOGO_SIZE,
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          color: COLOR_LOGO,
          letterSpacing: Math.round(LOGO_SIZE * 0.15),
          transform: \`scale(\${logoScale}) rotate(\${logoRotation}deg)\`,
          textShadow: \`0 0 \${40 * glowPulse}px \${COLOR_GLOW}\`,
        }}
      >
        {BRAND_NAME}
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: TAGLINE_SIZE,
          fontFamily: "Inter, sans-serif",
          fontWeight: 300,
          color: COLOR_TAGLINE,
          opacity: taglineProgress,
          transform: \`translateY(\${taglineY}px)\`,
          marginTop: Math.round(height * 0.02),
          letterSpacing: Math.round(TAGLINE_SIZE * 0.2),
        }}
      >
        {TAGLINE}
      </div>
    </AbsoluteFill>
  );
};`;

export const logoStingerExample: RemotionExample = {
  id: "logo-stinger",
  name: "Logo Stinger",
  description:
    "Logo stinger / brand bumper with spring-scaled logo entrance, glow pulse, tagline fade-in, and cinematic dark gradient background.",
  code: logoStingerCode,
  durationInFrames: 210,
  fps: 30,
  category: "Animation",
};
