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
  "example-logo-intro",
  "example-product-teaser",
  "example-bar-chart",
  "example-countup-number",
  "example-progress-bar",
  "example-app-promo",
  "example-testimonial-card",
  "example-cardnews-carousel",
  "example-text-effects",
  "example-animated-shapes",
  "example-lottie",
  "example-falling-spheres",
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
  "example-logo-intro": "logo-intro",
  "example-product-teaser": "product-teaser",
  "example-bar-chart": "bar-chart",
  "example-countup-number": "countup-number",
  "example-progress-bar": "progress-bar",
  "example-app-promo": "app-promo",
  "example-testimonial-card": "testimonial-card",
  "example-cardnews-carousel": "cardnews-carousel",
  "example-text-effects": "text-effects",
  "example-animated-shapes": "animated-shapes",
  "example-lottie": "lottie-animation",
  "example-falling-spheres": "falling-spheres",
};

export function getSkillContent(skillName: SkillName): string {
  // Handle example skills - return the code directly
  if (skillName.startsWith("example-")) {
    const exampleId =
      exampleIdMap[skillName as (typeof EXAMPLE_SKILLS)[number]];
    const example = examples.find((e) => e.id === exampleId);
    if (example) {
      // Normalize escaped backticks from code-as-string storage
      // so AI sees clean template literals, not triple-escaped forms
      const cleanCode = example.code.replace(/\\\\/g, "\\");
      return `## Example: ${example.name}\n${example.description}\n\n\`\`\`tsx\n${cleanCode}\n\`\`\``;
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
- example-logo-intro: brand intro/outro with spring-scaled logo, letter-by-letter stagger, slogan fade, glow effects
- example-product-teaser: product/app teaser with 3D-tilted phone mockup, headline, CTA, bokeh background
- example-bar-chart: animated bar chart with spring animations, Y-axis labels, staggered entrance
- example-countup-number: count-up number showcase with glass cards, highlight underlines, key metrics display
- example-progress-bar: loading/progress bar animation from 0 to 100%
- example-app-promo: app promotional video with 3D phone mockup, app UI, pastel gradients, multi-scene
- example-testimonial-card: customer testimonial card with typing effect, star ratings, quote icon spring
- example-cardnews-carousel: complete Instagram card news carousel with cover, body slides (list/split), closing
- example-text-effects: typewriter + cursor blink + word highlight, kinetic typography
- example-animated-shapes: bouncing/rotating SVG shapes (circle, triangle, rect, star)
- example-lottie: loading and displaying Lottie animations from URL
- example-falling-spheres: 3D bouncing spheres with ThreeJS and physics simulation

Return an array of matching category names. Return an empty array if none apply.`;
