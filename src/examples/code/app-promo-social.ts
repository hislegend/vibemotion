import { RemotionExample } from "./index";

export const appPromoSocialCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

export const MyAnimation = () => {
  /**
   * SNS app promotional video with Instagram/TikTok-style feed UI.
   * Features 3D tilted phone mockup on lavender gradient, social feed
   * with profile photos, hearts, comments, and story rings.
   * 3 scenes: Feed → Stories → CTA with spring-based staggered entrances.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ═══════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════

  const APP_NAME = "Vibelink";
  const TAGLINE = "Connect with your world";
  const SCENE1_TEXT = "Your Feed, Your Way";
  const SCENE2_TEXT = "Stories That Shine";
  const CTA_TEXT = "Join Now — Free";

  const COLOR_BG_1 = "#c4b5fd";
  const COLOR_BG_2 = "#a78bfa";
  const COLOR_BG_3 = "#8b5cf6";
  const COLOR_ACCENT = "#7c3aed";
  const COLOR_ACCENT_LIGHT = "#ddd6fe";
  const COLOR_TEXT_DARK = "#1e1b4b";
  const COLOR_TEXT_LIGHT = "#ffffff";
  const COLOR_CARD = "#ffffff";
  const COLOR_HEART = "#ef4444";
  const COLOR_STORY_RING = "linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)";

  const TIMING_SCENE1_START = 0;
  const TIMING_SCENE2_START = 100;
  const TIMING_SCENE3_START = 200;
  const TIMING_TOTAL = 300;

  const FONT_FAMILY = "Inter, system-ui, sans-serif";

  // ═══════════════════════════════════════════
  // SPRING HELPERS
  // ═══════════════════════════════════════════

  const sp = (f: number, delay = 0) =>
    spring({ frame: f, fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 30 }) *
    (f >= delay ? 1 : 0);

  const springAt = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 30 });

  const springExit = (startFrame: number) =>
    spring({ frame: frame - startFrame, fps, config: { damping: 16, stiffness: 80 }, durationInFrames: 20 });

  // ═══════════════════════════════════════════
  // SCENE TRANSITIONS
  // ═══════════════════════════════════════════

  const scene1Opacity = interpolate(frame, [TIMING_SCENE2_START - 15, TIMING_SCENE2_START], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scene2Entry = frame >= TIMING_SCENE2_START ? springAt(TIMING_SCENE2_START) : 0;
  const scene2Opacity = interpolate(frame, [TIMING_SCENE3_START - 15, TIMING_SCENE3_START], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scene3Entry = frame >= TIMING_SCENE3_START ? springAt(TIMING_SCENE3_START) : 0;

  // ═══════════════════════════════════════════
  // BACKGROUND GRADIENT
  // ═══════════════════════════════════════════

  const bgProgress = interpolate(frame, [0, TIMING_TOTAL], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bgColor1 = bgProgress < 0.33 ? COLOR_BG_1 : bgProgress < 0.66 ? COLOR_BG_2 : COLOR_BG_3;
  const bgColor2 = bgProgress < 0.33 ? COLOR_BG_2 : bgProgress < 0.66 ? COLOR_BG_3 : COLOR_ACCENT;

  // ═══════════════════════════════════════════
  // PHONE MOCKUP
  // ═══════════════════════════════════════════

  const phoneEntry = springAt(5);
  const phoneScale = interpolate(phoneEntry, [0, 1], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const phoneY = interpolate(phoneEntry, [0, 1], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const phoneMockup = (children: any) => (
    <div
      style={{
        width: width * 0.55,
        height: height * 0.6,
        borderRadius: 36,
        background: COLOR_CARD,
        boxShadow: "0 25px 80px rgba(124,58,237,0.3), 0 8px 24px rgba(0,0,0,0.15)",
        overflow: "hidden",
        transform: \\\`perspective(1200px) rotateY(-8deg) rotateX(5deg) scale(\\\${phoneScale}) translateY(\\\${phoneY}px)\\\`,
        transformStyle: "preserve-3d",
        position: "relative",
        border: "3px solid #e5e7eb",
      }}
    >
      <div style={{ width: "100%", height: 40, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ width: 60, height: 6, borderRadius: 3, background: "#1e1b4b" }} />
      </div>
      {children}
    </div>
  );

  // ═══════════════════════════════════════════
  // BOKEH PARTICLES
  // ═══════════════════════════════════════════

  const particles = Array.from({ length: 18 }, (_, i) => {
    const x = ((i * 137.5) % 100);
    const y = ((i * 73.1 + 20) % 100);
    const size = 6 + (i % 4) * 4;
    const delay = i * 4;
    const opacity = frame > delay
      ? interpolate(frame - delay, [0, 30, 80, 100], [0, 0.25, 0.25, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 0;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: \\\`\\\${x}%\\\`,
          top: \\\`\\\${y}%\\\`,
          width: size,
          height: size,
          borderRadius: "50%",
          background: i % 2 === 0 ? COLOR_ACCENT_LIGHT : COLOR_BG_1,
          opacity,
          filter: "blur(2px)",
        }}
      />
    );
  });

  // ═══════════════════════════════════════════
  // SCENE 1 — FEED
  // ═══════════════════════════════════════════

  const feedPosts = [
    { user: "Alex", likes: "2.4K", comment: "12", delay: 15 },
    { user: "Mika", likes: "891", comment: "7", delay: 25 },
    { user: "Jun", likes: "5.1K", comment: "34", delay: 35 },
  ];

  const scene1 = (
    <div style={{ opacity: scene1Opacity, position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT_FAMILY, fontSize: 42, fontWeight: 800, color: COLOR_TEXT_DARK, marginBottom: 20, opacity: springAt(10), transform: \\\`translateY(\\\${interpolate(springAt(10), [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\` }}>
        {SCENE1_TEXT}
      </div>
      {phoneMockup(
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {feedPosts.map((post, i) => {
            const postEntry = frame >= post.delay ? springAt(post.delay) : 0;
            const postY = interpolate(postEntry, [0, 1], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, background: "#f8fafc", opacity: postEntry, transform: \\\`translateY(\\\${postY}px)\\\` }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: \\\`linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)\\\`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: COLOR_ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 700, color: COLOR_TEXT_DARK }}>{post.user[0]}</div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: FONT_FAMILY, fontSize: 13, fontWeight: 700, color: COLOR_TEXT_DARK }}>{post.user}</div>
                  <div style={{ height: 8, width: "80%", borderRadius: 4, background: "#e5e7eb", marginTop: 4 }} />
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 14, color: COLOR_HEART }}>♥</span>
                    <span style={{ fontFamily: FONT_FAMILY, fontSize: 11, color: "#64748b" }}>{post.likes}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>💬</span>
                    <span style={{ fontFamily: FONT_FAMILY, fontSize: 11, color: "#64748b" }}>{post.comment}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════
  // SCENE 2 — STORIES
  // ═══════════════════════════════════════════

  const storyUsers = ["Ella", "Noah", "Yuki", "Sam", "Rin"];

  const scene2 = (
    <div style={{ opacity: interpolate(scene2Entry, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * scene2Opacity, position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT_FAMILY, fontSize: 42, fontWeight: 800, color: COLOR_TEXT_DARK, marginBottom: 20, opacity: scene2Entry, transform: \\\`translateY(\\\${interpolate(scene2Entry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\` }}>
        {SCENE2_TEXT}
      </div>
      {phoneMockup(
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 16 }}>
            {storyUsers.map((u, i) => {
              const sEntry = frame >= TIMING_SCENE2_START + 10 + i * 6 ? springAt(TIMING_SCENE2_START + 10 + i * 6) : 0;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: sEntry, transform: \\\`scale(\\\${interpolate(sEntry, [0, 1], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})\\\` }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)", padding: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: COLOR_CARD, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: 700, color: COLOR_ACCENT }}>{u[0]}</div>
                  </div>
                  <span style={{ fontFamily: FONT_FAMILY, fontSize: 10, color: COLOR_TEXT_DARK }}>{u}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 24, borderRadius: 16, background: "#f1f5f9", height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 48, opacity: 0.2 }}>📷</div>
          </div>
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
    <div style={{ opacity: interpolate(scene3Entry, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div style={{ fontFamily: FONT_FAMILY, fontSize: 56, fontWeight: 900, color: COLOR_TEXT_DARK, opacity: ctaNameEntry, transform: \\\`scale(\\\${interpolate(ctaNameEntry, [0, 1], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})\\\` }}>
        {APP_NAME}
      </div>
      <div style={{ fontFamily: FONT_FAMILY, fontSize: 22, color: "#6b7280", opacity: ctaTagEntry, transform: \\\`translateY(\\\${interpolate(ctaTagEntry, [0, 1], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\` }}>
        {TAGLINE}
      </div>
      <div style={{ marginTop: 20, padding: "16px 48px", borderRadius: 50, background: COLOR_ACCENT, fontFamily: FONT_FAMILY, fontSize: 20, fontWeight: 700, color: COLOR_TEXT_LIGHT, opacity: ctaBtnEntry, transform: \\\`scale(\\\${interpolate(ctaBtnEntry, [0, 1], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})\\\`, boxShadow: "0 8px 30px rgba(124,58,237,0.35)" }}>
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

export const appPromoSocialExample: RemotionExample = {
  id: "app-promo-social",
  name: "앱 프로모 - SNS",
  description:
    "SNS 앱 프로모. 인스타/틱톡 스타일 피드, 스토리 링, 라벤더 그라디언트, 3D 폰 목업, 스태거 스프링",
  code: appPromoSocialCode,
  durationInFrames: 300,
  fps: 30,
  category: "Other",
};
