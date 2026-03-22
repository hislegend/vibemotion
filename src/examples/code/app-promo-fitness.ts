import { RemotionExample } from "./index";

export const appPromoFitnessCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyAnimation = () => {
  /**
   * Fitness/health app promotional video with mint/emerald gradient.
   * Features 3D tilted phone mockup showing workout dashboard with
   * circular calorie chart, step counter, weekly bar graph, and
   * spring-based interpolated progress animations.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ═══════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════

  const APP_NAME = "FitPulse";
  const TAGLINE = "Move better, feel better";
  const SCENE1_TEXT = "Your Dashboard";
  const SCENE2_TEXT = "Track Workouts";
  const CTA_TEXT = "Start Free Trial";

  const COLOR_BG_1 = "#a7f3d0";
  const COLOR_BG_2 = "#6ee7b7";
  const COLOR_BG_3 = "#34d399";
  const COLOR_ACCENT = "#059669";
  const COLOR_ACCENT_DARK = "#047857";
  const COLOR_TEXT_DARK = "#064e3b";
  const COLOR_TEXT_LIGHT = "#ffffff";
  const COLOR_CARD = "#ffffff";
  const COLOR_CHART_BG = "#d1fae5";
  const COLOR_CHART_FILL = "#10b981";

  const TIMING_SCENE1_START = 0;
  const TIMING_SCENE2_START = 100;
  const TIMING_SCENE3_START = 200;

  const FONT_FAMILY = "Inter, system-ui, sans-serif";

  const TARGET_CALORIES = 1842;
  const TARGET_STEPS = 8734;
  const WEEKLY_DATA = [65, 80, 45, 90, 70, 55, 85];
  const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

  // ═══════════════════════════════════════════
  // SPRING HELPERS
  // ═══════════════════════════════════════════

  const springAt = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 30 });

  // ═══════════════════════════════════════════
  // SCENE TRANSITIONS
  // ═══════════════════════════════════════════

  const scene1Opacity = interpolate(frame, [TIMING_SCENE2_START - 15, TIMING_SCENE2_START], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scene2Entry = frame >= TIMING_SCENE2_START ? springAt(TIMING_SCENE2_START) : 0;
  const scene2Opacity = interpolate(frame, [TIMING_SCENE3_START - 15, TIMING_SCENE3_START], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scene3Entry = frame >= TIMING_SCENE3_START ? springAt(TIMING_SCENE3_START) : 0;

  const bgProgress = interpolate(frame, [0, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bgColor1 = bgProgress < 0.33 ? COLOR_BG_1 : bgProgress < 0.66 ? COLOR_BG_2 : COLOR_BG_3;
  const bgColor2 = bgProgress < 0.33 ? COLOR_BG_2 : bgProgress < 0.66 ? COLOR_BG_3 : COLOR_ACCENT;

  // ═══════════════════════════════════════════
  // PHONE MOCKUP
  // ═══════════════════════════════════════════

  const phoneEntry = springAt(5);
  const phoneScale = interpolate(phoneEntry, [0, 1], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const phoneY = interpolate(phoneEntry, [0, 1], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const phoneMockup = (children: any) => (
    <div style={{
      width: width * 0.55, height: height * 0.6, borderRadius: 36,
      background: COLOR_CARD,
      boxShadow: "0 25px 80px rgba(5,150,105,0.3), 0 8px 24px rgba(0,0,0,0.12)",
      overflow: "hidden",
      transform: \\\`perspective(1200px) rotateY(-8deg) rotateX(5deg) scale(\\\${phoneScale}) translateY(\\\${phoneY}px)\\\`,
      transformStyle: "preserve-3d", position: "relative", border: "3px solid #d1fae5",
    }}>
      <div style={{ width: "100%", height: 40, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #d1fae5" }}>
        <div style={{ width: 60, height: 6, borderRadius: 3, background: COLOR_ACCENT }} />
      </div>
      {children}
    </div>
  );

  // ═══════════════════════════════════════════
  // CIRCULAR PROGRESS
  // ═══════════════════════════════════════════

  const circleProgress = interpolate(frame, [20, 70], [0, 0.75], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference * (1 - circleProgress);

  const calorieCount = Math.round(interpolate(frame, [20, 70], [0, TARGET_CALORIES], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const stepCount = Math.round(interpolate(frame, [30, 75], [0, TARGET_STEPS], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  // ═══════════════════════════════════════════
  // BOKEH
  // ═══════════════════════════════════════════

  const particles = Array.from({ length: 14 }, (_, i) => {
    const x = ((i * 137.5) % 100);
    const y = ((i * 73.1 + 15) % 100);
    const size = 6 + (i % 4) * 3;
    const delay = i * 5;
    const opacity = frame > delay
      ? interpolate(frame - delay, [0, 30, 80, 100], [0, 0.2, 0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 0;
    return <div key={i} style={{ position: "absolute", left: \\\`\\\${x}%\\\`, top: \\\`\\\${y}%\\\`, width: size, height: size, borderRadius: "50%", background: i % 2 === 0 ? COLOR_CHART_BG : COLOR_BG_1, opacity, filter: "blur(2px)" }} />;
  });

  // ═══════════════════════════════════════════
  // SCENE 1 — DASHBOARD
  // ═══════════════════════════════════════════

  const scene1 = (
    <div style={{ opacity: scene1Opacity, position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 800, color: COLOR_TEXT_DARK, marginBottom: 20, opacity: springAt(10), transform: \\\`translateY(\\\${interpolate(springAt(10), [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\` }}>
        {SCENE1_TEXT}
      </div>
      {phoneMockup(
        <div style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 120, height: 120 }}>
            <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke={COLOR_CHART_BG} strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke={COLOR_CHART_FILL} strokeWidth="10"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 800, color: COLOR_TEXT_DARK }}>{calorieCount}</div>
              <div style={{ fontFamily: FONT_FAMILY, fontSize: 10, color: "#6b7280" }}>kcal</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "center", opacity: springAt(35) }}>
              <div style={{ fontFamily: FONT_FAMILY, fontSize: 20, fontWeight: 800, color: COLOR_TEXT_DARK }}>{stepCount.toLocaleString()}</div>
              <div style={{ fontFamily: FONT_FAMILY, fontSize: 11, color: "#6b7280" }}>steps</div>
            </div>
            <div style={{ textAlign: "center", opacity: springAt(40) }}>
              <div style={{ fontFamily: FONT_FAMILY, fontSize: 20, fontWeight: 800, color: COLOR_TEXT_DARK }}>6.2</div>
              <div style={{ fontFamily: FONT_FAMILY, fontSize: 11, color: "#6b7280" }}>km</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80, marginTop: 8 }}>
            {WEEKLY_DATA.map((val, i) => {
              const barEntry = frame >= 45 + i * 4 ? springAt(45 + i * 4) : 0;
              const barH = interpolate(barEntry, [0, 1], [0, val * 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 20, height: barH, borderRadius: 6, background: i === 3 ? COLOR_ACCENT : COLOR_CHART_FILL, opacity: 0.6 + (i === 3 ? 0.4 : 0) }} />
                  <span style={{ fontFamily: FONT_FAMILY, fontSize: 9, color: "#9ca3af" }}>{WEEK_LABELS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════
  // SCENE 2 — WORKOUT LOG
  // ═══════════════════════════════════════════

  const workouts = [
    { icon: "🏃", name: "Morning Run", val: "5.2 km", delay: 8 },
    { icon: "💪", name: "Strength", val: "45 min", delay: 16 },
    { icon: "🧘", name: "Yoga Flow", val: "30 min", delay: 24 },
  ];

  const scene2 = (
    <div style={{ opacity: interpolate(scene2Entry, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * scene2Opacity, position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 800, color: COLOR_TEXT_DARK, marginBottom: 20, opacity: scene2Entry }}>
        {SCENE2_TEXT}
      </div>
      {phoneMockup(
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {workouts.map((w, i) => {
            const wEntry = frame >= TIMING_SCENE2_START + w.delay ? springAt(TIMING_SCENE2_START + w.delay) : 0;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, background: "#f0fdf4", opacity: wEntry, transform: \\\`translateX(\\\${interpolate(wEntry, [0, 1], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\` }}>
                <div style={{ fontSize: 28 }}>{w.icon}</div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 700, color: COLOR_TEXT_DARK }}>{w.name}</div>
                  <div style={{ fontFamily: FONT_FAMILY, fontSize: 12, color: "#6b7280" }}>Today</div>
                </div>
                <div style={{ fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 700, color: COLOR_ACCENT }}>{w.val}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════
  // SCENE 3 — CTA
  // ═══════════════════════════════════════════

  const ctaNameEntry = frame >= TIMING_SCENE3_START + 5 ? springAt(TIMING_SCENE3_START + 5) : 0;
  const ctaTagEntry = frame >= TIMING_SCENE3_START + 20 ? springAt(TIMING_SCENE3_START + 20) : 0;
  const ctaBtnEntry = frame >= TIMING_SCENE3_START + 35 ? springAt(TIMING_SCENE3_START + 35) : 0;

  const scene3 = (
    <div style={{ opacity: interpolate(scene3Entry, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div style={{ fontFamily: FONT_FAMILY, fontSize: 56, fontWeight: 900, color: COLOR_TEXT_DARK, opacity: ctaNameEntry, transform: \\\`scale(\\\${interpolate(ctaNameEntry, [0, 1], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})\\\` }}>
        {APP_NAME}
      </div>
      <div style={{ fontFamily: FONT_FAMILY, fontSize: 22, color: "#6b7280", opacity: ctaTagEntry, transform: \\\`translateY(\\\${interpolate(ctaTagEntry, [0, 1], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\` }}>
        {TAGLINE}
      </div>
      <div style={{ marginTop: 20, padding: "16px 48px", borderRadius: 50, background: COLOR_ACCENT, fontFamily: FONT_FAMILY, fontSize: 20, fontWeight: 700, color: COLOR_TEXT_LIGHT, opacity: ctaBtnEntry, transform: \\\`scale(\\\${interpolate(ctaBtnEntry, [0, 1], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})\\\`, boxShadow: "0 8px 30px rgba(5,150,105,0.35)" }}>
        {CTA_TEXT}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: \\\`linear-gradient(160deg, \\\${bgColor1}, \\\${bgColor2})\\\`, fontFamily: FONT_FAMILY }}>
      {particles}
      {frame < TIMING_SCENE2_START && scene1}
      {frame >= TIMING_SCENE2_START && frame < TIMING_SCENE3_START && scene2}
      {frame >= TIMING_SCENE3_START && scene3}
    </AbsoluteFill>
  );
};`;

export const appPromoFitnessExample: RemotionExample = {
  id: "app-promo-fitness",
  name: "App Promo Fitness",
  description:
    "Fitness app promotional video with mint/emerald gradient, 3D phone mockup showing workout dashboard with circular calorie chart, step counter, weekly bar graph, and spring animations.",
  code: appPromoFitnessCode,
  durationInFrames: 300,
  fps: 30,
  category: "Other",
};
