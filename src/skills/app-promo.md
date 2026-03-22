# App Promo Video Style

## Impact: ★★★★★

## Tags: app-promo, device-mockup, promotional, product-showcase, mobile

## Purpose

Generate app promotional videos featuring device mockups with app screenshots.
Inspired by Walletvy-style app promos (gwon_vibe on Threads).

## Visual Style

- **Backgrounds:** Soft pastel gradients
  - Pink/Coral: `linear-gradient(135deg, #fecaca, #fda4af, #fb7185)`
  - Blue/Purple: `linear-gradient(135deg, #c7d2fe, #a5b4fc, #818cf8)`
  - Mint/Teal: `linear-gradient(135deg, #a7f3d0, #6ee7b7, #34d399)`
  - Peach/Orange: `linear-gradient(135deg, #fed7aa, #fdba74, #fb923c)`
- **Device Frame:** Dark (#1e293b) or white (#ffffff) phone bezel with rounded corners
- **Screen Content:** App screenshots or UI mockups inserted inside device
- **Decorative Elements:** Subtle floating shapes, soft bokeh circles, light particles

## Device Mockup Pattern

```tsx
// 3D tilted phone mockup
const PHONE_WIDTH = Math.round(width * 0.35);
const PHONE_HEIGHT = Math.round(PHONE_WIDTH * 2.05);
const BEZEL_RADIUS = Math.round(PHONE_WIDTH * 0.12);
const SCREEN_PADDING = Math.round(PHONE_WIDTH * 0.04);

// 3D perspective tilt
const phoneStyle = {
  width: PHONE_WIDTH,
  height: PHONE_HEIGHT,
  borderRadius: BEZEL_RADIUS,
  backgroundColor: "#1e293b",
  padding: SCREEN_PADDING,
  transform: `perspective(1200px) rotateY(-8deg) rotateX(5deg)`,
  boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
};

// Inner screen
const screenStyle = {
  width: "100%",
  height: "100%",
  borderRadius: BEZEL_RADIUS - SCREEN_PADDING,
  backgroundColor: "#ffffff",
  overflow: "hidden",
};
```

## Typography

- **Minimal sans-serif** — fontFamily: 'Inter, sans-serif'
- **Information-light** — max 2-3 short text elements per scene
- **Large, bold headlines** — fontSize: width * 0.06 for impact
- **Subtle captions** — fontSize: width * 0.025, lighter weight

## Transitions

- **Smooth fade** between scenes using `interpolate(frame, [start, start+15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })`
- **Slide** — device slides in from bottom or side with spring animation
- **Scale entrance** — device scales from 0.8 to 1.0 with spring
- **No harsh cuts** — always animate between states

## Tone

- Clean + Warm + Premium
- Evokes trust, simplicity, and delight
- Minimal text, let the visuals speak

## Scene Structure

A typical app promo has 3-4 scenes:
1. **Hero Scene** (0-60 frames): Device enters with gradient background + tagline
2. **Feature Showcase** (60-120 frames): Highlight 1-2 key app screens
3. **Social Proof** (120-160 frames): Stats, ratings, or testimonials
4. **CTA Scene** (160-200 frames): Download prompt + app icon + store badges

## Correct Usage

```tsx
// Soft pastel gradient background
const BG_GRADIENT = "linear-gradient(135deg, #c7d2fe, #a5b4fc, #818cf8)";

// Device entrance with spring
const deviceEntrance = spring({
  fps,
  frame: frame - 10,
  config: { damping: 14, stiffness: 100 },
});

const deviceTranslateY = interpolate(deviceEntrance, [0, 1], [200, 0]);
const deviceScale = interpolate(deviceEntrance, [0, 1], [0.85, 1]);

// Staggered text entrance
const titleEntrance = spring({
  fps,
  frame: frame - 20,
  config: { damping: 15, stiffness: 120 },
});
```

## Incorrect Usage

```tsx
// ❌ Don't use harsh, saturated backgrounds
const BG = "#ff0000"; // Too aggressive for app promo

// ❌ Don't overcrowd with text
// Keep it minimal — 1 headline + 1 subtitle max per scene

// ❌ Don't skip device mockup perspective
// Always add subtle 3D tilt for premium feel

// ❌ Don't use instant transitions
opacity: frame > 30 ? 1 : 0; // Use interpolate or spring instead
```
