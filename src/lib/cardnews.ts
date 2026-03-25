/**
 * Card News Carousel — Utility functions
 *
 * Visual mode auto-detection + theme presets for Instagram card news generation.
 * Based on ichijou's vibemotion-cardnews-spec v1.
 */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type VisualMode =
  | "list"
  | "step"
  | "split"
  | "grid"
  | "timeline"
  | "focus"
  | "action";

export type SlideRole = "cover" | "body" | "closing";

export type CardNewsAspectRatio = "4:5" | "1:1" | "9:16";

export type SpringPreset = "snappy" | "smooth" | "bouncy" | "gentle";

export interface SlideContent {
  role: SlideRole;
  title: string;
  subtitle?: string;
  body?: string;
  items?: string[];
  highlight?: string;
  tag?: string;
  imageKeyword?: string;
  visualMode?: VisualMode; // manual override
  cta?: string;
}

export interface CardNewsTheme {
  name: string;
  background: {
    cover: string;
    body: string;
    closing: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  accent: string;
  accentLight: string;
  font: {
    heading: string;
    body: string;
  };
  borderRadius: number;
}

export interface CardNewsInput {
  topic: string;
  slides: SlideContent[];
  theme?: string | CardNewsTheme;
  aspectRatio?: CardNewsAspectRatio;
  brand?: {
    name: string;
    logoUrl?: string;
    accentColor?: string;
  };
  animation?: SpringPreset;
}

// ═══════════════════════════════════════════
// VISUAL MODE DETECTION
// ═══════════════════════════════════════════

function hasComparisonPattern(text: string): boolean {
  return /vs\.?|비교|CASE\s*[12AB]|전.*후|before.*after|장점.*단점|좋은.*나쁜|AS-IS.*TO-BE/i.test(
    text
  );
}

function hasTimelinePattern(text: string): boolean {
  return /\d{4}[.\-/]\d{1,2}|\d{4}년|\d{1,2}월|\d{2}\.\d{2}/i.test(text);
}

function hasStepPattern(text: string): boolean {
  return /step\s*\d|단계|과정|절차|\d\)\s|①|②|③|④|⑤|PHASE/i.test(text);
}

function hasActionPattern(text: string): boolean {
  return /하세요|하라|해보세요|tip|방법|실천|체크|checklist|to.?do|action/i.test(
    text
  );
}

/**
 * Detect the optimal visual mode for a body slide based on content analysis.
 * Priority order: split > timeline > step > grid > action > focus > list (default)
 */
export function detectVisualMode(slide: SlideContent): VisualMode {
  // If manually specified, respect it
  if (slide.visualMode) return slide.visualMode;

  const { items, body, highlight } = slide;
  const text = [body, highlight, ...(items || [])].filter(Boolean).join(" ");

  // Priority-ordered detection
  if (hasComparisonPattern(text)) return "split";
  if (hasTimelinePattern(text)) return "timeline";
  if (hasStepPattern(text)) return "step";
  if (items && items.length === 4 && items.every((i) => i.length <= 30))
    return "grid";
  if (hasActionPattern(text)) return "action";
  if (!items || items.length <= 1) return "focus";
  return "list";
}

/**
 * Auto-assign roles to slides based on position.
 * First = cover, last = closing, middle = body.
 */
export function assignSlideRoles(slides: SlideContent[]): SlideContent[] {
  return slides.map((slide, i) => ({
    ...slide,
    role:
      slide.role ||
      (i === 0 ? "cover" : i === slides.length - 1 ? "closing" : "body"),
  }));
}

/**
 * Process slides: assign roles + detect visual modes for body slides.
 */
export function processSlides(slides: SlideContent[]): SlideContent[] {
  const withRoles = assignSlideRoles(slides);
  return withRoles.map((slide) => ({
    ...slide,
    visualMode:
      slide.role === "body" ? detectVisualMode(slide) : undefined,
  }));
}

// ═══════════════════════════════════════════
// THEME PRESETS
// ═══════════════════════════════════════════

const FONT_DEFAULT = "Pretendard Variable, Inter, system-ui, sans-serif";

