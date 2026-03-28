import {
  AbsoluteFill,
  interpolate,
  Series,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Types ───

export interface SlideContent {
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

export interface CardNewsProps {
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

function CoverSlide({
  slide,
  theme,
}: {
  slide: SlideContent;
  theme: typeof DEFAULT_THEME;
}) {
  const titleSpring = useSpring(6);
  const subSpring = useSpring(18);
  const badgeSpring = useSpring(28);
  const titleY = interpolate(titleSpring, [0, 1], [50, 0], {
    extrapolateRight: "clamp",
  });
  const subY = interpolate(subSpring, [0, 1], [30, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(155deg, ${theme.bg} 0%, #16213e 50%, #0f3460 100%)`,
        fontFamily: theme.font,
        overflow: "hidden",
      }}
    >
      {/* Background watermark */}
      <div
        style={{
          position: "absolute",
          right: -40,
          top: "8%",
          fontSize: 300,
          fontWeight: 900,
          color: "#ffffff08",
          lineHeight: 1,
          letterSpacing: -10,
          userSelect: "none",
        }}
      >
        {slide.brand || "BRAND"}
      </div>

      {/* Micro grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1,
          backgroundImage: `linear-gradient(#00AEEF0A 1px, transparent 1px), linear-gradient(90deg, #00AEEF0A 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Diagonal accent strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 220,
          height: "100%",
          background: `linear-gradient(180deg, #00AEEF15 0%, #00AEEF05 100%)`,
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      {/* Decorative dots */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 60,
          display: "flex",
          gap: 8,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: i === 0 ? theme.accent : "#ffffff20",
            }}
          />
        ))}
      </div>

      {/* Content — left aligned */}
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 56,
          right: 56,
          bottom: 56,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Pill badge */}
        <div
          style={{
            opacity: badgeSpring,
            marginBottom: 28,
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "#00AEEF20",
              border: "1px solid #00AEEF50",
              borderRadius: 100,
              padding: "8px 22px",
              fontSize: 16,
              fontWeight: 700,
              color: theme.accent,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {slide.subtitle ? slide.subtitle.slice(0, 20) : "CARD NEWS"}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: titleSpring,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: theme.text,
              lineHeight: 1.08,
              marginBottom: 28,
              letterSpacing: -1,
            }}
          >
            {slide.title}
          </div>
        </div>

        {/* Accent divider */}
        <div
          style={{
            opacity: subSpring,
            transform: `translateY(${subY}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 48,
                height: 4,
                background: theme.accent,
                borderRadius: 2,
              }}
            />
            <div
              style={{
                width: 12,
                height: 4,
                background: "#00AEEF60",
                borderRadius: 2,
              }}
            />
          </div>

          {slide.subtitle && (
            <div
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: "#ffffffb3",
                lineHeight: 1.6,
                maxWidth: 600,
              }}
            >
              {slide.subtitle}
            </div>
          )}
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.accent}, #00AEEF00)`,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

// ─── List Slide ───

function ListSlide({
  slide,
  theme,
}: {
  slide: SlideContent;
  theme: typeof DEFAULT_THEME;
}) {
  const items = slide.items || [];

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        fontFamily: theme.font,
        overflow: "hidden",
      }}
    >
      {/* Subtle bg texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(#00AEEF08 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 44,
          left: 48,
          right: 48,
          bottom: 44,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Accent top bar */}
        <TopBar theme={theme} />

        {/* Title */}
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: theme.text,
              lineHeight: 1.15,
            }}
          >
            {slide.title}
          </div>
          {slide.subtitle && (
            <div
              style={{
                fontSize: 20,
                color: "#ffffff80",
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 18,
                  background: theme.accent,
                  borderRadius: 2,
                }}
              />
              {slide.subtitle}
            </div>
          )}
        </div>

        {/* Items card block */}
        <div
          style={{
            background: theme.bgCard,
            borderRadius: 18,
            border: "1px solid #ffffff12",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {items.map((item, i) => (
            <ListItem
              key={i}
              item={item}
              index={i}
              theme={theme}
              isLast={i === items.length - 1}
            />
          ))}
        </div>

        {/* Bottom accent highlight bar */}
        {slide.highlight && (
          <HighlightBar text={slide.highlight} theme={theme} />
        )}
      </div>
    </AbsoluteFill>
  );
}

