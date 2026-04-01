import {
  getCombinedSkillContent,
  SKILL_DETECTION_PROMPT,
  SKILL_NAMES,
  type SkillName,
} from "@/skills";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, streamText } from "ai";
import { z } from "zod";

const VALIDATION_PROMPT = `You are a prompt classifier for a video production assistant.

Determine if the user's prompt could eventually lead to creating motion graphics or video content.

VALID prompts include:
- Direct requests for animations, motion graphics, video content
- Descriptions of content that could become a video (product info, text, topics)
- URLs or content that could be turned into video
- Vague or short requests about making something visual ("만들어줘", "make something cool")
- Greetings or introductions that imply they want to create video
- Requests about video style, tone, duration, audience
- Any input that a video production assistant could work with

INVALID prompts include:
- Completely unrelated queries (math, recipes, homework, general knowledge)
- Requests explicitly NOT about visual/video content

Be PERMISSIVE — when in doubt, return true. The assistant can ask clarifying questions.

Return true if the prompt could relate to video/motion graphics creation, false otherwise.`;

const SYSTEM_PROMPT = `You are a friendly video production assistant for VibeMotion.
You create motion graphics through conversation, not instantly.
Respond in the same language as the user (Korean default).

## YOUR CONVERSATION STATES

### STATE: GATHERING (default for new conversations)
You are collecting information. DO NOT generate code.
Ask naturally about:
- 용도 (광고, 프레젠테이션, SNS, 교육 등)
- 타겟 (누구를 위한 영상인지)
- 톤 (전문적, 재미있는, 드라마틱, 미니멀)
- 길이 (10초, 30초, 60초)
- 음성 내레이션 필요 여부

Ask 1-2 questions at a time, not all at once.
If user provides rich detailed input, skip to PROPOSING.
If user says '바로 만들어' or 'just make it', go to PROPOSING with best guess.
If the prompt includes a specific duration (e.g. '15초', '30초'), always respect it.

### CONTENT AUTO-ANALYSIS (apply before GATHERING/PROPOSING)
Users often give you raw content instead of technical specs. When they do:

1. **Text dump / article / script** → Extract key messages, break into scenes:
   - Find the headline (most impactful statement)
   - Identify 3-5 supporting points
   - Determine tone from the writing style
   - Auto-select scene templates: Hero for headline, List/Grid for points, Focus for key quote, Stat for numbers

2. **Topic / subject only** (e.g. "AI 스타트업 소개") → Generate content yourself:
   - Create a compelling headline
   - Structure 3-4 scenes with relevant content
   - Choose appropriate style (professional for business, vibrant for creative, etc.)

3. **Style card selected** (모션그래픽/카드뉴스/시네마틱) → Apply style constraints:
   - 모션그래픽: 9:16, dynamic transitions, spring animations, bold typography
   - 카드뉴스: 4:5, sequential slides via Series, safe zones, no transitions between slides
   - 시네마틱: 16:9 or 9:16, fade transitions, slower timing, atmospheric backgrounds, minimal text

4. **Duration auto-selection** (if user doesn't specify):
   - Short text / single message → 10초
   - 3-5 points / standard content → 15-20초
   - Detailed article / many points → 25-30초
   - 카드뉴스 → 슬라이드 수 × 3초

Always skip GATHERING and go directly to PROPOSING when you have enough content to work with.
"Enough content" = a topic OR text dump OR clear intent. Don't ask unnecessary questions.

### STATE: PROPOSING
Present your plan clearly:
📋 콘텐츠 요약
🎨 추천 스타일 + 이유
⏱ 추천 길이
🎬 씬 구성 (간단히)

Ask: '이대로 진행할까요? 수정할 부분 있으면 말씀해주세요.'
DO NOT generate code yet.

### CARD NEWS MODE (카드뉴스) — 2-STEP PROCESS
If the user mentions '카드뉴스', 'card news', or 'carousel slides':
- Set aspect ratio to 4:5 (1080×1350)

**STEP 1 — DESIGN PLAN (in PROPOSING state):**
Do NOT write code. Instead, output a detailed layout design for each scene:
  📐 씬 N: [타입] — [제목]
  - 블록 구조: [어떤 시각적 덩어리들이 어디에 배치되는지]
  - 점유율: [캔버스 대비 콘텐츠 면적 %]
  - 폰트 크기: [타이틀 Npx, 본문 Npx]
  - 장식 요소: [워드마크/그리드/패널/side bar 중 뭘 쓸지]
  - 시선 흐름: [좌상→우하 등]

This forces you to think as a designer first, then implement.

**STEP 2 — CODE (in GENERATING state):**
After user approves the design plan, implement it exactly as Remotion React code.
Follow the cardnews-carousel skill guidance for implementation details.

**SHORTCUT:** If prompt contains 'video-config' or '코드만 출력해',
skip Step 1 and go directly to Step 2 (code generation).
But even then, mentally plan the layout before writing code.

### STATE: GENERATING
User approved ('좋아', '진행해', '만들어줘', 'OK', etc.)
NOW output Remotion React code.
CRITICAL: Your response MUST start with "import" on the very first character.
Do NOT write any text before the code. No "네, 만들어드릴게요" — just code.
The code starts with import and ends with };
After code generation, the system will show it in the editor automatically.

**INTERNAL PLANNING (do this mentally — NEVER output the plan as text):**
Before writing any code, plan a video-config structure in your head.
CRITICAL: Do NOT write out the plan. Go straight to code. Your response must start with "import".
1. How many scenes? (max 4)
2. Each scene: { type: Hero|List|Grid|Stat|Flow|Focus|Split, durationInFrames: N, title, items }
3. Total durationInFrames = sum of all scene durations (or use Series for auto-calculation)
4. Transition type between scenes (fade/slide/none)
5. Design tokens: background color, accent color, font
Then write code that implements this exact structure. This prevents duration miscalculation.

### STATE: REFINING
Code exists and user gives feedback.
'더 화려하게', '색상 바꿔', '텍스트 수정해줘' → apply changes.

## HOW TO DETERMINE STATE
- New conversation + simple/vague input → GATHERING
- New conversation + rich detailed input (URL content, long text, clear spec) → PROPOSING
- User approved proposal → GENERATING
- Code already generated + user feedback → REFINING (generate edited code)
- User explicitly says '바로 만들어' → PROPOSING (skip gathering)
- If prompt contains 'video-config' or '코드만 출력해' or starts with explicit technical specs (durationInFrames, Series, Sequence) → GENERATING directly. Skip GATHERING and PROPOSING entirely.

## DURATION RULES (CRITICAL for GENERATING state)
When generating code:
- 5초 → durationInFrames: 150 (30fps)
- 10초 → durationInFrames: 300
- 15초 → durationInFrames: 450
- 20초 → durationInFrames: 600
- 25초 → durationInFrames: 750
- 30초 → durationInFrames: 900
- 60초 → durationInFrames: 1800
- DEFAULT: 15초 (450 frames) if user doesn't specify duration
- useVideoConfig() for fps/width/height, but plan scene timing to fill the full duration
- If 30초 requested with 3 scenes: each scene ~300 frames, NOT 80 frames
- NEVER default to 8초 (240 frames) — this is too short for most content

## SCENE LIMITS (prevent code too long to compile)
- Max 4 scenes for any video. Even 60초 videos use 4 scenes max.
- Keep code under 200 lines. Reuse styles across scenes.
- Use <Series> for sequential scenes (auto-calculates timing):
  \`\`\`tsx
  import {Series} from 'remotion';
  <Series>
    <Series.Sequence durationInFrames={90}><Scene1 /></Series.Sequence>
    <Series.Sequence durationInFrames={90}><Scene2 /></Series.Sequence>
  </Series>
  \`\`\`
- Or use <Sequence from={N}> for manual timing. Always set explicit durationInFrames.
- Simple animations: spring + interpolate only. No complex physics or 3D.
- spring() delay: use \`spring({ frame: frame - delay, fps })\` pattern. NOT the delay parameter.

## 절대 규칙 (코드 생성 시 반드시 준수)
- CSS transition, animation, @keyframes, Tailwind 애니메이션 클래스 전부 사용 금지. 모든 애니메이션은 useCurrentFrame() 기반 spring() 또는 interpolate()로.
- 외부 CDN 폰트 URL 절대 금지 (Google Fonts, jsDelivr 등). 시스템 폰트만 사용 (Inter, system-ui, sans-serif).
- spring()은 정확히 1.0에 도달하지 않음. spring >= 1 조건 대신 프레임 번호로 조건 걸 것.
- 3D perspective는 회전 요소의 부모 div에 CSS style 속성으로 적용 (transform: perspective() 아님). transformStyle: "preserve-3d" 필수. overflow: hidden 사용 금지.
- transform 순서: translate 먼저, rotate 나중.
- 색상은 반드시 헥스 코드로 (#1a1a2e). rgba() 사용 금지. 투명도는 헥스 8자리 (#ffffff1a).
- 한글 문자열은 반드시 const 상수로 분리. JSX 안에 직접 한글 문자열 넣지 말 것.

## 영상 구조 4단계 (마케팅/프로덕트 영상 시)
프로덕트 소개, 마케팅, 서비스 홍보 영상을 만들 때:
1. 후킹 (0~3초) — 가장 인상적인 화면/결과물로 시작. 로고로 시작 금지.
2. 문제 (3~8초) — "이런 경험 있지 않나요?" 공감 유발.
3. 솔루션 (8~20초) — 핵심 기능 하나만. 전부 보여주면 메시지 흐려짐.
4. CTA (마지막 3~5초) — 링크, QR, "지금 시작하기".

## spring 애니메이션 가이드 (damping 값 기준)
- UI 요소 등장: damping 12~15 (빠르고 탄력적)
- 씬 전환: damping 18~22 (부드럽고 무게감)
- 숫자/통계: damping 25+ (무겁고 느리게)
- 타이틀 임팩트: damping 8~10 (극적 감속, 바운스)
- 배경 요소: damping 30+ (느리고 우아하게)

## VERTICAL VIDEO RULES (9:16, 1080×1920) — CRITICAL
When aspect ratio is 9:16 (portrait/vertical):
- Text must be LARGE: titles 64-96px, body 32-44px, captions 24-28px. Small text = failure.
- Use 80-90% of vertical space. Content must fill the screen top to bottom.
- Padding: max 48px sides, 60px top/bottom. Do NOT center small content in the middle.
- Cards/panels should be full-width (width: 90%+) and tall.
- Stack elements vertically with 16-24px gaps. NOT 100px gaps.
- Background must never be >30% visible empty space.
- This is mobile-first: everything should be readable on a phone without zooming.
- NEVER design as if it's a 16:9 landscape with margins. Fill the tall canvas.

## SCENE TEMPLATES (choose the best fit for each scene)
- Hero: title card with headline + subtitle. Spring scale entrance.
- List: 3-5 items appearing sequentially with stagger delay.
- Grid: 2×2 or 3×2 card layout. Scale-up spring per card.
- Stat: big number count-up + label. For metrics/KPIs.
- Flow: step-by-step process with connectors.
- Focus: single quote or key message, large centered text.
- Split: side-by-side comparison (before/after, vs).

## SCENE TRANSITIONS (for multi-scene videos)
Use \`<TransitionSeries>\` from '@remotion/transitions' for smooth scene cuts:
\`\`\`tsx
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={150}>
    <Scene1 />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({durationInFrames: 15})}
  />
  <TransitionSeries.Sequence durationInFrames={150}>
    <Scene2 />
  </TransitionSeries.Sequence>
</TransitionSeries>
\`\`\`
Available transitions: fade, slide (from-left/right/top/bottom), wipe, flip, clockWipe.
Import from: '@remotion/transitions/fade', '@remotion/transitions/slide', etc.
Timing: linearTiming({ durationInFrames: 20 }) or springTiming({ config: { damping: 200 } })
NOTE: transitions overlap scenes, so total duration = sum of sequences - sum of transitions.
Duration calculation: const total = scene1 + scene2 - transitionDuration;
For springTiming without explicit durationInFrames, duration depends on fps.

## DESIGN TOKENS (consistent styling)
Define all design values as constants at the top of the component:
\`\`\`tsx
// Colors
const COLOR_BG = '#0f172a';
const COLOR_PRIMARY = '#3b82f6';
const COLOR_TEXT = '#ffffff';
const COLOR_TEXT_DIM = '#94a3b8';
// Typography
const FONT = 'Inter, system-ui, sans-serif';
const FONT_SIZE_DISPLAY = 64;
const FONT_SIZE_BODY = 24;
// Spacing
const SAFE_TOP = 60;
const SAFE_BOTTOM = 80;
const SAFE_SIDES = 48;
\`\`\`
Never hardcode colors/sizes inline. Always reference constants.

## CODE RULES (only applies in GENERATING/REFINING state)
- Export: \`export const MyAnimation = () => { ... };\` (NEVER use React.FC type annotation)
- Hooks first, then constants (UPPER_SNAKE_CASE), then calculations, then JSX
- All constants INSIDE component body, AFTER hooks
- Available: useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, spring, Sequence, Series, Img (from 'remotion'), TransitionSeries (from '@remotion/transitions'), @remotion/shapes
- For video: import { Video } from '@remotion/media'; (trimBefore, trimAfter, volume props)
- For audio: import { Audio } from '@remotion/media';
- For assets: import { staticFile } from 'remotion'; (references public/ folder)
- For GIF: import { Gif } from '@remotion/gif';
- NEVER shadow import names as variables
- NEVER use undefined variables — define ALL variables before using them
- Template literals: use standard backtick syntax. NEVER double-escape or produce \\u escape sequences.
- Korean text: ALWAYS put Korean strings in const variables, then reference in JSX. NEVER put Korean directly inside template literal expressions. Example: const TITLE = "경쟁사가 베끼는 건"; then use {TITLE} in JSX.
- Long text strings: NEVER include line breaks inside string literals. Keep each string on ONE line. If text is long, split into multiple const variables.
- ONLY use colors as hex strings ('#ffffff'), never as sRGB/Color objects
- NEVER concatenate hex + opacity inside template literals like \`\${COLOR}0F\`. This breaks compilation. Instead define full 8-digit hex as constants: const COLOR_ACCENT_10 = "#00AEEF1A"; const COLOR_ACCENT_50 = "#00AEEF80";
- ONLY import from: 'remotion', '@remotion/*' packages. No other npm packages.
- CSS transitions/animations are FORBIDDEN — they don't render in Remotion.
- Tailwind animation classes are FORBIDDEN — use interpolate()/spring() instead.
- spring() for organic motion, interpolate() for linear progress
- Always clamp: { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
- Responsive sizing: Math.max(minValue, Math.round(width * percentage))
- For staggered animations: \`spring({ frame: Math.max(0, frame - delay), fps, config: {damping: 15, stiffness: 200}, durationInFrames: 25 })\`
- Always use premountFor on Sequence/Series.Sequence to preload components:
  \`<Series.Sequence durationInFrames={90} premountFor={30}>\`
`;

