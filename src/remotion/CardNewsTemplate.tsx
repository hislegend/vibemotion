import {
  AbsoluteFill,
  interpolate,
  Series,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Types ───

interface SlideContent {
  type: "cover" | "list" | "split" | "flow" | "focus" | "closing";
  title: string;
  subtitle?: string;
  items?: string[];
  left?: string[];
  right?: string[];
  steps?: string[];
  quote?: string;
  highlight?: string;
  cta?: string;
  url?: string;
  brand?: string;
}

interface CardNewsProps {
  slides: SlideContent[];
  theme?: {
    bg: string;
    bgCard: string;
    accent: string;
    text: string;
    font: string;
  };
}

// ─── Theme ───

const DEFAULT_THEME = {
  bg: "#1a1a2e",
  bgCard: "#0a1628",
  accent: "#00AEEF",
  text: "#ffffff",
  font: "Inter, system-ui, sans-serif",
};

const ITEM_COLORS = ["#ef4444", "#f97316", "#8b5cf6", "#ec4899", "#22c55e"];

// ─── Spring helper ───

function useSpring(delay: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 15, stiffness: 200 },
    durationInFrames: 25,
  });
}

// ─── Cover Slide ───

function CoverSlide({ slide, theme }: { slide: SlideContent; theme: typeof DEFAULT_THEME }) {
  const titleSpring = useSpring(8);
  const subSpring = useSpring(25);
  const titleY = interpolate(titleSpring, [0, 1], [40, 0], { extrapolateRight: "clamp" });
  const subY = interpolate(subSpring, [0, 1], [20, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(145deg, ${theme.bg} 0%, #2d2d44 100%)`, fontFamily: theme.font, overflow: "hidden" }}>
      {/* Background watermark */}
      <div style={{ position: "absolute", right: -60, top: "15%", fontSize: 320, fontWeight: 900, color: theme.text, opacity: 0.03, lineHeight: 1 }}>
        {slide.brand || "BRAND"}
      </div>
      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `linear-gradient(${theme.accent} 1px, transparent 1px), linear-gradient(90deg, ${theme.accent} 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      {/* Content */}
      <div style={{ position: "absolute", top: 60, left: 60, right: 60, bottom: 60, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ opacity: titleSpring, transform: `translateY(${titleY}px)` }}>
          <div style={{ fontSize: 78, fontWeight: 900, color: theme.text, lineHeight: 1.05, marginBottom: 24 }}>
            {slide.title}
          </div>
        </div>
        {slide.subtitle && (
          <div style={{ opacity: subSpring, transform: `translateY(${subY}px)` }}>
            <div style={{ width: 60, height: 3, background: theme.accent, marginBottom: 20 }} />
            <div style={{ fontSize: 28, fontWeight: 400, color: `${theme.text}b3`, lineHeight: 1.5 }}>
              {slide.subtitle}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

// ─── List Slide ───

function ListSlide({ slide, theme }: { slide: SlideContent; theme: typeof DEFAULT_THEME }) {
  const items = slide.items || [];

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.font, overflow: "hidden" }}>
      {/* Content */}
      <div style={{ position: "absolute", top: 60, left: 60, right: 60, bottom: 60, display: "flex", flexDirection: "column" }}>
        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <TopBar theme={theme} />
          <div style={{ fontSize: 48, fontWeight: 800, color: theme.text, lineHeight: 1.15, marginTop: 16 }}>
            {slide.title}
          </div>
          {slide.subtitle && (
            <div style={{ fontSize: 22, color: `${theme.text}80`, marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 3, height: 20, background: theme.accent }} />
              {slide.subtitle}
            </div>
          )}
        </div>
        {/* Items card */}
        <div style={{ background: theme.bgCard, borderRadius: 16, border: `1px solid ${theme.text}15`, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {items.map((item, i) => (
            <ListItem key={i} item={item} index={i} theme={theme} isLast={i === items.length - 1} />
          ))}
        </div>
        {/* Highlight */}
        {slide.highlight && <HighlightBar text={slide.highlight} theme={theme} />}
      </div>
    </AbsoluteFill>
  );
}

function ListItem({ item, index, theme, isLast }: { item: string; index: number; theme: typeof DEFAULT_THEME; isLast: boolean }) {
  const s = useSpring(15 + index * 4);
  const y = interpolate(s, [0, 1], [20, 0], { extrapolateRight: "clamp" });
  const color = ITEM_COLORS[index % ITEM_COLORS.length];
  const emojis = ["🔍", "🎯", "📦", "🔑", "💡"];

  return (
    <div style={{ opacity: s, transform: `translateY(${y}px)`, display: "flex", alignItems: "center", padding: "0 24px", height: 110, borderBottom: isLast ? "none" : `1px solid ${theme.text}08` }}>
      <div style={{ width: 6, height: 60, borderRadius: 3, background: color, marginRight: 16, flexShrink: 0 }} />
      <span style={{ fontSize: 24, marginRight: 12 }}>{emojis[index % emojis.length]}</span>
      <span style={{ fontSize: 26, fontWeight: 600, color: theme.text, flex: 1 }}>{item}</span>
      <span style={{ fontSize: 14, color: `${theme.accent}cc`, border: `1px solid ${theme.accent}40`, borderRadius: 6, padding: "4px 12px" }}>
        {`0${index + 1}`}
      </span>
    </div>
  );
}

// ─── Split Slide ───

function SplitSlide({ slide, theme }: { slide: SlideContent; theme: typeof DEFAULT_THEME }) {
  const left = slide.left || [];
  const right = slide.right || [];
  const vsSpring = useSpring(20);

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.font, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 60, left: 60, right: 60, bottom: 60, display: "flex", flexDirection: "column" }}>
        <TopBar theme={theme} />
        <div style={{ fontSize: 48, fontWeight: 800, color: theme.text, lineHeight: 1.15, marginTop: 16, marginBottom: 12 }}>
          {slide.title}
        </div>
        {slide.subtitle && (
          <div style={{ fontSize: 20, color: `${theme.text}80`, marginBottom: 20, lineHeight: 1.5 }}>{slide.subtitle}</div>
        )}
        {/* Cards */}
        <div style={{ display: "flex", gap: 20, flex: 1 }}>
          <SplitCard items={left} label="BEFORE" color="#ef4444" icon="✕" theme={theme} delay={15} />
          {/* VS badge */}
          <div style={{ display: "flex", alignItems: "center", opacity: vsSpring }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: theme.text }}>VS</div>
          </div>
          <SplitCard items={right} label="AFTER" color={theme.accent} icon="✓" theme={theme} delay={25} />
        </div>
        {slide.highlight && <HighlightBar text={slide.highlight} theme={theme} />}
      </div>
    </AbsoluteFill>
  );
}

function SplitCard({ items, label, color, icon, theme, delay }: { items: string[]; label: string; color: string; icon: string; theme: typeof DEFAULT_THEME; delay: number }) {
  const s = useSpring(delay);
  const y = interpolate(s, [0, 1], [30, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{ flex: 1, background: theme.bgCard, borderRadius: 16, border: `2px solid ${color}60`, padding: 24, opacity: s, transform: `translateY(${y}px)`, display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 16, fontWeight: 700, color, letterSpacing: 2, marginBottom: 20 }}>{label}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, fontSize: 22, color: theme.text }}>
          <span style={{ color, fontSize: 18 }}>{icon}</span>
          {item}
        </div>
      ))}
    </div>
  );
}

// ─── Flow Slide ───

function FlowSlide({ slide, theme }: { slide: SlideContent; theme: typeof DEFAULT_THEME }) {
  const steps = slide.steps || [];

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.font, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 60, left: 60, right: 60, bottom: 60, display: "flex", flexDirection: "column" }}>
        <TopBar theme={theme} />
        <div style={{ fontSize: 48, fontWeight: 800, color: theme.text, lineHeight: 1.15, marginTop: 16, marginBottom: 32 }}>
          {slide.title}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          {steps.map((step, i) => (
            <FlowStep key={i} step={step} index={i} theme={theme} isLast={i === steps.length - 1} />
          ))}
        </div>
        {slide.highlight && <HighlightBar text={slide.highlight} theme={theme} />}
      </div>
    </AbsoluteFill>
  );
}

function FlowStep({ step, index, theme, isLast }: { step: string; index: number; theme: typeof DEFAULT_THEME; isLast: boolean }) {
  const s = useSpring(15 + index * 8);
  const y = interpolate(s, [0, 1], [25, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{ opacity: s, transform: `translateY(${y}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 26, background: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: theme.text, flexShrink: 0 }}>
          {index + 1}
        </div>
        <div style={{ background: theme.bgCard, borderRadius: 14, padding: "20px 28px", flex: 1, border: `1px solid ${theme.text}15` }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: theme.text }}>{step}</div>
        </div>
      </div>
      {!isLast && (
        <div style={{ width: 2, height: 24, background: `${theme.accent}40`, marginLeft: 25 }} />
      )}
    </div>
  );
}

