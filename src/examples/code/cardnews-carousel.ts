import { RemotionExample } from "./index";

export const cardnewsCarouselCode = `import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

export const MyAnimation = () => {
  /**
   * Card News Carousel — Instagram 4:5 (1080×1350)
   * Complete card news set: Cover → Body (list mode) → Body (split mode) → Closing
   * Each section appears as a Sequence. 12 seconds total, 30fps.
   * Professional theme with blue accent.
   */
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const FONT = "Pretendard Variable, Inter, system-ui, sans-serif";
  const COLOR_ACCENT = "#3b82f6";
  const COLOR_TEXT = "#ffffff";
  const COLOR_TEXT_DARK = "#171717";
  const COLOR_TEXT_SEC = "#525252";
  const SAFE = { top: 60, bottom: 80, sides: 48 };

  const springSnappy = (f: number, delay: number) =>
    spring({ frame: Math.max(0, f - delay), fps, config: { damping: 15, stiffness: 200 }, durationInFrames: 25 });

  const springSmooth = (f: number, delay: number) =>
    spring({ frame: Math.max(0, f - delay), fps, config: { damping: 20, stiffness: 120 }, durationInFrames: 30 });

  // ═══════════════════════════════════════════
  // SLIDE 1: COVER (표지)
  // ═══════════════════════════════════════════

  const Cover = ({ f }: { f: number }) => {
    const tagEntry = springSnappy(f, 12);
    const tagY = interpolate(tagEntry, [0, 1], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const headEntry = springSnappy(f, 20);
    const headY = interpolate(headEntry, [0, 1], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const subEntry = springSnappy(f, 40);
    const subY = interpolate(subEntry, [0, 1], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
      <AbsoluteFill style={{ background: "linear-gradient(170deg, #1e293b 0%, #0f172a 100%)", fontFamily: FONT }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: \\\`radial-gradient(circle, \\\${COLOR_ACCENT}15, transparent 70%)\\\`, top: "20%", right: "-10%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", top: SAFE.top, left: SAFE.sides, right: SAFE.sides, bottom: SAFE.bottom, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLOR_TEXT, letterSpacing: 4, opacity: springSnappy(f, 5) }}>BRAND</div>
          <div style={{ flex: 1 }} />
          <div style={{ alignSelf: "flex-start", padding: "8px 20px", borderRadius: 100, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.4)", fontSize: 20, fontWeight: 600, color: "#dbeafe", opacity: tagEntry, transform: \\\`translateY(\\\${tagY}px)\\\`, marginBottom: 24 }}>EP.3 디자인 전략</div>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.2, color: COLOR_TEXT, opacity: headEntry, transform: \\\`translateY(\\\${headY}px)\\\`, marginBottom: 20 }}>
            경쟁사가 제일 먼저{" "}베끼는 건 <span style={{ background: COLOR_ACCENT, padding: "2px 12px", borderRadius: 6 }}>기술</span>이{" "}아닙니다
          </div>
          <div style={{ fontSize: 24, fontWeight: 400, color: "rgba(255,255,255,0.7)", opacity: subEntry, transform: \\\`translateY(\\\${subY}px)\\\` }}>디자인 특허로 브랜드를 지키는 법</div>
        </div>
      </AbsoluteFill>
    );
  };

  // ═══════════════════════════════════════════
  // SLIDE 2: BODY — LIST MODE (본문 목록형)
  // ═══════════════════════════════════════════

  const BodyList = ({ f }: { f: number }) => {
    const items = [
      "독창적인 외관 — 기존에 없던 형상·모양·색채 조합",
      "시각적 심미감 — 기능이 아닌 '보는 즐거움' 기준",
      "물품성 — 양산 가능한 구체적 물건에 적용",
      "신규성 — 출원일 기준 공개된 적 없는 디자인",
    ];
    const stripeW = interpolate(f, [0, 15], [0, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const titleEntry = springSnappy(f, 10);

    return (
      <AbsoluteFill style={{ background: "#fafafa", fontFamily: FONT }}>
        <div style={{ position: "absolute", top: SAFE.top, left: SAFE.sides, right: SAFE.sides, bottom: SAFE.bottom, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{ width: \\\`\\\${stripeW}%\\\`, height: 4, background: COLOR_ACCENT, borderRadius: 2 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: COLOR_ACCENT, opacity: springSnappy(f, 5), letterSpacing: 2 }}>02</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: COLOR_TEXT_DARK, marginBottom: 36, opacity: titleEntry, transform: \\\`translateY(\\\${interpolate(titleEntry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\` }}>디자인 특허의 4가지 핵심 요소</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
            {items.map((item, i) => {
              const d = 25 + i * 5;
              const entry = f >= d ? springSmooth(f, d) : 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, opacity: entry, transform: \\\`translateY(\\\${interpolate(entry, [0, 1], [25, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\` }}>
                  <div style={{ minWidth: 36, height: 36, borderRadius: "50%", background: COLOR_ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>{i + 1}</div>
                  <div style={{ fontSize: 24, color: COLOR_TEXT_SEC, lineHeight: 1.5 }}>{item}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 28, padding: "20px 24px", background: "#eff6ff", borderLeft: \\\`4px solid \\\${COLOR_ACCENT}\\\`, borderRadius: 12, opacity: springSmooth(f, 50) }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: COLOR_ACCENT }}>💡 외관이 곧 경쟁력입니다</div>
          </div>
        </div>
      </AbsoluteFill>
    );
  };

  // ═══════════════════════════════════════════
  // SLIDE 3: BODY — SPLIT MODE (본문 비교형)
  // ═══════════════════════════════════════════

  const BodySplit = ({ f }: { f: number }) => {
    const left = ["경쟁사가 외관을 그대로 복제", "시장에서 브랜드 혼동 발생", "법적 대응 수단 없음"];
    const right = ["디자인권으로 즉시 침해 차단", "독보적 브랜드 아이덴티티", "손해배상 + 판매금지 청구 가능"];
    const divH = interpolate(f, [18, 45], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const titleEntry = springSnappy(f, 10);
    const colW = (width - SAFE.sides * 2 - 24) / 2;

    return (
      <AbsoluteFill style={{ background: "#fafafa", fontFamily: FONT }}>
        <div style={{ position: "absolute", top: SAFE.top, left: SAFE.sides, right: SAFE.sides, bottom: SAFE.bottom, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{ width: \\\`\\\${interpolate(f, [0, 15], [0, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%\\\`, height: 4, background: COLOR_ACCENT, borderRadius: 2 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: COLOR_ACCENT, opacity: springSnappy(f, 5), letterSpacing: 2 }}>04</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: COLOR_TEXT_DARK, marginBottom: 36, opacity: titleEntry, transform: \\\`translateY(\\\${interpolate(titleEntry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\` }}>디자인 보호 전 vs 후</div>
          <div style={{ display: "flex", flex: 1, position: "relative" }}>
            <div style={{ width: colW, display: "flex", flexDirection: "column", gap: 16, paddingRight: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#ef4444", letterSpacing: 3, opacity: springSnappy(f, 20), padding: "8px 16px", background: "#fef2f2", borderRadius: 8, alignSelf: "flex-start", marginBottom: 8 }}>BEFORE</div>
              {left.map((item, i) => {
                const entry = f >= 28 + i * 5 ? springSmooth(f, 28 + i * 5) : 0;
                return <div key={i} style={{ display: "flex", gap: 10, opacity: entry, transform: \\\`translateY(\\\${interpolate(entry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\` }}><span style={{ color: "#ef4444", fontSize: 20 }}>✕</span><span style={{ fontSize: 22, color: COLOR_TEXT_SEC, lineHeight: 1.5 }}>{item}</span></div>;
              })}
            </div>
            <div style={{ width: 1, background: "#e5e5e5", overflow: "hidden" }}><div style={{ width: "100%", height: \\\`\\\${divH}%\\\`, background: "linear-gradient(#ef444440, #22c55e40)" }} /></div>
            <div style={{ width: colW, display: "flex", flexDirection: "column", gap: 16, paddingLeft: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#22c55e", letterSpacing: 3, opacity: springSnappy(f, 24), padding: "8px 16px", background: "#f0fdf4", borderRadius: 8, alignSelf: "flex-start", marginBottom: 8 }}>AFTER</div>
              {right.map((item, i) => {
                const entry = f >= 35 + i * 5 ? springSmooth(f, 35 + i * 5) : 0;
                return <div key={i} style={{ display: "flex", gap: 10, opacity: entry, transform: \\\`translateY(\\\${interpolate(entry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)\\\` }}><span style={{ color: "#22c55e", fontSize: 20 }}>✓</span><span style={{ fontSize: 22, color: COLOR_TEXT_SEC, lineHeight: 1.5 }}>{item}</span></div>;
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  };

  // ═══════════════════════════════════════════
  // SLIDE 4: CLOSING (마무리)
  // ═══════════════════════════════════════════

  const Closing = ({ f }: { f: number }) => {
    const logoEntry = spring({ frame: Math.max(0, f - 10), fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 25 });
    const logoScale = interpolate(logoEntry, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ctaEntry = springSmooth(f, 35);
    const ctaY = interpolate(ctaEntry, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
      <AbsoluteFill style={{ background: "linear-gradient(170deg, #1e293b 0%, #0f172a 100%)", fontFamily: FONT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: \\\`radial-gradient(circle, \\\${COLOR_ACCENT}20, transparent 70%)\\\`, top: "35%", left: "50%", transform: "translate(-50%, -50%)", filter: "blur(60px)" }} />
        <div style={{ width: 120, height: 120, borderRadius: "50%", background: \\\`linear-gradient(135deg, \\\${COLOR_ACCENT}, #60a5fa)\\\`, display: "flex", alignItems: "center", justifyContent: "center", transform: \\\`scale(\\\${logoScale})\\\`, boxShadow: \\\`0 0 40px \\\${COLOR_ACCENT}80\\\`, marginBottom: 28 }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: COLOR_TEXT }}>B</div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: COLOR_TEXT, letterSpacing: 8, opacity: logoEntry, marginBottom: 40 }}>BRAND</div>
        <div style={{ width: \\\`\\\${interpolate(f, [25, 50], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%\\\`, height: 2, background: \\\`linear-gradient(90deg, transparent, \\\${COLOR_ACCENT}, transparent)\\\`, marginBottom: 40 }} />
        <div style={{ fontSize: 32, fontWeight: 700, color: COLOR_TEXT, opacity: ctaEntry, transform: \\\`translateY(\\\${ctaY}px)\\\`, marginBottom: 24 }}>디자인 특허, 지금 시작하세요</div>
        <div style={{ fontSize: 20, fontWeight: 500, color: COLOR_ACCENT, opacity: springSmooth(f, 50), letterSpacing: 2 }}>brand.com</div>
        <div style={{ position: "absolute", bottom: 40, fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,0.5)", opacity: springSmooth(f, 65) * 0.5 }}>© 2026 Brand. All rights reserved.</div>
      </AbsoluteFill>
    );
  };

  // ═══════════════════════════════════════════
  // COMPOSITION: 4 slides × 90 frames each = 360 frames (12s)
  // ═══════════════════════════════════════════

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90} name="Cover">
        <Cover f={frame} />
      </Sequence>
      <Sequence from={90} durationInFrames={90} name="Body-List">
        <BodyList f={frame - 90} />
      </Sequence>
      <Sequence from={180} durationInFrames={90} name="Body-Split">
        <BodySplit f={frame - 180} />
      </Sequence>
      <Sequence from={270} durationInFrames={90} name="Closing">
        <Closing f={frame - 270} />
      </Sequence>
    </AbsoluteFill>
  );
};`;

export const cardnewsCarouselExample: RemotionExample = {
  id: "cardnews-carousel",
  name: "카드뉴스",
  description:
    "인스타그램 카드뉴스 카루셀. 표지 → 본문(목록/비교) → 마무리 자동 구성. 4:5 세로형",
  code: cardnewsCarouselCode,
  durationInFrames: 360,
  fps: 30,
  category: "Other",
};