const FOLLOW_UP_SYSTEM_PROMPT = `
You are an expert at making targeted edits to React/Remotion animation components.

## AVAILABLE IMPORTS (these ARE available in the runtime sandbox)
From 'remotion': AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence, Series, Img
From '@remotion/transitions': TransitionSeries, linearTiming, springTiming
From '@remotion/transitions/fade': fade
From '@remotion/transitions/slide': slide
From '@remotion/transitions/wipe': wipe
From '@remotion/transitions/flip': flip
From '@remotion/shapes': Rect, Circle, Triangle, Star, Polygon, Ellipse, Heart, Pie
From '@remotion/lottie': Lottie
From '@remotion/three': ThreeCanvas
IMPORTANT: Series IS available. Do NOT remove Series imports when fixing errors.

## HEX COLOR RULE
NEVER concatenate hex + opacity inside template literals like \`\${COLOR}0F\`.
Define full 8-digit hex as constants: const COLOR_10 = "#00AEEF1A";

## KOREAN TEXT RULE
Korean strings must be in const variables, never inside template literal expressions.
Correct: const TITLE = "경쟁사가 베끼는 건"; then {TITLE} in JSX.
Wrong: \`경쟁사가 \${x}을 베낀다\` — this causes Unicode escape errors.

Given the current code and a user request, decide whether to:
1. Use targeted edits (for small, specific changes)
2. Provide full replacement code (for major restructuring)

## WHEN TO USE TARGETED EDITS (type: "edit")
- Changing colors, text, numbers, timing values
- Adding or removing a single element
- Modifying styles or properties
- Small additions (new variable, new element)
- Changes affecting <30% of the code

## WHEN TO USE FULL REPLACEMENT (type: "full")
- Completely different animation style
- Major structural reorganization
- User asks to "start fresh" or "rewrite"
- Changes affect >50% of the code

## EDIT FORMAT
For targeted edits, each edit needs:
- old_string: The EXACT string to find (including whitespace/indentation)
- new_string: The replacement string

CRITICAL:
- old_string must match the code EXACTLY character-for-character
- Include enough surrounding context to make old_string unique
- If multiple similar lines exist, include more surrounding code
- Preserve indentation exactly as it appears in the original

## PRESERVING USER EDITS
If the user has made manual edits, preserve them unless explicitly asked to change.
`;

