import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  interpolate,
  spring,
} from "remotion";

export const ProductTeaser: React.FC = () => {
  /**
   * Product Teaser — 7-10초 스낵 포맷
   * 제품/앱을 한 컷으로 강렬하게 소개하는 티저.
   * 디바이스 목업 + 한줄 카피 + CTA.
   * 인스타 스토리, 유튜브 범퍼, 광고 프리롤에 활용.
   */
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // === CONTENT (customize these) ===
  const PRODUCT_NAME = "WakaShorts";
  const HEADLINE = "AI가 만드는 숏폼";
  const CTA_TEXT = "지금 시작하기 →";

  // === COLORS ===
  const COLOR_BG_1 = "#312e81";
  const COLOR_BG_2 = "#4c1d95";
  const COLOR_BG_3 = "#1e1b4b";
  const COLOR_DEVICE_BEZEL = "#1e293b";
  const COLOR_SCREEN_BG = "#f8fafc";
  const COLOR_TEXT = "#f1f5f9";
  const COLOR_CTA = "#a78bfa";
  const COLOR_CTA_BG = "rgba(167, 139, 250, 0.15)";

  // === TIMING ===
  const DEVICE_ENTER = 0;
  const HEADLINE_ENTER = 12;
  const CTA_ENTER = 28;
  const FADE_OUT_START = durationInFrames - 18;

  // === DEVICE DIMENSIONS ===
  const PHONE_WIDTH = Math.round(width * 0.32);
  const PHONE_HEIGHT = Math.round(PHONE_WIDTH * 2.05);
  const BEZEL_RADIUS = Math.round(PHONE_WIDTH * 0.12);
  const SCREEN_PADDING = Math.round(PHONE_WIDTH * 0.04);

  // === ANIMATIONS ===
  const deviceEntrance = spring({
    frame: frame - DEVICE_ENTER,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const deviceY = interpolate(deviceEntrance, [0, 1], [height * 0.3, 0]);
  const deviceRotateY = interpolate(deviceEntrance, [0, 1], [-12, -6]);
  const deviceRotateX = interpolate(deviceEntrance, [0, 1], [8, 4]);

  const headlineProgress = spring({
    frame: frame - HEADLINE_ENTER,
    fps,
    config: { damping: 15, stiffness: 130 },
  });

  const headlineX = interpolate(headlineProgress, [0, 1], [-40, 0]);

  const ctaProgress = spring({
    frame: frame - CTA_ENTER,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  // Floating animation for device
  const floatY = Math.sin(frame * 0.08) * 4;

  const fadeOut = interpolate(
    frame,
    [FADE_OUT_START, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // === SIZES ===
  const PRODUCT_SIZE = Math.max(14, Math.round(width * 0.025));
  const HEADLINE_SIZE = Math.max(36, Math.round(width * 0.065));
  const CTA_SIZE = Math.max(16, Math.round(width * 0.028));

  // Layout
  const isVertical = height > width;
  const contentPadding = Math.round(width * 0.08);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLOR_BG_1}, ${COLOR_BG_2}, ${COLOR_BG_3})`,
        opacity: fadeOut,
      }}
    >
      {/* Background bokeh circles */}
      {[0.15, 0.7, 0.4].map((xRatio, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: width * xRatio,
            top: height * (0.2 + i * 0.25),
            width: width * (0.15 + i * 0.05),
            height: width * (0.15 + i * 0.05),
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(139, 92, 246, ${0.08 + i * 0.03}), transparent 70%)`,
            transform: `scale(${deviceEntrance})`,
          }}
        />
      ))}

      <div
        style={{
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: contentPadding,
          gap: Math.round(width * 0.05),
        }}
      >
        {/* Text side */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: Math.round(height * 0.02),
            order: isVertical ? 1 : 0,
            alignItems: isVertical ? "center" : "flex-start",
            textAlign: isVertical ? "center" : "left",
            flex: isVertical ? "none" : 1,
          }}
        >
          {/* Product name badge */}
          <div
            style={{
              fontSize: PRODUCT_SIZE,
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              color: COLOR_CTA,
              letterSpacing: Math.round(PRODUCT_SIZE * 0.15),
              opacity: headlineProgress,
              transform: `translateX(${headlineX}px)`,
              textTransform: "uppercase",
            }}
          >
            {PRODUCT_NAME}
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: HEADLINE_SIZE,
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              color: COLOR_TEXT,
              lineHeight: 1.15,
              opacity: headlineProgress,
              transform: `translateX(${headlineX}px)`,
              maxWidth: isVertical ? "100%" : width * 0.45,
            }}
          >
            {HEADLINE}
          </div>

          {/* CTA */}
          <div
            style={{
              fontSize: CTA_SIZE,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              color: COLOR_CTA,
              opacity: ctaProgress,
              backgroundColor: COLOR_CTA_BG,
              padding: `${Math.round(CTA_SIZE * 0.5)}px ${Math.round(CTA_SIZE * 1.2)}px`,
              borderRadius: Math.round(CTA_SIZE * 0.4),
              marginTop: Math.round(height * 0.01),
            }}
          >
            {CTA_TEXT}
          </div>
        </div>

        {/* Device */}
        <div
          style={{
            transform: `
              perspective(1200px)
              rotateY(${deviceRotateY}deg)
              rotateX(${deviceRotateX}deg)
              translateY(${deviceY + floatY}px)
              scale(${deviceEntrance})
            `,
            order: isVertical ? 0 : 1,
          }}
        >
          {/* Phone bezel */}
          <div
            style={{
              width: PHONE_WIDTH,
              height: PHONE_HEIGHT,
              borderRadius: BEZEL_RADIUS,
              backgroundColor: COLOR_DEVICE_BEZEL,
              padding: SCREEN_PADDING,
              boxShadow: `0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.15)`,
            }}
          >
            {/* Screen */}
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: BEZEL_RADIUS - SCREEN_PADDING,
                backgroundColor: COLOR_SCREEN_BG,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Placeholder app UI */}
              <div
                style={{
                  width: "80%",
                  display: "flex",
                  flexDirection: "column",
                  gap: Math.round(PHONE_WIDTH * 0.04),
                  alignItems: "center",
                }}
              >
                {/* App icon placeholder */}
                <div
                  style={{
                    width: Math.round(PHONE_WIDTH * 0.2),
                    height: Math.round(PHONE_WIDTH * 0.2),
                    borderRadius: Math.round(PHONE_WIDTH * 0.04),
                    background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
                  }}
                />
                {/* Mock UI lines */}
                {[0.7, 0.5, 0.85, 0.6].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${w * 100}%`,
                      height: Math.round(PHONE_WIDTH * 0.025),
                      borderRadius: 4,
                      backgroundColor: i === 0 ? "#e2e8f0" : "#f1f5f9",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
