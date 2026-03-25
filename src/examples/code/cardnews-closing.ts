import { RemotionExample } from "./index";

export const cardnewsClosingCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyAnimation = () => {
  /**
   * Card News Closing Slide (마무리) — Instagram 4:5 (1080×1350)
   * Brand logo centered with scale spring, CTA text, website URL,
   * and disclaimer at bottom. Clean, minimal. Static PNG output.
   * Professional theme.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ═══════════════════════════════════════════
  // CONTENT
  // ═══════════════════════════════════════════

  const BRAND_NAME = "BRAND";
  const CTA_TEXT = "디자인 특허, 지금 시작하세요";
  const WEBSITE = "brand.com";
  const PHONE = "02-1234-5678";
  const DISCLAIMER = "© 2026 Brand. All rights reserved.";

  // ═══════════════════════════════════════════
  // COLORS
  // ═══════════════════════════════════════════

  const COLOR_BG_START = "#1e293b";
  const COLOR_BG_END = "#0f172a";
  const COLOR_ACCENT = "#3b82f6";
  const COLOR_TEXT = "#ffffff";
  const COLOR_TEXT_DIM = "rgba(255,255,255,0.5)";
  const COLOR_LOGO_GLOW = "#3b82f6";

  const FONT = "Pretendard Variable, Inter, system-ui, sans-serif";

  // ═══════════════════════════════════════════
  // SPRINGS
  // ═══════════════════════════════════════════

  const springAt = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 30 });

  const springSnappy = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 25 });

  // ═══════════════════════════════════════════
  // LOGO
  // ═══════════════════════════════════════════

  const logoEntry = springSnappy(10);
  const logoScale = interpolate(logoEntry, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoGlow = interpolate(logoEntry, [0, 1], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ═══════════════════════════════════════════
  // CTA
  // ═══════════════════════════════════════════

  const ctaEntry = springAt(35);
  const ctaY = interpolate(ctaEntry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ═══════════════════════════════════════════
  // CONTACT INFO
  // ═══════════════════════════════════════════

  const urlEntry = springAt(50);
  const phoneEntry = springAt(58);

  // ═══════════════════════════════════════════
  // DECORATIVE LINE
  // ═══════════════════════════════════════════

  const lineWidth = interpolate(frame, [25, 50], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ═══════════════════════════════════════════
  // DISCLAIMER
  // ═══════════════════════════════════════════

  const disclaimerEntry = springAt(65);

  return (
    <AbsoluteFill style={{
      background: \\\`linear-gradient(170deg, \\\${COLOR_BG_START} 0%, \\\${COLOR_BG_END} 100%)\\\`,
      fontFamily: FONT,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: \\\`radial-gradient(circle, \\\${COLOR_LOGO_GLOW}20, transparent 70%)\\\`,
        top: "35%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        filter: "blur(60px)",
      }} />

      {/* Logo circle */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: \\\`linear-gradient(135deg, \\\${COLOR_ACCENT}, #60a5fa)\\\`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: \\\`scale(\\\${logoScale})\\\`,
        boxShadow: \\\`0 0 \\\${logoGlow}px \\\${COLOR_LOGO_GLOW}80\\\`,
        marginBottom: 28,
      }}>
        <div style={{
          fontFamily: FONT, fontSize: 44, fontWeight: 900, color: COLOR_TEXT,
        }}>
          B
        </div>
      </div>

      {/* Brand name */}
      <div style={{
        fontFamily: FONT, fontSize: 28, fontWeight: 800, color: COLOR_TEXT,
        letterSpacing: 8, opacity: logoEntry, marginBottom: 40,
      }}>
        {BRAND_NAME}
      </div>

      {/* Decorative line */}
      <div style={{
        width: \\\`\\\${lineWidth}%\\\`,
        height: 2,
        background: \\\`linear-gradient(90deg, transparent, \\\${COLOR_ACCENT}, transparent)\\\`,
        marginBottom: 40,
      }} />

      {/* CTA */}
      <div style={{
        fontFamily: FONT, fontSize: 32, fontWeight: 700, color: COLOR_TEXT,
        opacity: ctaEntry,
        transform: \\\`translateY(\\\${ctaY}px)\\\`,
        marginBottom: 24,
        textAlign: "center",
      }}>
        {CTA_TEXT}
      </div>

      {/* Website */}
      <div style={{
        fontFamily: FONT, fontSize: 20, fontWeight: 500, color: COLOR_ACCENT,
        opacity: urlEntry, letterSpacing: 2, marginBottom: 12,
      }}>
        {WEBSITE}
      </div>

      {/* Phone */}
      <div style={{
        fontFamily: FONT, fontSize: 18, fontWeight: 400, color: COLOR_TEXT_DIM,
        opacity: phoneEntry, letterSpacing: 1,
      }}>
        {PHONE}
      </div>

      {/* Disclaimer */}
      <div style={{
        position: "absolute",
        bottom: 40,
        fontFamily: FONT, fontSize: 14, fontWeight: 300, color: COLOR_TEXT_DIM,
        opacity: disclaimerEntry * 0.5,
      }}>
        {DISCLAIMER}
      </div>
    </AbsoluteFill>
  );
};`;

export const cardnewsClosingExample: RemotionExample = {
  id: "cardnews-closing",
  name: "카드뉴스 마무리",
  description:
    "인스타 카드뉴스 마무리 슬라이드. 브랜드 로고 스프링, CTA, 연락처, 다크 그라데이션",
  code: cardnewsClosingCode,
  durationInFrames: 90,
  fps: 30,
  category: "Other",
};