// Schema for follow-up edit responses
// Note: Using a flat object schema because OpenAI doesn't support discriminated unions
const FollowUpResponseSchema = z.object({
  type: z
    .enum(["edit", "full"])
    .describe(
      'Use "edit" for small targeted changes, "full" for major restructuring',
    ),
  summary: z
    .string()
    .describe(
      "A brief 1-sentence summary of what changes were made, e.g. 'Changed background color to blue and increased font size'",
    ),
  edits: z
    .array(
      z.object({
        description: z
          .string()
          .describe(
            "Brief description of this edit, e.g. 'Update background color', 'Increase animation duration'",
          ),
        old_string: z
          .string()
          .describe("The exact string to find (must match exactly)"),
        new_string: z.string().describe("The replacement string"),
      }),
    )
    .optional()
    .describe(
      "Required when type is 'edit': array of search-replace operations",
    ),
  code: z
    .string()
    .optional()
    .describe(
      "Required when type is 'full': the complete replacement code starting with imports",
    ),
});

type EditOperation = {
  description: string;
  old_string: string;
  new_string: string;
  lineNumber?: number;
};

// Calculate line number where a string occurs in code
function getLineNumber(code: string, searchString: string): number {
  const index = code.indexOf(searchString);
  if (index === -1) return -1;
  return code.substring(0, index).split("\n").length;
}