function ListItem({
  item,
  index,
  theme,
  isLast,
}: {
  item: string;
  index: number;
  theme: typeof DEFAULT_THEME;
  isLast: boolean;
}) {
  const s = useSpring(12 + index * 4);
  const y = interpolate(s, [0, 1], [20, 0], { extrapolateRight: "clamp" });
  const color = ITEM_COLORS[index % ITEM_COLORS.length];
  const emojis = ["🔍", "🎯", "📦", "🔑", "💡"];

  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        minHeight: 104,
        flex: 1,
        borderBottom: isLast ? "none" : "1px solid #ffffff0A",
      }}
    >
      {/* Left color bar */}
      <div
        style={{
          width: 6,
          height: 56,
          borderRadius: 3,
          background: color,
          marginRight: 16,
          flexShrink: 0,
        }}
      />
      {/* Emoji */}
      <span style={{ fontSize: 26, marginRight: 14, flexShrink: 0 }}>
        {emojis[index % emojis.length]}
      </span>
      {/* Label */}
      <span
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: theme.text,
          flex: 1,
          lineHeight: 1.35,
        }}
      >
        {item}
      </span>
      {/* Right pill */}
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: `${color}`,
          background: `${color}18`,
          border: `1px solid ${color}40`,
          borderRadius: 8,
          padding: "5px 14px",
          flexShrink: 0,
          marginLeft: 12,
        }}
      >
        {`0${index + 1}`}
      </span>
    </div>
  );
}

// ─── Split Slide ───

function SplitSlide({
  slide,
  theme,
}: {
  slide: SlideContent;
  theme: typeof DEFAULT_THEME;
}) {
  const left = slide.left || [];
  const right = slide.right || [];
  const vsSpring = useSpring(20);
  const vsScale = interpolate(vsSpring, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        fontFamily: theme.font,
        overflow: "hidden",
      }}
    >
      {/* Bg pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(#00AEEF06 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 44,
          left: 48,
          right: 48,
          bottom: 44,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar theme={theme} />
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: theme.text,
            lineHeight: 1.15,
            marginTop: 16,
            marginBottom: 10,
          }}
        >
          {slide.title}
        </div>
        {slide.subtitle && (
          <div
            style={{
              fontSize: 19,
              color: "#ffffff80",
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            {slide.subtitle}
          </div>
        )}

        {/* Cards row */}
        <div
          style={{
            display: "flex",
            gap: 0,
            flex: 1,
            alignItems: "stretch",
            position: "relative",
          }}
        >
          {/* Left card — 46% */}
          <SplitCard
            items={left}
            label="BEFORE"
            color="#ef4444"
            icon="✕"
            theme={theme}
            delay={15}
          />

          {/* VS badge centered */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              flexShrink: 0,
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: `linear-gradient(135deg, ${theme.accent}, #60a5fa)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 900,
                color: theme.text,
                transform: `scale(${vsScale})`,
                boxShadow: "0 4px 20px #00AEEF40",
              }}
            >
              VS
            </div>
          </div>

          {/* Right card — 46% */}
          <SplitCard
            items={right}
            label="AFTER"
            color={theme.accent}
            icon="✓"
            theme={theme}
            delay={25}
          />
        </div>

        {/* Bottom highlight bar */}
        {slide.highlight && (
          <HighlightBar text={slide.highlight} theme={theme} />
        )}
      </div>
    </AbsoluteFill>
  );
}

function SplitCard({
  items,
  label,
  color,
  icon,
  theme,
  delay,
}: {
  items: string[];
  label: string;
  color: string;
  icon: string;
  theme: typeof DEFAULT_THEME;
  delay: number;
}) {
  const s = useSpring(delay);
  const y = interpolate(s, [0, 1], [30, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        flex: "0 0 46%",
        background: theme.bgCard,
        borderRadius: 18,
        border: `2px solid ${color}50`,
        padding: "24px 22px",
        opacity: s,
        transform: `translateY(${y}px)`,
        display: "flex",
        flexDirection: "column",
        minHeight: 400,
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color,
          letterSpacing: 3,
          marginBottom: 24,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      {/* Separator */}
      <div
        style={{
          width: "100%",
          height: 1,
          background: `${color}30`,
          marginBottom: 20,
        }}
      />
      {/* Items */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              fontSize: 21,
              fontWeight: 500,
              color: theme.text,
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                color,
                fontSize: 18,
                marginTop: 2,
                flexShrink: 0,
              }}
            >
              {icon}
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Flow Slide ───

function FlowSlide({
  slide,
  theme,
}: {
  slide: SlideContent;
  theme: typeof DEFAULT_THEME;
}) {
  const steps = slide.steps || [];

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        fontFamily: theme.font,
        overflow: "hidden",
      }}
    >
      {/* Bg pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(#00AEEF06 1px, transparent 1px)`,
          backgroundSize: "1px 40px",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 44,
          left: 48,
          right: 48,
          bottom: 44,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar theme={theme} />
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: theme.text,
            lineHeight: 1.15,
            marginTop: 16,
            marginBottom: 28,
          }}
        >
          {slide.title}
        </div>
        {slide.subtitle && (
          <div
            style={{
              fontSize: 19,
              color: "#ffffff70",
              marginBottom: 20,
              lineHeight: 1.5,
            }}
          >
            {slide.subtitle}
          </div>
        )}

        {/* Steps */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 0,
          }}
        >
          {steps.map((step, i) => (
            <FlowStep
              key={i}
              step={step}
              index={i}
              theme={theme}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>

        {slide.highlight && (
          <HighlightBar text={slide.highlight} theme={theme} />
        )}
      </div>
    </AbsoluteFill>
  );
}

function FlowStep({
  step,
  index,
  theme,
  isLast,
}: {
  step: string;
  index: number;
  theme: typeof DEFAULT_THEME;
  isLast: boolean;
}) {
  const s = useSpring(12 + index * 8);
  const y = interpolate(s, [0, 1], [25, 0], { extrapolateRight: "clamp" });
  const color = ITEM_COLORS[index % ITEM_COLORS.length];

  return (
    <div style={{ opacity: s, transform: `translateY(${y}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Number circle badge 48px */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            background: `linear-gradient(135deg, ${theme.accent}, ${color})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 900,
            color: theme.text,
            flexShrink: 0,
            boxShadow: `0 4px 16px ${theme.accent}30`,
          }}
        >
          {index + 1}
        </div>

        {/* Step card */}
        <div
          style={{
            background: theme.bgCard,
            borderRadius: 16,
            padding: "22px 28px",
            flex: 1,
            border: `1px solid ${color}30`,
            borderLeft: `4px solid ${color}`,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: theme.text,
              lineHeight: 1.4,
            }}
          >
            {step}
          </div>
        </div>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div
          style={{
            width: 2,
            height: 28,
            background: `${theme.accent}40`,
            marginLeft: 23,
            borderRadius: 1,
          }}
        />
      )}
    </div>
  );
}

