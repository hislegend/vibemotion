import { examples } from "@/examples/code";

// ─── Remotion Official Skills (38) ───
import threeDSkill from "./3d.md";
import animationsSkill from "./animations.md";
import assetsSkill from "./assets.md";
import audioVisualizationSkill from "./audio-visualization.md";
import audioSkill from "./audio.md";
import calculateMetadataSkill from "./calculate-metadata.md";
import canDecodeSkill from "./can-decode.md";
import chartsSkill from "./charts.md";
import compositionsSkill from "./compositions.md";
import displayCaptionsSkill from "./display-captions.md";
import extractFramesSkill from "./extract-frames.md";
import ffmpegSkill from "./ffmpeg.md";
import fontsSkill from "./fonts.md";
import getAudioDurationSkill from "./get-audio-duration.md";
import getVideoDimensionsSkill from "./get-video-dimensions.md";
import getVideoDurationSkill from "./get-video-duration.md";
import gifsSkill from "./gifs.md";
import imagesSkill from "./images.md";
import importSrtCaptionsSkill from "./import-srt-captions.md";
import lightLeaksSkill from "./light-leaks.md";
import lottieSkill from "./lottie.md";
import mapsSkill from "./maps.md";
import measuringDomNodesSkill from "./measuring-dom-nodes.md";
import measuringTextSkill from "./measuring-text.md";
import parametersSkill from "./parameters.md";
import sequencingSkill from "./sequencing.md";
import sfxSkill from "./sfx.md";
import subtitlesSkill from "./subtitles.md";
import tailwindSkill from "./tailwind.md";
import textAnimationsSkill from "./text-animations.md";
import timingSkill from "./timing.md";
import transcribeCaptionsSkill from "./transcribe-captions.md";
import transitionsSkill from "./transitions.md";
import transparentVideosSkill from "./transparent-videos.md";
import trimmingSkill from "./trimming.md";
import videosSkill from "./videos.md";
import voiceoverSkill from "./voiceover.md";

// ─── Anthropic Official Skills ───
import frontendDesignSkill from "./frontend-design.md";

// ─── Custom Skills (7) ───
import appPromoSkill from "./app-promo.md";
import cardnewsCarouselSkill from "./cardnews-carousel.md";
import crabsBrandSkill from "./crabs-brand.md";
import messagingSkill from "./messaging.md";
import socialMediaSkill from "./social-media.md";
import springPhysicsSkill from "./spring-physics.md";
import typographySkill from "./typography.md";

// ─── All Guidance Skills ───
const GUIDANCE_SKILLS = [
  // Remotion Official (38)
  "3d",
  "animations",
  "assets",
  "audio-visualization",
  "audio",
  "calculate-metadata",
  "can-decode",
  "charts",
  "compositions",
  "display-captions",
  "extract-frames",
  "ffmpeg",
  "fonts",
  "get-audio-duration",
  "get-video-dimensions",
  "get-video-duration",
  "gifs",
  "images",
  "import-srt-captions",
  "light-leaks",
  "lottie",
  "maps",
  "measuring-dom-nodes",
  "measuring-text",
  "parameters",
  "sequencing",
  "sfx",
  "subtitles",
  "tailwind",
  "text-animations",
  "timing",
  "transcribe-captions",
  "transitions",
  "transparent-videos",
  "trimming",
  "videos",
  "voiceover",
  // Anthropic
  "frontend-design",
  // Custom (7)
  "app-promo",
  "cardnews-carousel",
  "crabs-brand",
  "messaging",
  "social-media",
  "spring-physics",
  "typography",
] as const;

// ─── Example Skills ───
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

// ─── Guidance skill content map ───
const guidanceSkillContent: Record<(typeof GUIDANCE_SKILLS)[number], string> = {
  // Remotion Official
  "3d": threeDSkill,
  animations: animationsSkill,
  assets: assetsSkill,
  "audio-visualization": audioVisualizationSkill,
  audio: audioSkill,
  "calculate-metadata": calculateMetadataSkill,
  "can-decode": canDecodeSkill,
  charts: chartsSkill,
  compositions: compositionsSkill,
  "display-captions": displayCaptionsSkill,
  "extract-frames": extractFramesSkill,
  ffmpeg: ffmpegSkill,
  fonts: fontsSkill,
  "get-audio-duration": getAudioDurationSkill,
  "get-video-dimensions": getVideoDimensionsSkill,
  "get-video-duration": getVideoDurationSkill,
  gifs: gifsSkill,
  images: imagesSkill,
  "import-srt-captions": importSrtCaptionsSkill,
  "light-leaks": lightLeaksSkill,
  lottie: lottieSkill,
  maps: mapsSkill,
  "measuring-dom-nodes": measuringDomNodesSkill,
  "measuring-text": measuringTextSkill,
  parameters: parametersSkill,
  sequencing: sequencingSkill,
  sfx: sfxSkill,
  subtitles: subtitlesSkill,
  tailwind: tailwindSkill,
  "text-animations": textAnimationsSkill,
  timing: timingSkill,
  "transcribe-captions": transcribeCaptionsSkill,
  transitions: transitionsSkill,
  "transparent-videos": transparentVideosSkill,
  trimming: trimmingSkill,
  videos: videosSkill,
  voiceover: voiceoverSkill,
  // Anthropic
  "frontend-design": frontendDesignSkill,
  // Custom
  "app-promo": appPromoSkill,
  "cardnews-carousel": cardnewsCarouselSkill,
  "crabs-brand": crabsBrandSkill,
  messaging: messagingSkill,
  "social-media": socialMediaSkill,
  "spring-physics": springPhysicsSkill,
  typography: typographySkill,
};

