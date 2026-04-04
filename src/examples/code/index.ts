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

// ─── Card News (v2) ───
import { cardnewsDarkPremiumExample } from "./cardnews-dark-premium";
import { cardnewsCleanWhiteExample } from "./cardnews-clean-white";
import { cardnewsNeonExample } from "./cardnews-neon";
import { cardnewsCyanDarkExample } from "./cardnews-cyan-dark";
import { cardnewsRedAlertExample } from "./cardnews-red-alert";

// ─── Motion Graphics (v2) ───
import { motionBrandIntroExample } from "./motion-brand-intro";
import { motionDataDashboardExample } from "./motion-data-dashboard";
import { motionCodeTypingExample } from "./motion-code-typing";
import { motionFlowDiagramExample } from "./motion-flow-diagram";
import { motionTitleSequenceExample } from "./motion-title-sequence";

// ─── Product (v2) ───
import { productSaasExample } from "./product-saas";

// ─── Cinematic (v2) ───
import { cinematicCountdownExample } from "./cinematic-countdown";

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
  // 📱 Card News v2
  cardnewsDarkPremiumExample,
  cardnewsCleanWhiteExample,
  cardnewsNeonExample,
  cardnewsCyanDarkExample,
  cardnewsRedAlertExample,
  // 🎬 Motion Graphics v2
  motionBrandIntroExample,
  motionDataDashboardExample,
  motionCodeTypingExample,
  motionFlowDiagramExample,
  motionTitleSequenceExample,
  // 🏢 Product
  productSaasExample,
  // 🎥 Cinematic
  cinematicCountdownExample,
];

export function getExampleById(id: string): RemotionExample | undefined {
  return examples.find((e) => e.id === id);
}

export function getExamplesByCategory(
  category: RemotionExample["category"],
): RemotionExample[] {
  return examples.filter((e) => e.category === category);
}