// ─── Focus Slide ───

function FocusSlide({
  slide,
  theme,
}: {
  slide: SlideContent;
  theme: typeof DEFAULT_THEME;
}) {
  const quoteSpring = useSpring(8);
  const quoteY = interpolate(quoteSpring, [0, 1], [25, 0], {
    extrapolateRight: "clamp",
  });
  const panelSpring = useSpring(3);
  const panelScale = interpolate(panelSpring, [0, 1], [0.95, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${theme.bg} 0%, #0f3460 100%)`,
        fontFamily: theme.font,
        overflow: "hidden",
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          width: 600,
          height: 600,
          borderRadius: 300,
          background: `radial-gradient(circle, #00AEEF10 0%, transparent 70%)`,
          transform: "translateX(-50%)",
        }}
      />

      {/* Center big panel — 70% of screen */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "8%",
          right: "8%",
          bottom: "10%",
          background: theme.bgCard,
          borderRadius: 28,
          border: "1px solid #ffffff10",
          opacity: panelSpring,
          transform: `scale(${panelScale})`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px 60px",
        }}
      >
        {/* Big quote mark — 160px */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 40,
            fontSize: 160,
            fontWeight: 900,
            color: "#00AEEF18",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {"\u201C"}
        </div>

        {/* Closing quote mark */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            right: 40,
            fontSize: 160,
            fontWeight: 900,
            color: "#00AEEF10",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {"\u201D"}
        </div>

        {/* Quote text */}
        <div
          style={{
            opacity: quoteSpring,
            transform: `translateY(${quoteY}px)`,
            fontSize: 52,
            fontWeight: 800,
            color: theme.text,
            lineHeight: 1.35,
            textAlign: "center",
            maxWidth: 800,
            zIndex: 1,
          }}
        >
          {slide.quote || slide.title}
        </div>

        {/* Attribution */}
        {slide.subtitle && (
          <div
            style={{
              marginTop: 28,
              fontSize: 20,
              fontWeight: 500,
              color: "#ffffff80",
              opacity: quoteSpring,
            }}
          >
            — {slide.subtitle}
          </div>
        )}
      </div>

      {/* Accent side bar — left */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: 40,
          width: 5,
          height: "36%",
          background: `linear-gradient(180deg, ${theme.accent}, #00AEEF00)`,
          borderRadius: 3,
          opacity: quoteSpring,
        }}
      />

      {/* Accent side bar — right */}
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          right: 40,
          width: 5,
          height: "36%",
          background: `linear-gradient(0deg, ${theme.accent}, #00AEEF00)`,
          borderRadius: 3,
          opacity: quoteSpring,
        }}
      />
    </AbsoluteFill>
  );
}