// Apply edit operations to code and enrich with line numbers
function applyEdits(
  code: string,
  edits: EditOperation[],
): {
  success: boolean;
  result: string;
  error?: string;
  enrichedEdits?: EditOperation[];
  failedEdit?: EditOperation;
} {
  let result = code;
  const enrichedEdits: EditOperation[] = [];

  for (let i = 0; i < edits.length; i++) {
    const edit = edits[i];
    const { old_string, new_string, description } = edit;

    // Check if the old_string exists
    if (!result.includes(old_string)) {
      return {
        success: false,
        result: code,
        error: `Edit ${i + 1} failed: Could not find the specified text`,
        failedEdit: edit,
      };
    }

    // Check for multiple matches (ambiguous)
    const matches = result.split(old_string).length - 1;
    if (matches > 1) {
      return {
        success: false,
        result: code,
        error: `Edit ${i + 1} failed: Found ${matches} matches. The edit target is ambiguous.`,
        failedEdit: edit,
      };
    }

    // Get line number before applying edit
    const lineNumber = getLineNumber(result, old_string);

    // Apply the edit
    result = result.replace(old_string, new_string);

    // Store enriched edit with line number
    enrichedEdits.push({
      description,
      old_string,
      new_string,
      lineNumber,
    });
  }

  return { success: true, result, enrichedEdits };
}

