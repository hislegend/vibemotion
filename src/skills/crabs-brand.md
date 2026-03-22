# Crabs Brand Guidelines

## Impact: ★★★★★

## Tags: brand, crabs, identity, colors, typography, motion

## Brand Colors

- **Primary:** #6366f1 (Indigo) - main brand color for key elements, CTAs, headers
- **Secondary:** #8b5cf6 (Violet) - supporting color for gradients, accents, hover states
- **Accent:** #f59e0b (Amber) - highlight color for emphasis, badges, important callouts
- **Background Light:** #f8fafc - clean light backgrounds
- **Background Dark:** #0f172a - dark mode backgrounds
- **Text Primary:** #1e293b - main text on light backgrounds
- **Text Light:** #f1f5f9 - text on dark backgrounds

## Typography

- **Headings:** fontFamily: 'Inter, sans-serif' — bold, clean, modern
- **Body:** fontFamily: 'system-ui, -apple-system, sans-serif' — readable, native feel
- **Monospace:** fontFamily: 'JetBrains Mono, monospace' — code blocks, technical content

## Style Principles

- Clean, modern, tech-forward aesthetic
- Generous whitespace, no visual clutter
- Subtle gradients over flat colors (indigo → violet)
- Rounded corners (borderRadius: 12-16px)
- Soft shadows over hard borders

## Default Aspect Ratio

- **9:16 (vertical)** — optimized for short-form content (Reels, Shorts, TikTok)
- Use `useVideoConfig()` to get width/height and adapt layout

## Motion Style

- **Smooth spring animations** — use `spring({ fps, frame, config: { damping: 15, stiffness: 120 } })`
- **No harsh cuts** — always transition with fade, slide, or scale
- **Staggered entrances** — elements enter sequentially with 5-8 frame delays
- **Gentle easing** — avoid linear interpolation for position/scale changes
- **Organic feel** — slight overshoot on springs for liveliness

## Correct Usage

```tsx
// Crabs brand colors
const COLOR_PRIMARY = "#6366f1";
const COLOR_SECONDARY = "#8b5cf6";
const COLOR_ACCENT = "#f59e0b";

// Brand gradient background
const gradientStyle = {
  background: `linear-gradient(135deg, ${COLOR_PRIMARY}, ${COLOR_SECONDARY})`,
};

// Spring animation with Crabs motion style
const entrance = spring({
  fps,
  frame,
  config: { damping: 15, stiffness: 120 },
});
```

## Incorrect Usage

```tsx
// ❌ Don't use harsh linear animations
const opacity = interpolate(frame, [0, 5], [0, 1]); // Too fast, no easing

// ❌ Don't use off-brand colors
const COLOR_PRIMARY = "#ff0000"; // Not a Crabs color

// ❌ Don't skip transitions between scenes
// Always use fade or spring-based transitions
```