// ─── Example skill → example ID map ───
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
  if (skillName.startsWith("example-")) {
    const exampleId =
      exampleIdMap[skillName as (typeof EXAMPLE_SKILLS)[number]];
    const example = examples.find((e) => e.id === exampleId);
    if (example) {
      const cleanCode = example.code.replace(/\\\\/g, "\\");
      return `## Example: ${example.name}\n${example.description}\n\n\`\`\`tsx\n${cleanCode}\n\`\`\``;
    }
    return "";
  }

  return (
    guidanceSkillContent[skillName as (typeof GUIDANCE_SKILLS)[number]] || ""
  );
}

export function getCombinedSkillContent(skills: SkillName[]): string {
  if (skills.length === 0) return "";
  const contents = skills
    .map((skill) => getSkillContent(skill))
    .filter((content) => content.length > 0);
  return contents.join("\n\n---\n\n");
}

export const SKILL_DETECTION_PROMPT = `Classify this motion graphics prompt into ALL applicable categories.
A prompt can match multiple categories. Only include categories that are clearly relevant.

Guidance categories (Remotion official + custom):
- 3d: 3D objects, ThreeJS, spatial animations, rotating cubes, 3D scenes
- animations: basic animation patterns, fadeIn, slideUp, scale, opacity transitions
- assets: static files, public folder assets, staticFile() usage
- audio-visualization: spectrum bars, waveforms, bass-reactive effects, music visualization
- audio: background music, sound effects, Audio component, volume control
- calculate-metadata: dynamic video dimensions, duration based on data, API-driven props
- can-decode: video/audio codec detection, format support checking
- charts: data visualizations, bar charts, pie charts, progress bars, statistics, metrics
- compositions: video setup, width/height/fps, Composition component, Still component
- display-captions: word-by-word captions, subtitle display, caption styling
- extract-frames: extracting individual frames from video
- ffmpeg: video processing, trimming, silence detection, format conversion
- fonts: Google Fonts, local fonts, @remotion/google-fonts, font loading
- get-audio-duration: measuring audio file length
- get-video-dimensions: detecting video width/height
- get-video-duration: measuring video file length
- gifs: GIF rendering, animated GIFs, @remotion/gif
- images: image loading, Img component, staticFile for images
- import-srt-captions: parsing SRT/VTT subtitle files
- light-leaks: light leak overlays, lens flare effects
- lottie: Lottie animations, @remotion/lottie, After Effects exports
- maps: map visualizations, geographic data
- measuring-dom-nodes: DOM measurement, element sizing, useElementSize
- measuring-text: text width/height measurement, dynamic text layout
- parameters: input props, dynamic parameters, CLI parameters
- sequencing: Sequence, Series, timing, delay, staggered animations
- sfx: sound effects, short audio clips
- subtitles: subtitle/caption system, @remotion/captions
- tailwind: Tailwind CSS integration (layout only, no animations)
- text-animations: typewriter, word highlight, kinetic text, text effects
- timing: spring, interpolate, easing, animation curves
- transcribe-captions: audio transcription, speech-to-text, @remotion/install-whisper-cpp
- transitions: TransitionSeries, fade, slide, wipe, flip, scene transitions
- transparent-videos: transparent background videos, alpha channel
- trimming: video trimming, cutting clips
- videos: Video component, OffthreadVideo, video playback
- voiceover: text-to-speech, voiceover generation
- frontend-design: distinctive UI design, production-grade interfaces, visual polish, creative aesthetics, anti-generic-AI-slop
- app-promo: app promotional videos, device mockups, phone screens, pastel gradients
- cardnews-carousel: Instagram carousel cards, card news, multi-slide posts, 카드뉴스, 카루셀
- crabs-brand: Crabs brand colors (indigo/violet/amber), Inter font, clean modern style
- messaging: chat interfaces, WhatsApp, iMessage, chat bubbles, text messages
- social-media: Instagram stories, TikTok, YouTube shorts, reels, vertical video
- spring-physics: bouncy animations, organic motion, elastic effects, overshoot
- typography: kinetic text, typewriter effects, word carousels, animated titles

Code examples (complete working references):
- example-logo-intro: brand intro/outro with spring-scaled logo, letter-by-letter stagger
- example-product-teaser: product/app teaser with 3D-tilted phone mockup, headline, CTA
- example-bar-chart: animated bar chart with spring animations, Y-axis labels
- example-countup-number: count-up number showcase with glass cards, key metrics
- example-progress-bar: loading/progress bar animation from 0 to 100%
- example-app-promo: app promotional video with 3D phone mockup, multi-scene
- example-testimonial-card: customer testimonial card with typing effect, star ratings
- example-cardnews-carousel: Instagram card news carousel with cover, body, closing
- example-text-effects: typewriter + cursor blink + word highlight
- example-animated-shapes: bouncing/rotating SVG shapes
- example-lottie: Lottie animations from URL
- example-falling-spheres: 3D bouncing spheres with ThreeJS

Return an array of matching category names. Return an empty array if none apply.`;
