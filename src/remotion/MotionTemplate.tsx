import {
  AbsoluteFill,
  interpolate,
  Series,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Types ───

export interface MotionScene {
  type: "logo-intro" | "countup" | "text-reveal" | "hero" | "closing";
  title: string;
  subtitle?: string;
  brandName?: string;
  slogan?: string;
  metrics?: { label: string; value: number; unit?: string; prefix?: string }[];
  lines?: string[];
  cta?: string;
  url?: string;
}

export interface MotionProps {
  scenes: MotionScene[];
  theme?: {
    bg: string;
    accent: string;
    text: string;
    font: string;
  };
}

// ─── Theme ───

const DEFAULT_THEME = {
  bg: "#0f172a",
  accent: "#6366f1",
  text: "#ffffff",
  font: "Inter, system-ui, sans-serif",
};

// ─── Spring ───

function useSpring(delay: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 15, stiffness: 180 },
    durationInFrames: 25,
  });
}

// ─── Logo Intro Scene ───

function LogoIntroScene({ scene, theme }: { scene: MotionScene; theme: typeof DEFAULT_THEME }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 30 });
  const nameSpring = useSpring(40);
  const sloganSpring = useSpring(65);
  const brandName = scene.brandName || scene.title;
  const slogan = scene.slogan || scene.subtitle || "";

  // Glow pulse
  const glowSize = frame > 50 ? 30 + Math.sin((frame - 50) * 0.08) * 15 : interpolate(logoScale, [0, 1], [0, 30], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${theme.bg} 0%, #1e1b4b 100%)`, fontFamily: theme.font, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, overflow: "hidden" }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${theme.accent}30, transparent 70%)`, top: "30%", left: "50%", transform: "translate(-50%, -50%)", filter: "blur(40px)" }} />

      {/* Logo circle */}
      <div style={{
        width: 110, height: 110, borderRadius: "50%",
        background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${interpolate(logoScale, [0, 1], [0, 1], { extrapolateRight: "clamp" })})`,
        boxShadow: `0 0 ${glowSize}px ${theme.accent}80`,
      }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: theme.text }}>{brandName[0]}</div>
      </div>

      {/* Brand name — letter stagger */}
      <div style={{ display: "flex", opacity: nameSpring, letterSpacing: 12, fontSize: 52, fontWeight: 900, color: theme.text }}>
        {brandName.split("").map((char, i) => {
          const s = useSpring(42 + i * 3);
          const y = interpolate(s, [0, 1], [25, 0], { extrapolateRight: "clamp" });
          return <span key={i} style={{ display: "inline-block", transform: `translateY(${y}px)`, opacity: s }}>{char}</span>;
        })}
      </div>

      {/* Slogan */}
      {slogan && (
        <div style={{ fontSize: 20, fontWeight: 400, color: `${theme.text}99`, opacity: sloganSpring, letterSpacing: 2 }}>
          {slogan}
        </div>
      )}
    </AbsoluteFill>
  );
}

// ─── Countup Scene ───

function CountupScene({ scene, theme }: { scene: MotionScene; theme: typeof DEFAULT_THEME }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const metrics = scene.metrics || [];
  const titleSpring = useSpring(5);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${theme.bg} 0%, #1e1b4b 100%)`, fontFamily: theme.font, overflow: "hidden" }}>
      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `linear-gradient(${theme.accent} 1px, transparent 1px), linear-gradient(90deg, ${theme.accent} 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />

      <div style={{ position: "absolute", top: 80, left: 60, right: 60, bottom: 80, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
        {/* Title */}
        <div style={{ fontSize: 40, fontWeight: 800, color: theme.text, opacity: titleSpring, textAlign: "center" }}>
          {scene.title}
        </div>

        {/* Metrics grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
          {metrics.map((m, i) => {
            const delay = 20 + i * 10;
            const s = useSpring(delay);
            const progress = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 30, stiffness: 80 }, durationInFrames: 60 });
            const currentValue = Math.round(interpolate(progress, [0, 1], [0, m.value], { extrapolateRight: "clamp" }));

            return (
              <div key={i} style={{
                background: "#ffffff08",
                borderRadius: 20,
                border: "1px solid #ffffff15",
                padding: "32px 40px",
                minWidth: 260,
                textAlign: "center",
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [30, 0], { extrapolateRight: "clamp" })}px)`,
                backdropFilter: "blur(10px)",
              }}>
                <div style={{ fontSize: 64, fontWeight: 900, color: theme.accent, lineHeight: 1 }}>
                  {m.prefix || ""}{currentValue.toLocaleString()}{m.unit || ""}
                </div>
                <div style={{ fontSize: 18, fontWeight: 500, color: `${theme.text}80`, marginTop: 12, letterSpacing: 1 }}>
                  {m.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Text Reveal Scene ───

function TextRevealScene({ scene, theme }: { scene: MotionScene; theme: typeof DEFAULT_THEME }) {
  const lines = scene.lines || [scene.title];

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.font, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Accent side bar */}
      <div style={{ position: "absolute", left: 60, top: "20%", width: 4, height: "60%", background: `linear-gradient(180deg, ${theme.accent}, transparent)`, borderRadius: 2 }} />

      <div style={{ padding: "0 100px", maxWidth: 900 }}>
        {lines.map((line, i) => {
          const s = useSpring(10 + i * 12);
          const y = interpolate(s, [0, 1], [40, 0], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              fontSize: i === 0 ? 56 : 44,
              fontWeight: i === 0 ? 900 : 700,
              color: i === 0 ? theme.text : `${theme.text}cc`,
              lineHeight: 1.3,
              marginBottom: 16,
              opacity: s,
              transform: `translateY(${y}px)`,
            }}>
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ─── Hero Scene ───

function HeroScene({ scene, theme }: { scene: MotionScene; theme: typeof DEFAULT_THEME }) {
  const titleSpring = useSpring(8);
  const subSpring = useSpring(22);
  const titleY = interpolate(titleSpring, [0, 1], [40, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(145deg, ${theme.bg} 0%, #1e1b4b 50%, #0f172a 100%)`, fontFamily: theme.font, overflow: "hidden" }}>
      {/* Watermark */}
      <div style={{ position: "absolute", right: -30, top: "10%", fontSize: 280, fontWeight: 900, color: "#ffffff05", lineHeight: 1 }}>
        {(scene.brandName || "V")[0]}
      </div>

      <div style={{ position: "absolute", top: 80, left: 60, right: 60, bottom: 80, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ opacity: titleSpring, transform: `translateY(${titleY}px)` }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: theme.text, lineHeight: 1.1, marginBottom: 20 }}>
            {scene.title}
          </div>
        </div>
        {scene.subtitle && (
          <div style={{ opacity: subSpring, fontSize: 26, fontWeight: 400, color: `${theme.text}99`, lineHeight: 1.5 }}>
            {scene.subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

// ─── Closing Scene ───

function ClosingScene({ scene, theme }: { scene: MotionScene; theme: typeof DEFAULT_THEME }) {
  const logoSpring = useSpring(8);
  const ctaSpring = useSpring(30);
  const logoScale = interpolate(logoSpring, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const brandName = scene.brandName || scene.title;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(145deg, ${theme.bg} 0%, #1e1b4b 100%)`, fontFamily: theme.font, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Watermark */}
      <div style={{ position: "absolute", fontSize: 280, fontWeight: 900, color: "#ffffff04", lineHeight: 1 }}>
        {brandName}
      </div>

      {/* Logo */}
      <div style={{
        width: 100, height: 100, borderRadius: 50,
        background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${logoScale})`,
        boxShadow: `0 0 30px ${theme.accent}60`,
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: theme.text }}>{brandName[0]}</div>
      </div>

      <div style={{ fontSize: 24, fontWeight: 800, color: theme.text, letterSpacing: 6, opacity: logoSpring, marginBottom: 32 }}>
        {brandName}
      </div>

      {scene.cta && (
        <div style={{ opacity: ctaSpring, fontSize: 28, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          {scene.cta}
        </div>
      )}

      {scene.url && (
        <div style={{ opacity: ctaSpring, background: theme.accent, borderRadius: 100, padding: "10px 28px", fontSize: 18, fontWeight: 600, color: theme.text }}>
          {scene.url}
        </div>
      )}
    </AbsoluteFill>
  );
}

// ─── Scene Router ───

const SCENE_MAP: Record<string, React.FC<{ scene: MotionScene; theme: typeof DEFAULT_THEME }>> = {
  "logo-intro": LogoIntroScene,
  countup: CountupScene,
  "text-reveal": TextRevealScene,
  hero: HeroScene,
  closing: ClosingScene,
};

// ─── Main Template ───

export const MotionTemplate: React.FC<MotionProps> = ({ scenes, theme }) => {
  const t = { ...DEFAULT_THEME, ...theme };

  return (
    <AbsoluteFill>
      <Series>
        {scenes.map((scene, i) => {
          const SceneComponent = SCENE_MAP[scene.type] || HeroScene;
          return (
            <Series.Sequence key={i} durationInFrames={150}>
              <SceneComponent scene={scene} theme={t} />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
