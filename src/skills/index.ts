import { examples } from "@/examples/code";

// Import markdown files at build time
import threeDSkill from "./3d.md";
import chartsSkill from "./charts.md";
import messagingSkill from "./messaging.md";
import sequencingSkill from "./sequencing.md";
import socialMediaSkill from "./social-media.md";
import springPhysicsSkill from "./spring-physics.md";
import transitionsSkill from "./transitions.md";
import typographySkill from "./typography.md";
import crabsBrandSkill from "./crabs-brand.md";
import appPromoSkill from "./app-promo.md";
import cardnewsCarouselSkill from "./cardnews-carousel.md";

// Guidance skills (markdown files with patterns/rules)
const GUIDANCE_SKILLS = [
  "charts",
  "typography",
  "social-media",
  "messaging",
  "3d",
  "transitions",
  "sequencing",
  "spring-physics",
  "crabs-brand",
  "app-promo",
  "cardnews-carousel",
] as const;

// Example skills (complete working code references)
const EXAMPLE_SKILLS = [
  "example-histogram",
  "example-progress-bar",
  "example-text-rotation",
  "example-falling-spheres",
  "example-animated-shapes",
  "example-lottie",
  "example-gold-price-chart",
  "example-typewriter-highlight",
  "example-word-carousel",
  "example-app-promo-finance",
  "example-app-promo-social",
  "example-app-promo-fitness",
  "example-product-launch",
  "example-testimonial-card",
  "example-data-showcase",
  "example-brand-intro",
  "example-logo-stinger",
  "example-number-impact",
  "example-product-teaser",
  "example-cardnews-cover",
  "example-cardnews-body-list",
  "example-cardnews-body-split",
  "example-cardnews-closing",
] as const;

export const SKILL_NAMES = [...GUIDANCE_SKILLS, ...EXAMPLE_SKILLS] as const;

export type SkillName = (typeof SKILL_NAMES)[number];

// Map guidance skill names to imported content
const guidanceSkillContent: Record<(typeof GUIDANCE_SKILLS)[number], string> = {
  charts: chartsSkill,
  typography: typographySkill,
  "social-media": socialMediaSkill,
  messaging: messagingSkill,
  "3d": threeDSkill,
  transitions: transitionsSkill,
  sequencing: sequencingSkill,
  "spring-physics": springPhysicsSkill,
  "crabs-brand": crabsBrandSkill,
  "app-promo": appPromoSkill,
  "cardnews-carousel": cardnewsCarouselSkill,
};

// Map example skill names to example IDs
const exampleIdMap: Record<(typeof EXAMPLE_SKILLS)[number], string> = {
  "example-histogram": "histogram",
  "example-progress-bar": "progress-bar",
  "example-text-rotation": "text-rotation",
  "example-falling-spheres": "falling-spheres",
  "example-animated-shapes": "animated-shapes",
  "example-lottie": "lottie-animation",
  "example-gold-price-chart": "gold-price-chart",
  "example-typewriter-highlight": "typewriter-highlight",
  "example-word-carousel": "word-carousel",
  "example-app-promo-finance": "app-promo-finance",
  "example-app-promo-social": "app-promo-social",
  "example-app-promo-fitness": "app-promo-fitness",
  "example-product-launch": "product-launch",
  "example-testimonial-card": "testimonial-card",
  "example-data-showcase": "data-showcase",
  "example-brand-intro": "brand-intro",
  "example-logo-stinger": "logo-stinger",
  "example-number-impact": "number-impact",
  "example-product-teaser": "product-teaser",
  "example-cardnews-cover": "cardnews-cover",
  "example-cardnews-body-list": "cardnews-body-list",
  "example-cardnews-body-split": "cardnews-body-split",
  "example-cardnews-closing": "cardnews-closing",
};

export function getSkillContent(skillName: SkillName): string {
  // Handle example skills - return the code directly
  if (skillName.startsWith("example-")) {
    const exampleId =
      exampleIdMap[skillName as (typeof EXAMPLE_SKILLS)[number]];
    const example = examples.find((e) => e.id === exampleId);
    if (example) {
      return `## Example: ${example.name}\n${example.description}\n\n\`\`\`tsx\n${example.code}\n\`\`\``;
    }
    return "";
  }

  // Handle guidance skills - return imported markdown content
  return (
    guidanceSkillContent[skillName as (typeof GUIDANCE_SKILLS)[number]] || ""
  );
}

