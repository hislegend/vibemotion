import { RemotionExample } from "./index";

export const appPromoCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

export const MyAnimation = () => {
  /**
   * A polished app promotional video for a finance/budget tracking app.
   * Features 3D tilted phone mockup with detailed CSS UI, pastel gradient
   * backgrounds, bokeh particles, and smooth spring-based transitions.
   * Inspired by gwon_vibe's Walletvy promo on Threads.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ═══════════════════════════════════════════
  // CONSTANTS — Edit these to customize
  // ═══════════════════════════════════════════

  // Brand
  const APP_NAME = "Walletvy";
  const TAGLINE = "Smart spending starts here";
  const SCENE1_TEXT = "Track Every Dollar";
  const SCENE2_TEXT = "Real-time Alerts";
  const CTA_TEXT = "Download Free";

  // Colors
  const COLOR_BG_1 = "#fecaca";
  const COLOR_BG_2 = "#fda4af";
  const COLOR_BG_3 = "#fb7185";
  const COLOR_ACCENT = "#e11d48";
  const COLOR_ACCENT_LIGHT = "#fda4af";
  const COLOR_TEXT_DARK = "#1e293b";
  const COLOR_TEXT_LIGHT = "#ffffff";
  const COLOR_BEZEL = "#0f172a";
  const COLOR_SCREEN_BG = "#f8fafc";
  const COLOR_CARD_BG = "#ffffff";

  // Layout
  const PHONE_WIDTH = Math.round(width * 0.36);
  const PHONE_HEIGHT = Math.round(PHONE_WIDTH * 2.05);
  const BEZEL_RADIUS = Math.round(PHONE_WIDTH * 0.12);
  const SCREEN_PADDING = Math.round(PHONE_WIDTH * 0.035);
  const INNER_PADDING = Math.round(PHONE_WIDTH * 0.06);

  // Timing (frames)
  const SCENE1_START = 0;
  const SCENE1_END = 90;
  const SCENE2_START = 90;
  const SCENE2_END = 200;
  const SCENE3_START = 200;
  const SCENE3_END = 300;
  const TRANSITION_DURATION = 20;

  // ═══════════════════════════════════════════
  // ANIMATIONS
  // ═══════════════════════════════════════════

  // Phone entrance — slides up from bottom with spring
  const phoneEntrance = spring({
    fps,
    frame: frame - 8,
    config: { damping: 14, stiffness: 90 },
  });
  const phoneY = interpolate(phoneEntrance, [0, 1], [height * 0.4, 0]);
  const phoneScale = interpolate(phoneEntrance, [0, 1], [0.85, 1]);

  // Scene transitions
  const scene2Opacity = interpolate(
    frame,
    [SCENE2_START - TRANSITION_DURATION, SCENE2_START],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scene3Opacity = interpolate(
    frame,
    [SCENE3_START - TRANSITION_DURATION, SCENE3_START],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Scene 1 text entrance
  const text1Entrance = spring({
    fps,
    frame: frame - 25,
    config: { damping: 16, stiffness: 110 },
  });

  // Scene 2 elements
  const alert1 = spring({
    fps,
    frame: frame - SCENE2_START - 10,
    config: { damping: 14, stiffness: 100 },
  });
  const alert2 = spring({
    fps,
    frame: frame - SCENE2_START - 16,
    config: { damping: 14, stiffness: 100 },
  });
  const alert3 = spring({
    fps,
    frame: frame - SCENE2_START - 22,
    config: { damping: 14, stiffness: 100 },
  });

  // Scene 3 — phone shrinks, logo appears
  const scene3PhoneScale = interpolate(
    frame,
    [SCENE3_START, SCENE3_START + 20],
    [1, 0.72],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const logoEntrance = spring({
    fps,
    frame: frame - SCENE3_START - 15,
    config: { damping: 15, stiffness: 120 },
  });
  const ctaEntrance = spring({
    fps,
    frame: frame - SCENE3_START - 25,
    config: { damping: 14, stiffness: 100 },
  });

  // Bokeh particles — slow drift
  const bokeh1X = interpolate(frame, [0, 300], [width * 0.1, width * 0.15]);
  const bokeh1Y = interpolate(frame, [0, 300], [height * 0.2, height * 0.15]);
  const bokeh2X = interpolate(frame, [0, 300], [width * 0.75, width * 0.7]);
  const bokeh2Y = interpolate(frame, [0, 300], [height * 0.6, height * 0.55]);
  const bokeh3X = interpolate(frame, [0, 300], [width * 0.5, width * 0.55]);
  const bokeh3Y = interpolate(frame, [0, 300], [height * 0.85, height * 0.8]);

  // Background gradient shift
  const gradientAngle = interpolate(frame, [0, 300], [135, 155]);

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  const screenInnerRadius = BEZEL_RADIUS - SCREEN_PADDING;
  const cardRadius = Math.round(PHONE_WIDTH * 0.04);

  return (
    <AbsoluteFill>
      {/* Background gradient */}
      <AbsoluteFill
        style={{
          background: \`linear-gradient(\${gradientAngle}deg, \${COLOR_BG_1}, \${COLOR_BG_2}, \${COLOR_BG_3})\`,
        }}
      />

      {/* Bokeh particles */}
      {[
        { x: bokeh1X, y: bokeh1Y, size: width * 0.18, opacity: 0.12 },
        { x: bokeh2X, y: bokeh2Y, size: width * 0.25, opacity: 0.08 },
        { x: bokeh3X, y: bokeh3Y, size: width * 0.14, opacity: 0.1 },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x - b.size / 2,
            top: b.y - b.size / 2,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: "white",
            opacity: b.opacity,
            filter: \`blur(\${width * 0.03}px)\`,
          }}
        />
      ))}

      {/* Main content container */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Phone mockup with 3D tilt */}
        <div
          style={{
            transform: \`
              translateY(\${phoneY}px)
              scale(\${phoneScale * (frame >= SCENE3_START ? scene3PhoneScale : 1)})
              perspective(1200px)
              rotateY(-8deg)
              rotateX(5deg)
            \`,
            width: PHONE_WIDTH,
            height: PHONE_HEIGHT,
            borderRadius: BEZEL_RADIUS,
            backgroundColor: COLOR_BEZEL,
            padding: SCREEN_PADDING,
            boxShadow: \`
              0 \${PHONE_WIDTH * 0.08}px \${PHONE_WIDTH * 0.2}px rgba(0,0,0,0.35),
              0 \${PHONE_WIDTH * 0.02}px \${PHONE_WIDTH * 0.05}px rgba(0,0,0,0.15)
            \`,
            position: "relative",
          }}
        >
          {/* Screen */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: screenInnerRadius,
              backgroundColor: COLOR_SCREEN_BG,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* ── SCENE 1: Dashboard view ── */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: INNER_PADDING,
                opacity: interpolate(
                  frame,
                  [SCENE2_START - TRANSITION_DURATION, SCENE2_START],
                  [1, 0],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                ),
              }}
            >
              {/* Status bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: PHONE_WIDTH * 0.035,
                  color: COLOR_TEXT_DARK,
                  marginBottom: INNER_PADDING * 0.5,
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 600,
                }}
              >
                <span>9:41</span>
                <span>●●●</span>
              </div>

              {/* Greeting */}
              <div
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: PHONE_WIDTH * 0.05,
                  fontWeight: 700,
                  color: COLOR_TEXT_DARK,
                  marginBottom: INNER_PADDING * 0.2,
                }}
              >
                Home
              </div>
              <div
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: PHONE_WIDTH * 0.035,
                  color: "#64748b",
                  marginBottom: INNER_PADDING * 0.8,
                }}
              >
                You&apos;re doing great 👋
              </div>

              {/* Monthly spending card */}
              <div
                style={{
                  backgroundColor: COLOR_CARD_BG,
                  borderRadius: cardRadius,
                  padding: INNER_PADDING * 0.7,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  marginBottom: INNER_PADDING * 0.5,
                  border: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: PHONE_WIDTH * 0.03,
                    color: "#94a3b8",
                    textTransform: "uppercase" as const,
                    letterSpacing: 0.5,
                    marginBottom: INNER_PADDING * 0.3,
                  }}
                >
                  THIS MONTH&apos;S FLOW
                </div>
                <div
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: PHONE_WIDTH * 0.08,
                    fontWeight: 800,
                    color: COLOR_TEXT_DARK,
                    marginBottom: INNER_PADDING * 0.2,
                  }}
                >
                  $708.04
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: INNER_PADDING * 0.4,
                    marginBottom: INNER_PADDING * 0.4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: PHONE_WIDTH * 0.028,
                      color: COLOR_ACCENT,
                    }}
                  >
                    Spending $708.04
                  </span>
                  <span
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: PHONE_WIDTH * 0.028,
                      color: "#22c55e",
                    }}
                  >
                    Savings $0.00
                  </span>
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    height: PHONE_WIDTH * 0.015,
                    backgroundColor: "#f1f5f9",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "68%",
                      backgroundColor: COLOR_ACCENT,
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>

              {/* Category pills */}
              <div
                style={{
                  display: "flex",
                  gap: INNER_PADDING * 0.25,
                  flexWrap: "wrap" as const,
                  marginBottom: INNER_PADDING * 0.5,
                }}
              >
                {[
                  { label: "Shopping", pct: "34%", active: true },
                  { label: "Subscriptions", pct: "28%", active: false },
                  { label: "Groceries", pct: "22%", active: false },
                ].map((cat, i) => (
                  <div
                    key={i}
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: PHONE_WIDTH * 0.025,
                      padding: \`\${INNER_PADDING * 0.15}px \${INNER_PADDING * 0.3}px\`,
                      borderRadius: 999,
                      backgroundColor: cat.active ? COLOR_ACCENT : "#f1f5f9",
                      color: cat.active ? COLOR_TEXT_LIGHT : "#64748b",
                      fontWeight: cat.active ? 600 : 400,
                    }}
                  >
                    {cat.label} {cat.pct}
                  </div>
                ))}
              </div>

              {/* Bottom nav bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: PHONE_WIDTH * 0.14,
                  backgroundColor: COLOR_CARD_BG,
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  paddingBottom: PHONE_WIDTH * 0.02,
                }}
              >
                {["🏠", "📊", "➕", "📜", "⚙️"].map((icon, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: PHONE_WIDTH * 0.045,
                      opacity: i === 0 ? 1 : 0.4,
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* ── SCENE 2: Notification view ── */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: INNER_PADDING,
                opacity: scene2Opacity * (1 - scene3Opacity),
              }}
            >
              <div
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: PHONE_WIDTH * 0.035,
                  color: COLOR_TEXT_DARK,
                  marginBottom: INNER_PADDING * 0.3,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontWeight: 600 }}>9:41</span>
                <span>●●●</span>
              </div>

              {/* Alert banner */}
              <div
                style={{
                  backgroundColor: COLOR_ACCENT,
                  borderRadius: cardRadius,
                  padding: INNER_PADDING * 0.5,
                  marginBottom: INNER_PADDING * 0.5,
                }}
              >
                <div
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: PHONE_WIDTH * 0.032,
                    fontWeight: 700,
                    color: COLOR_TEXT_LIGHT,
                  }}
                >
                  🔔 5 new transaction(s) to review
                </div>
              </div>

              {/* Transaction list with stagger */}
              {[
                { name: "Starbucks", amount: "-$5.40", icon: "☕" },
                { name: "Amazon", amount: "-$34.99", icon: "📦" },
                { name: "Netflix", amount: "-$15.99", icon: "🎬" },
              ].map((tx, i) => {
                const entrance = [alert1, alert2, alert3][i];
                const txY = interpolate(entrance, [0, 1], [30, 0]);
                const txOpacity = interpolate(entrance, [0, 1], [0, 1]);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: COLOR_CARD_BG,
                      borderRadius: cardRadius,
                      padding: INNER_PADDING * 0.45,
                      marginBottom: INNER_PADDING * 0.25,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      border: "1px solid #f1f5f9",
                      transform: \`translateY(\${txY}px)\`,
                      opacity: txOpacity,
                    }}
                  >
                    <div
                      style={{
                        fontSize: PHONE_WIDTH * 0.05,
                        marginRight: INNER_PADDING * 0.3,
                      }}
                    >
                      {tx.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "Inter, system-ui, sans-serif",
                          fontSize: PHONE_WIDTH * 0.032,
                          fontWeight: 600,
                          color: COLOR_TEXT_DARK,
                        }}
                      >
                        {tx.name}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: PHONE_WIDTH * 0.032,
                        fontWeight: 700,
                        color: COLOR_TEXT_DARK,
                      }}
                    >
                      {tx.amount}
                    </div>
                  </div>
                );
              })}

              {/* Bottom nav (same) */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: PHONE_WIDTH * 0.14,
                  backgroundColor: COLOR_CARD_BG,
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  paddingBottom: PHONE_WIDTH * 0.02,
                }}
              >
                {["🏠", "📊", "➕", "📜", "⚙️"].map((icon, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: PHONE_WIDTH * 0.045,
                      opacity: i === 3 ? 1 : 0.4,
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SCENE 1 text (outside phone) ── */}
        <div
          style={{
            position: "absolute",
            bottom: height * 0.12,
            opacity: interpolate(text1Entrance, [0, 1], [0, 1]) *
              interpolate(
                frame,
                [SCENE2_START - TRANSITION_DURATION, SCENE2_START],
                [1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            transform: \`translateY(\${interpolate(text1Entrance, [0, 1], [20, 0])}px)\`,
            textAlign: "center" as const,
            width: "100%",
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: width * 0.055,
              fontWeight: 800,
              color: COLOR_TEXT_LIGHT,
              textShadow: "0 2px 10px rgba(0,0,0,0.15)",
            }}
          >
            {SCENE1_TEXT}
          </div>
        </div>

        {/* ── SCENE 2 text ── */}
        <div
          style={{
            position: "absolute",
            bottom: height * 0.12,
            opacity: scene2Opacity * (1 - scene3Opacity),
            textAlign: "center" as const,
            width: "100%",
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: width * 0.055,
              fontWeight: 800,
              color: COLOR_TEXT_LIGHT,
              textShadow: "0 2px 10px rgba(0,0,0,0.15)",
            }}
          >
            {SCENE2_TEXT}
          </div>
        </div>

        {/* ── SCENE 3: Logo + CTA ── */}
        <div
          style={{
            position: "absolute",
            top: height * 0.08,
            width: "100%",
            textAlign: "center" as const,
            opacity: interpolate(logoEntrance, [0, 1], [0, 1]),
            transform: \`translateY(\${interpolate(logoEntrance, [0, 1], [-20, 0])}px)\`,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: width * 0.09,
              fontWeight: 900,
              color: COLOR_TEXT_LIGHT,
              textShadow: "0 3px 15px rgba(0,0,0,0.2)",
              letterSpacing: -1,
            }}
          >
            {APP_NAME}
          </div>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: width * 0.035,
              color: "rgba(255,255,255,0.85)",
              marginTop: width * 0.015,
            }}
          >
            {TAGLINE}
          </div>
        </div>

        {/* CTA button */}
        <div
          style={{
            position: "absolute",
            bottom: height * 0.1,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            opacity: interpolate(ctaEntrance, [0, 1], [0, 1]),
            transform: \`translateY(\${interpolate(ctaEntrance, [0, 1], [15, 0])}px)\`,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: width * 0.04,
              fontWeight: 700,
              color: COLOR_ACCENT,
              backgroundColor: COLOR_TEXT_LIGHT,
              padding: \`\${width * 0.025}px \${width * 0.08}px\`,
              borderRadius: 999,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            {CTA_TEXT}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
`;

export const appPromoExample: RemotionExample = {
  id: "app-promo",
  name: "앱 프로모",
  description:
    "3D 틸트 폰 목업 + 앱 UI + 파스텔 그라데이션. 프롬프트로 업종 지정",
  code: appPromoCode,
  durationInFrames: 300,
  fps: 30,
  category: "Other",
};