// ─── Closing Slide ───

function ClosingSlide({
  slide,
  theme,
}: {
  slide: SlideContent;
  theme: typeof DEFAULT_THEME;
}) {
  const logoSpring = useSpring(6);
  const ctaSpring = useSpring(20);
  const urlSpring = useSpring(30);
  const logoScale = interpolate(logoSpring, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(155deg, ${theme.bg} 0%, #16213e 50%, #0f3460 100%)`,
        fontFamily: theme.font,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Watermark 300px */}
      <div
        style={{
          position: "absolute",
          fontSize: 300,
          fontWeight: 900,
          color: "#ffffff08",
          lineHeight: 1,
          letterSpacing: -8,
          userSelect: "none",
        }}
      >
        {slide.brand || "BRAND"}
      </div>

      {/* Micro grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(#00AEEF06 1px, transparent 1px), linear-gradient(90deg, #00AEEF06 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: 200,
          background: `radial-gradient(circle, #00AEEF15 0%, transparent 70%)`,
        }}
      />

      {/* Logo circle 120px */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          background: `linear-gradient(135deg, ${theme.accent}, #60a5fa)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${logoScale})`,
          marginBottom: 28,
          boxShadow: "0 8px 32px #00AEEF40",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: theme.text,
          }}
        >
          {(slide.brand || "B")[0]}
        </div>
      </div>

      {/* Brand name */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: theme.text,
          letterSpacing: 8,
          opacity: logoSpring,
          marginBottom: 36,
          zIndex: 1,
        }}
      >
        {slide.brand || "BRAND"}
      </div>

      {/* CTA 30px */}
      {slide.cta && (
        <div
          style={{
            opacity: ctaSpring,
            fontSize: 30,
            fontWeight: 700,
            color: theme.text,
            marginBottom: 24,
            zIndex: 1,
          }}
        >
          {slide.cta}
        </div>
      )}

      {/* URL pill */}
      {slide.url && (
        <div
          style={{
            opacity: urlSpring,
            background: theme.accent,
            borderRadius: 100,
            padding: "14px 36px",
            fontSize: 20,
            fontWeight: 600,
            color: theme.text,
            zIndex: 1,
            boxShadow: "0 4px 16px #00AEEF30",
          }}
        >
          {slide.url}
        </div>
      )}

      {/* Decorative bottom dots */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          display: "flex",
          gap: 8,
          zIndex: 1,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: i === 2 ? theme.accent : "#ffffff20",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ─── Shared Components ───

function TopBar({ theme }: { theme: typeof DEFAULT_THEME }) {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [0, 15], [0, 30], {
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: `${w}%`,
          height: 4,
          background: `linear-gradient(90deg, ${theme.accent}, #60a5fa)`,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          background: theme.accent,
          opacity: interpolate(frame, [10, 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </div>
  );
}

function HighlightBar({
  text,
  theme,
}: {
  text: string;
  theme: typeof DEFAULT_THEME;
}) {
  const s = useSpring(45);
  return (
    <div
      style={{
        marginTop: 14,
        background: `linear-gradient(90deg, ${theme.accent}, #0097d4)`,
        borderRadius: 14,
        padding: "16px 24px",
        opacity: s,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 4,
          height: 20,
          background: "#ffffffcc",
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: theme.text,
          lineHeight: 1.3,
        }}
      >
        {text}
      </div>
    </div>
  );
}

// ─── Main Template ───

const SLIDE_MAP: Record<
  string,
  React.FC<{ slide: SlideContent; theme: typeof DEFAULT_THEME }>
> = {
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