export function getCombinedSkillContent(skills: SkillName[]): string {
  if (skills.length === 0) {
    return "";
  }

  const contents = skills
    .map((skill) => getSkillContent(skill))
    .filter((content) => content.length > 0);

  return contents.join("\n\n---\n\n");
}

export const SKILL_DETECTION_PROMPT = `Classify this motion graphics prompt into ALL applicable categories.
A prompt can match multiple categories. Only include categories that are clearly relevant.

Guidance categories (patterns and rules):
- charts: data visualizations, graphs, histograms, bar charts, pie charts, progress bars, statistics, metrics
- typography: kinetic text, typewriter effects, text animations, word carousels, animated titles, text-heavy content
- social-media: Instagram stories, TikTok content, YouTube shorts, social media posts, reels, vertical video
- messaging: chat interfaces, WhatsApp conversations, iMessage, chat bubbles, text messages, DMs, messenger
- 3d: 3D objects, ThreeJS, spatial animations, rotating cubes, 3D scenes
- transitions: scene changes, fades between clips, slide transitions, wipes, multiple scenes
- sequencing: multiple elements appearing at different times, staggered animations, choreographed entrances
- spring-physics: bouncy animations, organic motion, elastic effects, overshoot animations
- crabs-brand: Crabs brand colors (indigo/violet/amber), Inter font, clean modern style, vertical 9:16
- app-promo: app promotional videos, device mockups, phone screens, pastel gradients, Walletvy style
- cardnews-carousel: Instagram carousel cards, card news, multi-slide information posts, educational slides, 카드뉴스, 카루셀, slide deck for social media, infographic carousel, 인스타 카드

Code examples (complete working references):
- example-histogram: animated bar chart with spring animations and @remotion/shapes
- example-progress-bar: loading bar animation from 0 to 100%
- example-text-rotation: rotating words with fade/blur transitions
- example-falling-spheres: 3D bouncing spheres with ThreeJS and physics simulation
- example-animated-shapes: bouncing/rotating SVG shapes (circle, triangle, rect, star)
- example-lottie: loading and displaying Lottie animations from URL
- example-gold-price-chart: bar chart with Y-axis labels, monthly data, staggered animations
- example-typewriter-highlight: typewriter effect with cursor blink, pause, and word highlight
- example-word-carousel: rotating words with crossfade and blur transitions
- example-app-promo-finance: app promotional video with 3D tilted phone mockup, detailed finance app UI, pastel gradients, bokeh, spring animations, 3 scenes
- example-app-promo-social: SNS app promo with Instagram/TikTok-style feed, story rings, lavender gradient, 3D phone mockup, staggered springs
- example-app-promo-fitness: fitness app promo with mint/emerald gradient, circular calorie chart, step counter, weekly bar graph, workout dashboard
- example-product-launch: product launch countdown (3-2-1) with dark navy gradient, glow typing reveal, sparkle particles, cinematic spring animations
- example-testimonial-card: customer testimonial card on warm beige, typing review text, staggered star ratings, quote icon spring, minimal premium aesthetic
- example-data-showcase: impact number showcase on indigo-violet gradient, count-up numbers (Users/Revenue/Growth), highlight underlines, glass cards
- example-brand-intro: brand intro/outro on dark background, spring-scaled logo, letter-by-letter stagger name, slogan fade, glow/shadow premium effects
- example-logo-stinger: logo stinger / brand bumper, logo entrance with spring scale and rotation, glow pulse, tagline fade-in, dark gradient background
- example-number-impact: single impact number with eased count-up, landing pulse, underline reveal, label stagger, dark background
- example-product-teaser: product/app teaser with 3D-tilted phone device mockup, headline, CTA, bokeh background, spring entrances
- example-cardnews-cover: card news cover slide with dark gradient, tag pill badge, headline with accent keyword highlight, brand mark
- example-cardnews-body-list: card news body slide list mode with numbered badges, staggered slide-up items, highlight box, page indicators
- example-cardnews-body-split: card news body slide split/comparison mode with before/after columns, divider line draw, contrast styling
- example-cardnews-closing: card news closing slide with centered brand logo spring, CTA text, contact info, dark gradient

Return an array of matching category names. Return an empty array if none apply.`;
