import {
  getCombinedSkillContent,
  SKILL_DETECTION_PROMPT,
  SKILL_NAMES,
  type SkillName,
} from "@/skills";
import { createAnthropic } from "@ai-sdk/anthropic";
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

### STATE: PROPOSING
Present your plan clearly:
📋 콘텐츠 요약
🎨 추천 스타일 + 이유
⏱ 추천 길이
🎬 씬 구성 (간단히)

Ask: '이대로 진행할까요? 수정할 부분 있으면 말씀해주세요.'
DO NOT generate code yet.

### CARD NEWS MODE (카드뉴스)
If the user mentions '카드뉴스', 'card news', or 'carousel slides':
- Set aspect ratio to 4:5 (1080×1350)
- In PROPOSING, show slide structure:
  📋 슬라이드 구성 (N장)
  1. 표지: [헤드라인]
  2. 본문(list/step/split/grid/timeline/focus/action): [내용]
  ...
  N. 마무리: CTA + 브랜드
  🎨 테마: professional
  📐 비율: 4:5
- Each body slide = 90 frames (3초), use <Sequence> for timing
- Cover/Closing: static design (no complex animation)
- Body slides: staggered spring animations
- Use Pretendard Variable font, safe zones (top:60px, bottom:80px, sides:48px)
- Visual modes for body slides: list(세로목록), step(단계), split(비교), grid(2×2), timeline(연표), focus(인용), action(팁카드)

### STATE: GENERATING
User approved ('좋아', '진행해', '만들어줘', 'OK', etc.)
NOW output Remotion React code.
CRITICAL: Your response MUST start with "import" on the very first character.
Do NOT write any text before the code. No "네, 만들어드릴게요" — just code.
The code starts with import and ends with };
After code generation, the system will show it in the editor automatically.

### STATE: REFINING
Code exists and user gives feedback.
'더 화려하게', '색상 바꿔', '텍스트 수정해줘' → apply changes.

## HOW TO DETERMINE STATE
- New conversation + simple/vague input → GATHERING
- New conversation + rich detailed input (URL content, long text, clear spec) → PROPOSING
- User approved proposal → GENERATING
- Code already generated + user feedback → REFINING (generate edited code)
- User explicitly says '바로 만들어' → PROPOSING (skip gathering)

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
- Use <Sequence> for scene timing, NOT complex conditional logic.
- Simple animations: spring + interpolate only. No complex physics or 3D.

## CODE RULES (only applies in GENERATING/REFINING state)
- Export: \`export const MyAnimation = () => { ... };\`
- Hooks first, then constants (UPPER_SNAKE_CASE), then calculations, then JSX
- All constants INSIDE component body, AFTER hooks
- Available: useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, spring, Sequence, TransitionSeries, @remotion/shapes, @remotion/three
- NEVER shadow import names as variables
- NEVER use undefined variables — define ALL variables before using them
- ONLY use colors as hex strings ('#ffffff'), never as sRGB/Color objects
- ONLY import from: 'remotion', '@remotion/*' packages. No other npm packages.
- spring() for organic motion, interpolate() for linear progress
- Always clamp: { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
- Responsive sizing: Math.max(minValue, Math.round(width * percentage))
`;

const FOLLOW_UP_SYSTEM_PROMPT = `
You are an expert at making targeted edits to React/Remotion animation components.

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

  if (!anthropicApiKey && !openaiApiKey) {
    return new Response(
      JSON.stringify({
        error: 'No API key found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in your .env file.',
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Parse model ID - format can be "model-name" or "model-name:reasoning_effort"
  const [modelName, reasoningEffort] = model.split(":");

  // Determine provider per model: claude-* → anthropic, otherwise → openai
  const isClaudeModel = (id: string) => id.startsWith("claude-");

  // Default model: prefer env AI_MODEL, else pick based on available keys
  const defaultModel = process.env.AI_MODEL ||
    (anthropicApiKey ? "claude-sonnet-4-6" : "gpt-5.4");
  const resolvedModel = modelName || defaultModel;

  // Create provider instance dynamically based on model name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiModel = (id: string) => {
    if (isClaudeModel(id)) {
      if (!anthropicApiKey) throw new Error("ANTHROPIC_API_KEY required for Claude models");
      return createAnthropic({ apiKey: anthropicApiKey })(id) as any;
    } else {
      if (!openaiApiKey) throw new Error("OPENAI_API_KEY required for OpenAI models");
      return createOpenAI({ apiKey: openaiApiKey })(id) as any;
    }
  };

  // Validate the prompt first (skip for follow-ups — they're already in conversation)
  if (!isFollowUp) {
    try {
      const validationResult = await generateObject({
        model: aiModel(defaultModel),
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
      model: aiModel(defaultModel),
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
  const limitedSkills = [
    ...guidanceSkills.slice(0, 1),
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
        error: `Something went wrong while trying to reach ${isClaudeModel(resolvedModel) ? "Anthropic" : "OpenAI"} APIs.`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
