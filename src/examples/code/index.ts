import { animatedShapesExample } from "./animated-shapes";
import { fallingSpheresExample } from "./falling-spheres";
import { goldPriceChartExample } from "./gold-price-chart";
import { histogramExample } from "./histogram";
import { lottieAnimationExample } from "./lottie-animation";
import { progressBarExample } from "./progress-bar";
import { textRotationExample } from "./text-rotation";
import { typewriterHighlightExample } from "./typewriter-highlight";
import { wordCarouselExample } from "./word-carousel";
import { appPromoFinanceExample } from "./app-promo-finance";
import { appPromoSocialExample } from "./app-promo-social";
import { appPromoFitnessExample } from "./app-promo-fitness";
import { productLaunchExample } from "./product-launch";
import { testimonialCardExample } from "./testimonial-card";
import { dataShowcaseExample } from "./data-showcase";
import { brandIntroExample } from "./brand-intro";

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
  textRotationExample,
  histogramExample,
  progressBarExample,
  animatedShapesExample,
  lottieAnimationExample,
  fallingSpheresExample,
  goldPriceChartExample,
  typewriterHighlightExample,
  wordCarouselExample,
  appPromoFinanceExample,
  appPromoSocialExample,
  appPromoFitnessExample,
  productLaunchExample,
  testimonialCardExample,
  dataShowcaseExample,
  brandIntroExample,
];

export function getExampleById(id: string): RemotionExample | undefined {
  return examples.find((e) => e.id === id);
}

export function getExamplesByCategory(
  category: RemotionExample["category"],
): RemotionExample[] {
  return examples.filter((e) => e.category === category);
}
