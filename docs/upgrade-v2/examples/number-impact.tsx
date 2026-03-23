import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  interpolate,
  spring,
} from "remotion";

export const NumberImpact: React.FC = () => {
  /**
   * Number Impact — 5-8초 스낵 포맷
   * 하나의 강렬한 숫자가 카운트업으로 등장하고 레이블이 따라온다.
   * "+300% 성장", "10만 유저", "$2M 매출" 같은 임팩트 숫자용.
   * SNS 광고, 프레젠테이션 강조 장면에 활용.
   */
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // === CONTENT (customize these) ===
  const TARGET_NUMBER = 300;
  const NUMBER_PREFIX = "+";
  const NUMBER_SUFFIX = "%";
  const LABEL = "Revenue Growth";
  const SUBLABEL = "Year over Year";

  // === COLORS ===
  const COLOR_BG = "#0f172a";
  const COLOR_NUMBER = "#f8fafc";
  const COLOR_ACCENT = "#6366f1";
  const COLOR_LABEL = "#94a3b8";
  const COLOR_UNDERLINE = "#8b5cf6";

  // === TIMING ===
  const COUNT_START = 5;
  const COUNT_DURATION = 35;
  const LABEL_ENTER = 25;
  const SUBLABEL_ENTER = 35;
  const FADE_OUT_START = durationInFrames - 15;

  // === ANIMATIONS ===
  const numberEntrance = spring({
    frame: frame - COUNT_START,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const countProgress = interpolate(
    frame,
    [COUNT_START, COUNT_START + COUNT_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Eased count-up (accelerating then decelerating)
  const easedCount = Math.round(
    TARGET_NUMBER * (1 - Math.pow(1 - countProgress, 3))
  );

  const labelProgress = spring({
    frame: frame - LABEL_ENTER,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  const sublabelProgress = spring({
    frame: frame - SUBLABEL_ENTER,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  // Underline reveal
  const underlineWidth = interpolate(labelProgress, [0, 1], [0, 100]);

  // Subtle scale pulse when number lands
  const numberLanded = countProgress >= 0.95;
  const landPulse = numberLanded
    ? spring({
        frame: frame - (COUNT_START + COUNT_DURATION),
        fps,
        config: { damping: 8, stiffness: 200 },
      })
    : 0;
  const pulseScale = 1 + landPulse * 0.05;

  const fadeOut = interpolate(
    frame,
    [FADE_OUT_START, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // === SIZES ===
  const NUMBER_SIZE = Math.max(80, Math.round(width * 0.18));
  const LABEL_SIZE = Math.max(24, Math.round(width * 0.04));
  const SUBLABEL_SIZE = Math.max(16, Math.round(width * 0.025));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      {/* Background accent circle */}
      <div
        style={{
          position: "absolute",
          width: width * 0.5,
          height: width * 0.5,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLOR_ACCENT}15, transparent 70%)`,
          opacity: numberEntrance,
          transform: `scale(${numberEntrance * 1.2})`,
        }}
      />

      {/* Number */}
      <div
        style={{
          fontSize: NUMBER_SIZE,
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          color: COLOR_NUMBER,
          opacity: numberEntrance,
          transform: `scale(${numberEntrance * pulseScale})`,
          lineHeight: 1,
        }}
      >
        {NUMBER_PREFIX}
        {easedCount}
        {NUMBER_SUFFIX}
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: LABEL_SIZE,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          color: COLOR_ACCENT,
          opacity: labelProgress,
          marginTop: Math.round(height * 0.025),
          position: "relative",
        }}
      >
        {LABEL}
        {/* Underline */}
        <div
          style={{
            position: "absolute",
            bottom: -4,
            left: "50%",
            transform: "translateX(-50%)",
            width: `${underlineWidth}%`,
            height: 3,
            backgroundColor: COLOR_UNDERLINE,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Sublabel */}
      <div
        style={{
          fontSize: SUBLABEL_SIZE,
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          color: COLOR_LABEL,
          opacity: sublabelProgress,
          marginTop: Math.round(height * 0.015),
        }}
      >
        {SUBLABEL}
      </div>
    </AbsoluteFill>
  );
};