export const CARDNEWS_THEMES: Record<string, CardNewsTheme> = {
  professional: {
    name: "Professional",
    background: {
      cover: "linear-gradient(170deg, #1e293b 0%, #0f172a 100%)",
      body: "#fafafa",
      closing: "linear-gradient(170deg, #1e293b 0%, #0f172a 100%)",
    },
    text: {
      primary: "#171717",
      secondary: "#525252",
      accent: "#3b82f6",
    },
    accent: "#3b82f6",
    accentLight: "#dbeafe",
    font: { heading: FONT_DEFAULT, body: FONT_DEFAULT },
    borderRadius: 16,
  },

  dark: {
    name: "Dark",
    background: {
      cover: "linear-gradient(170deg, #0f172a 0%, #020617 100%)",
      body: "#0f172a",
      closing: "linear-gradient(170deg, #0f172a 0%, #020617 100%)",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
      accent: "#2563eb",
    },
    accent: "#2563eb",
    accentLight: "#1e3a5f",
    font: { heading: FONT_DEFAULT, body: FONT_DEFAULT },
    borderRadius: 16,
  },

  warm: {
    name: "Warm",
    background: {
      cover: "linear-gradient(170deg, #78350f 0%, #451a03 100%)",
      body: "#FFF8F0",
      closing: "linear-gradient(170deg, #78350f 0%, #451a03 100%)",
    },
    text: {
      primary: "#1c1917",
      secondary: "#57534e",
      accent: "#d97706",
    },
    accent: "#fbbf24",
    accentLight: "#fef3c7",
    font: { heading: FONT_DEFAULT, body: FONT_DEFAULT },
    borderRadius: 16,
  },

  vibrant: {
    name: "Vibrant",
    background: {
      cover: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
      body: "linear-gradient(170deg, #faf5ff 0%, #fdf2f8 100%)",
      closing: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
    },
    text: {
      primary: "#171717",
      secondary: "#525252",
      accent: "#8b5cf6",
    },
    accent: "#8b5cf6",
    accentLight: "#ede9fe",
    font: { heading: FONT_DEFAULT, body: FONT_DEFAULT },
    borderRadius: 20,
  },

  minimal: {
    name: "Minimal",
    background: {
      cover: "#ffffff",
      body: "#ffffff",
      closing: "#ffffff",
    },
    text: {
      primary: "#171717",
      secondary: "#737373",
      accent: "#a3a3a3",
    },
    accent: "#a3a3a3",
    accentLight: "#f5f5f5",
    font: { heading: FONT_DEFAULT, body: FONT_DEFAULT },
    borderRadius: 12,
  },
};

/**
 * Get a theme by name. Returns professional as default.
 */
export function getCardNewsTheme(
  theme?: string | CardNewsTheme
): CardNewsTheme {
  if (!theme) return CARDNEWS_THEMES.professional;
  if (typeof theme === "string")
    return CARDNEWS_THEMES[theme] || CARDNEWS_THEMES.professional;
  return theme;
}

// ═══════════════════════════════════════════
// SPRING CONFIGS
// ═══════════════════════════════════════════

export const SPRING_PRESETS: Record<
  SpringPreset,
  { damping: number; stiffness: number }
> = {
  snappy: { damping: 15, stiffness: 200 },
  smooth: { damping: 20, stiffness: 120 },
  bouncy: { damping: 10, stiffness: 180 },
  gentle: { damping: 25, stiffness: 80 },
};

// ═══════════════════════════════════════════
// RESOLUTION
// ═══════════════════════════════════════════

export const CARDNEWS_RESOLUTIONS: Record<
  CardNewsAspectRatio,
  { width: number; height: number }
> = {
  "4:5": { width: 1080, height: 1350 },
  "1:1": { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
};

// ═══════════════════════════════════════════
// SAFE ZONES (px)
// ═══════════════════════════════════════════

export const SAFE_ZONES = {
  top: 60,
  bottom: 80,
  sides: 48,
} as const;

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

export const CARDNEWS_FPS = 30;
export const CARDNEWS_DURATION_FRAMES = 90; // 3 seconds
export const CARDNEWS_MAX_SLIDES = 20;
