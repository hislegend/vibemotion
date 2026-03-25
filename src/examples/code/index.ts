// ─── Branding ───
import { logoIntroExample } from "./logo-intro";
import { productTeaserExample } from "./product-teaser";

// ─── Data ───
import { barChartExample } from "./bar-chart";
import { countupNumberExample } from "./countup-number";
import { progressBarExample } from "./progress-bar";

// ─── SNS ───
import { appPromoExample } from "./app-promo";
import { testimonialCardExample } from "./testimonial-card";
import { cardnewsCarouselExample } from "./cardnews-carousel";

// ─── Motion ───
import { textEffectsExample } from "./text-effects";
import { animatedShapesExample } from "./animated-shapes";
import { lottieAnimationExample } from "./lottie-animation";
import { fallingSpheresExample } from "./falling-spheres";

export interface RemotionExample {
  id: string;
  name: string;
  description: string;
  code: string;
  durationInFrames: number;
  fps: number;
  category: "Text" | "Charts" | "Animation" | "3D" | "Other";
}

export const examples: RemotionExample[] = [
  // 🎬 Branding
  logoIntroExample,
  productTeaserExample,
  // 📊 Data
  barChartExample,
  countupNumberExample,
  progressBarExample,
  // 📱 SNS
  appPromoExample,
  testimonialCardExample,
  cardnewsCarouselExample,
  // ✨ Motion
  textEffectsExample,
  animatedShapesExample,
  lottieAnimationExample,
  fallingSpheresExample,
];

export function getExampleById(id: string): RemotionExample | undefined {
  return examples.find((e) => e.id === id);
}

export function getExamplesByCategory(
  category: RemotionExample["category"],
): RemotionExample[] {
  return examples.filter((e) => e.category === category);
}