// ─── Focus Slide ───

function FocusSlide({ slide, theme }: { slide: SlideContent; theme: typeof DEFAULT_THEME }) {
  const quoteSpring = useSpring(10);
  const quoteY = interpolate(quoteSpring, [0, 1], [20, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.font, overflow: "hidden" }}>
      {/* Background panel */}
      <div style={{ position: "absolute", top: "12%", left: "8%", right: "8%", bottom: "12%", background: theme.bgCard, borderRadius: 24, border: `1px solid ${theme.text}10` }} />
      {/* Quote mark */}
      <div style={{ position: "absolute", top: "15%", left: "12%", fontSize: 180, fontWeight: 900, color: theme.accent, opacity: 0.15, lineHeight: 1 }}>
        {"\u201C"}
      </div>
      {/* Accent side bar */}
      <div style={{ position: "absolute", top: "25%", left: 60, width: 4, height: "30%", background: theme.accent, borderRadius: 2 }} />
      {/* Quote text */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 100px" }}>
        <div style={{ opacity: quoteSpring, transform: `translateY(${quoteY}px)`, fontSize: 52, fontWeight: 800, color: theme.text, lineHeight: 1.3, textAlign: "center" }}>
          {slide.quote || slide.title}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Closing Slide ───

function ClosingSlide({ slide, theme }: { slide: SlideContent; theme: typeof DEFAULT_THEME }) {
  const logoSpring = useSpring(8);
  const ctaSpring = useSpring(25);
  const logoScale = interpolate(logoSpring, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(145deg, ${theme.bg} 0%, #2d2d44 100%)`, fontFamily: theme.font, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Watermark */}
      <div style={{ position: "absolute", fontSize: 300, fontWeight: 900, color: theme.text, opacity: 0.03, lineHeight: 1 }}>
        {slide.brand || "BRAND"}
      </div>
      {/* Logo circle */}
      <div style={{ width: 120, height: 120, borderRadius: 60, background: `linear-gradient(135deg, ${theme.accent}, #60a5fa)`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${logoScale})`, marginBottom: 24 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: theme.text }}>{(slide.brand || "B")[0]}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: 6, opacity: logoSpring, marginBottom: 40 }}>
        {slide.brand || "BRAND"}
      </div>
      {slide.cta && (
        <div style={{ opacity: ctaSpring, fontSize: 30, fontWeight: 700, color: theme.text, marginBottom: 20 }}>
          {slide.cta}
        </div>
      )}
      {slide.url && (
        <div style={{ opacity: ctaSpring, background: theme.accent, borderRadius: 100, padding: "12px 32px", fontSize: 20, fontWeight: 600, color: theme.text }}>
          {slide.url}
        </div>
      )}
    </AbsoluteFill>
  );
}

// ─── Shared Components ───

function TopBar({ theme }: { theme: typeof DEFAULT_THEME }) {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [0, 15], [0, 30], { extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: `${w}%`, height: 4, background: theme.accent, borderRadius: 2 }} />
    </div>
  );
}

function HighlightBar({ text, theme }: { text: string; theme: typeof DEFAULT_THEME }) {
  const s = useSpring(50);
  return (
    <div style={{ marginTop: 16, background: theme.accent, borderRadius: 12, padding: "16px 24px", opacity: s }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: theme.text }}>{text}</div>
    </div>
  );
}

// ─── Main Template ───

const SLIDE_MAP: Record<string, React.FC<{ slide: SlideContent; theme: typeof DEFAULT_THEME }>> = {
  cover: CoverSlide,
  list: ListSlide,
  split: SplitSlide,
  flow: FlowSlide,
  focus: FocusSlide,
  closing: ClosingSlide,
};

export const CardNewsTemplate: React.FC<CardNewsProps> = ({ slides, theme }) => {
  const t = { ...DEFAULT_THEME, ...theme };

  return (
    <AbsoluteFill>
      <Series>
        {slides.map((slide, i) => {
          const SlideComponent = SLIDE_MAP[slide.type] || ListSlide;
          return (
            <Series.Sequence key={i} durationInFrames={90}>
              <SlideComponent slide={slide} theme={t} />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