interface ConversationContextMessage {
  role: "user" | "assistant";
  content: string;
  /** For user messages, attached images as base64 data URLs */
  attachedImages?: string[];
}

interface ErrorCorrectionContext {
  error: string;
  attemptNumber: number;
  maxAttempts: number;
  failedEdit?: {
    description: string;
    old_string: string;
    new_string: string;
  };
}

interface GenerateRequest {
  prompt: string;
  model?: string;
  currentCode?: string;
  conversationHistory?: ConversationContextMessage[];
  isFollowUp?: boolean;
  hasManualEdits?: boolean;
  /** Error correction context for self-healing loops */
  errorCorrection?: ErrorCorrectionContext;
  /** Skills already used in this conversation (to avoid redundant skill content) */
  previouslyUsedSkills?: string[];
  /** Base64 image data URLs for visual context */
  frameImages?: string[];
  /** Video dimensions */
  compositionWidth?: number;
  compositionHeight?: number;
  aspectRatio?: string;
}

interface GenerateResponse {
  code: string;
  summary: string;
  metadata: {
    skills: string[];
    editType: "tool_edit" | "full_replacement";
    edits?: EditOperation[];
    model: string;
  };
}

export async function POST(req: Request) {
  const {
    prompt,
    model = process.env.AI_MODEL || "gpt-5.4",
    currentCode,
    conversationHistory = [],
    isFollowUp = false,
    hasManualEdits = false,
    errorCorrection,
    previouslyUsedSkills = [],
    frameImages,
    compositionWidth = 1920,
    compositionHeight = 1080,
    aspectRatio = "16:9",
  }: GenerateRequest = await req.json();

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const googleApiKey = process.env.GOOGLE_AI_API_KEY;

  if (!anthropicApiKey && !openaiApiKey && !googleApiKey) {
    return new Response(
      JSON.stringify({
        error: 'No API key found. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_AI_API_KEY in your .env file.',
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Parse model ID - format can be "model-name" or "model-name:reasoning_effort"
  const [modelName, reasoningEffort] = model.split(":");

  // Determine provider per model
  const isClaudeModel = (id: string) => id.startsWith("claude-");
  const isGeminiModel = (id: string) => id.startsWith("gemini-");

  // Default model: prefer env AI_MODEL, else pick based on available keys
  const defaultModel = process.env.AI_MODEL ||
    (anthropicApiKey ? "claude-sonnet-4-6" : googleApiKey ? "gemini-3.1-pro-preview" : "gpt-5.4");
  const resolvedModel = modelName || defaultModel;

  // Create provider instance dynamically based on model name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiModel = (id: string): any => {
    if (isClaudeModel(id)) {
      if (!anthropicApiKey) throw new Error("ANTHROPIC_API_KEY required for Claude models");
      return createAnthropic({ apiKey: anthropicApiKey })(id);
    } else if (isGeminiModel(id)) {
      if (!googleApiKey) throw new Error("GOOGLE_AI_API_KEY required for Gemini models");
      return createGoogleGenerativeAI({ apiKey: googleApiKey })(id);
    } else {
      if (!openaiApiKey) throw new Error("OPENAI_API_KEY required for OpenAI models");
      return createOpenAI({ apiKey: openaiApiKey })(id);
    }
  };

  // Validate the prompt first (skip for follow-ups and error corrections — they're already in conversation)
  if (!isFollowUp && !errorCorrection) {
    try {
      const validationResult = await generateObject({
        model: aiModel(resolvedModel),
        system: VALIDATION_PROMPT,
        prompt: `User prompt: "${prompt}"`,
        schema: z.object({ valid: z.boolean() }),
      });

      if (!validationResult.object.valid) {
        return new Response(
          JSON.stringify({
            error:
              "No valid motion graphics prompt. Please describe an animation or visual content you'd like to create.",
            type: "validation",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
    } catch (validationError) {
      // On validation error, allow through rather than blocking
      console.error("Validation error:", validationError);
    }
  }

  // Detect which skills apply to this prompt
  let detectedSkills: SkillName[] = [];
  try {
    const skillResult = await generateObject({
      model: aiModel(resolvedModel),
      system: SKILL_DETECTION_PROMPT,
      prompt: `User prompt: "${prompt}"`,
      schema: z.object({
        skills: z.array(z.enum(SKILL_NAMES)),
      }),
    });
    detectedSkills = skillResult.object.skills;
    console.log("Detected skills:", detectedSkills);
  } catch (skillError) {
    console.error("Skill detection error:", skillError);
  }

  // Filter out skills that were already used in the conversation to avoid redundant context
  const newSkills = detectedSkills.filter(
    (skill) => !previouslyUsedSkills.includes(skill),
  );
  if (
    previouslyUsedSkills.length > 0 &&
    newSkills.length < detectedSkills.length
  ) {
    console.log(
      `Skipping ${detectedSkills.length - newSkills.length} previously used skills:`,
      detectedSkills.filter((s) => previouslyUsedSkills.includes(s)),
    );
  }

  // Add video dimensions to the system prompt
  const dimensionsPrompt = `\n\n## VIDEO DIMENSIONS\nThe video dimensions are ${compositionWidth}x${compositionHeight} (${aspectRatio}). Design your layout accordingly.\n`;

  // Load skill-specific content only for NEW skills (previously used skills are already in context)
  const guidanceSkills = (newSkills as SkillName[]).filter(s => !s.startsWith('example-'));
  const exampleSkills = (newSkills as SkillName[]).filter(s => s.startsWith('example-'));
  // Load up to 3 guidance skills + 1 example (official skills are compact)
  // Card news: guidance-only (example code has template literal escaping that breaks AI output)
  const hasCardNews = guidanceSkills.some(s => s === 'cardnews-carousel');
  const limitedSkills = hasCardNews
    ? guidanceSkills.slice(0, 3)
    : [
        ...guidanceSkills.slice(0, 3),
        ...exampleSkills.slice(0, 1),
      ];
  const skillContent = getCombinedSkillContent(limitedSkills);
  const enhancedSystemPrompt = skillContent
    ? `${SYSTEM_PROMPT}${dimensionsPrompt}\n## SKILL-SPECIFIC GUIDANCE\n${skillContent}`
    : `${SYSTEM_PROMPT}${dimensionsPrompt}`;

  // FOLLOW-UP MODE: Use non-streaming generateObject for faster edits
  if (isFollowUp && currentCode) {
    try {
      // Build context for the edit request
      const contextMessages = conversationHistory.slice(-6);
      let conversationContext = "";
      if (contextMessages.length > 0) {
        conversationContext =
          "\n\n## RECENT CONVERSATION:\n" +
          contextMessages
            .map((m) => {
              const imageNote =
                m.attachedImages && m.attachedImages.length > 0
                  ? ` [with ${m.attachedImages.length} attached image${m.attachedImages.length > 1 ? "s" : ""}]`
                  : "";
              return `${m.role.toUpperCase()}: ${m.content}${imageNote}`;
            })
            .join("\n");
      }

      const manualEditNotice = hasManualEdits
        ? "\n\nNOTE: The user has made manual edits to the code. Preserve these changes."
        : "";

      // Error correction context for self-healing
      let errorCorrectionNotice = "";
      if (errorCorrection) {
        const failedEditInfo = errorCorrection.failedEdit
          ? `

The previous edit attempt failed. Here's what was tried:
- Description: ${errorCorrection.failedEdit.description}
- Tried to find: \`${errorCorrection.failedEdit.old_string}\`
- Wanted to replace with: \`${errorCorrection.failedEdit.new_string}\`

The old_string was either not found or matched multiple locations. You MUST include more surrounding context to make the match unique.`
          : "";

        const isEditFailure =
          errorCorrection.error.includes("Edit") &&
          errorCorrection.error.includes("failed");

        if (isEditFailure) {
          errorCorrectionNotice = `

## EDIT FAILED (ATTEMPT ${errorCorrection.attemptNumber}/${errorCorrection.maxAttempts})
${errorCorrection.error}
${failedEditInfo}

CRITICAL: Your previous edit target was ambiguous or not found. To fix this:
1. Include MORE surrounding code context in old_string to make it unique
2. Make sure old_string matches the code EXACTLY (including whitespace)
3. If the code structure changed, look at the current code carefully`;
        } else {
          errorCorrectionNotice = `

## COMPILATION ERROR (ATTEMPT ${errorCorrection.attemptNumber}/${errorCorrection.maxAttempts})
The previous code failed to compile with this error:
\`\`\`
${errorCorrection.error}
\`\`\`

CRITICAL: Fix this compilation error with TARGETED EDITS ONLY.
- Return type: "edit"
- Do NOT return type: "full"
- Preserve the existing scene structure, layout, and animation plan
- Change only the smallest possible lines needed to compile

Common issues include:
- Syntax errors (missing brackets, semicolons)
- Invalid JSX (unclosed tags, invalid attributes)
- Undefined variables or imports
- TypeScript type errors

Focus ONLY on fixing the error. Do not make other changes.`;
        }
      }

      const editPromptText = `## CURRENT CODE:
\`\`\`tsx
${currentCode}
\`\`\`
${conversationContext}
${manualEditNotice}
${errorCorrectionNotice}

## USER REQUEST:
${prompt}
${frameImages && frameImages.length > 0 ? `\n(See the attached ${frameImages.length === 1 ? "image" : "images"} for visual reference)` : ""}

Analyze the request and decide: use targeted edits (type: "edit") for small changes, or full replacement (type: "full") for major restructuring.`;

      console.log(
        "Follow-up edit with prompt:",
        prompt,
        "model:",
        modelName,
        "skills:",
        detectedSkills.length > 0 ? detectedSkills.join(", ") : "general",
        frameImages && frameImages.length > 0
          ? `(with ${frameImages.length} image(s))`
          : "",
      );

      // Build messages array - include images if provided
      const editMessageContent: Array<
        { type: "text"; text: string } | { type: "image"; image: string }
      > = [{ type: "text" as const, text: editPromptText }];
      if (frameImages && frameImages.length > 0) {
        for (const img of frameImages) {
          editMessageContent.push({ type: "image" as const, image: img });
        }
      }
      const editMessages: Array<{
        role: "user";
        content: Array<
          { type: "text"; text: string } | { type: "image"; image: string }
        >;
      }> = [
        {
          role: "user" as const,
          content: editMessageContent,
        },
      ];

      const editResult = await generateObject({
        model: aiModel(resolvedModel),
        system: `${FOLLOW_UP_SYSTEM_PROMPT}${dimensionsPrompt}`,
        messages: editMessages,
        schema: FollowUpResponseSchema,
      });

      const response = editResult.object;
      let finalCode: string;
      let editType: "tool_edit" | "full_replacement";
      let appliedEdits: EditOperation[] | undefined;

      if (response.type === "edit" && response.edits) {
        // Apply the edits to the current code
        const result = applyEdits(currentCode, response.edits);
        if (!result.success) {
          // If edits fail, return error with the failed edit details
          return new Response(
            JSON.stringify({
              error: result.error,
              type: "edit_failed",
              failedEdit: result.failedEdit,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        finalCode = result.result;
        editType = "tool_edit";
        // Use enriched edits with line numbers
        appliedEdits = result.enrichedEdits;
        console.log(`Applied ${response.edits.length} edit(s) successfully`);
      } else if (response.type === "full" && response.code) {
        // Full replacement
        finalCode = response.code;
        editType = "full_replacement";
        console.log("Using full code replacement");
      } else {
        // Invalid response - missing required fields
        return new Response(
          JSON.stringify({
            error: "Invalid AI response: missing required fields",
            type: "edit_failed",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Return the result with metadata
      const responseData: GenerateResponse = {
        code: finalCode,
        summary: response.summary,
        metadata: {
          skills: detectedSkills,
          editType,
          edits: appliedEdits,
          model: modelName,
        },
      };

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in follow-up edit:", error);
      return new Response(
        JSON.stringify({
          error: "Something went wrong while processing the edit request.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // STREAMING GENERATION: Used for new animations AND conversation flow
  try {
    // Build conversation messages (include history for multi-turn conversation)
    const hasImages = frameImages && frameImages.length > 0;
    const initialPromptText = hasImages
      ? `${prompt}\n\n(See the attached ${frameImages.length === 1 ? "image" : "images"} for visual reference)`
      : prompt;

    type MessageContent = Array<{ type: "text"; text: string } | { type: "image"; image: string }>;
    type ChatMessage = { role: "user"; content: MessageContent } | { role: "assistant"; content: string };

    // Build message history for multi-turn conversation
    const initialMessages: ChatMessage[] = [];

    // Include conversation history for context (conversation flow)
    if (conversationHistory.length > 0) {
      for (const msg of conversationHistory.slice(-10)) {
        if (msg.role === "assistant") {
          initialMessages.push({ role: "assistant", content: msg.content });
        } else {
          initialMessages.push({ role: "user", content: [{ type: "text" as const, text: msg.content }] });
        }
      }
    }

    // Add current user message with images
    const initialMessageContent: MessageContent = [{ type: "text" as const, text: initialPromptText }];
    if (hasImages) {
      for (const img of frameImages) {
        initialMessageContent.push({ type: "image" as const, image: img });
      }
    }
    initialMessages.push({
      role: "user" as const,
      content: initialMessageContent,
    });

    // Timeout safety: abort after 250s (Vercel Pro max is 300s)
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 250_000);

    const result = streamText({
      model: aiModel(resolvedModel),
      system: enhancedSystemPrompt,
      messages: initialMessages,
      abortSignal: abortController.signal,
      ...(reasoningEffort &&
        !isClaudeModel(resolvedModel) && {
          providerOptions: {
            openai: {
              reasoningEffort: reasoningEffort,
            },
          },
        }),
    });

    console.log(
      "Generating React component with prompt:",
      prompt,
      "model:",
      modelName,
      "skills:",
      detectedSkills.length > 0 ? detectedSkills.join(", ") : "general",
      reasoningEffort ? `reasoning_effort: ${reasoningEffort}` : "",
      hasImages ? `(with ${frameImages.length} image(s))` : "",
    );

    // Get the original stream response
    const originalResponse = result.toUIMessageStreamResponse({
      sendReasoning: true,
    });

    // Create metadata event to prepend
    const metadataEvent = `data: ${JSON.stringify({
      type: "metadata",
      skills: detectedSkills,
    })}\n\n`;

    // Create a new stream that prepends metadata before the LLM stream
    const originalBody = originalResponse.body;
    if (!originalBody) {
      return originalResponse;
    }

    const reader = originalBody.getReader();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Send metadata event first
        controller.enqueue(encoder.encode(metadataEvent));

        // Then pipe through the original stream
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } finally {
          clearTimeout(timeoutId);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: originalResponse.headers,
    });
  } catch (error) {
    console.error("Error generating code:", error);
    return new Response(
      JSON.stringify({
        error: `Something went wrong while trying to reach ${isClaudeModel(resolvedModel) ? "Anthropic" : isGeminiModel(resolvedModel) ? "Google AI" : "OpenAI"} APIs. ${error instanceof Error ? error.message : ""}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
