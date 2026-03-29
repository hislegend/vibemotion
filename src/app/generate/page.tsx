"use client";

import { Loader2 } from "lucide-react";
import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, useRef } from "react";
import { AnimationPlayer } from "../../components/AnimationPlayer";
import { ChatSidebar, type ChatSidebarRef } from "../../components/ChatSidebar";
import { CodeEditor } from "../../components/CodeEditor";
import { PageLayout } from "../../components/PageLayout";
import { TabPanel } from "../../components/TabPanel";
import { examples } from "../../examples/code";
import { useAnimationState } from "../../hooks/useAnimationState";
import { useAutoCorrection } from "../../hooks/useAutoCorrection";
import { useConversationState } from "../../hooks/useConversationState";
import {
  getProject,
} from "../../lib/project-storage";
import { saveTemplate } from "../../lib/template-storage";
import { Player } from "@remotion/player";
import { CardNewsTemplate, type SlideContent } from "../../remotion/CardNewsTemplate";
import { MotionTemplate, type MotionScene } from "../../remotion/MotionTemplate";
import type {
  AssistantMetadata,
  EditOperation,
  ErrorCorrectionContext,
} from "../../types/conversation";
import {
  ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIO,
  type AspectRatioId,
  type GenerationErrorType,
  type StreamPhase,
} from "../../types/generation";

const MAX_CORRECTION_ATTEMPTS = 3;

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const projectParam = searchParams.get("project");
  const loadedProject = projectParam ? getProject(projectParam) : null;

  const initialPrompt = loadedProject?.prompt || searchParams.get("prompt") || "";
  const initialModel = loadedProject?.model || searchParams.get("model") || undefined;
  const templateParam = searchParams.get("template"); // "cardnews" etc.
  const durationParam = loadedProject
    ? String(loadedProject.duration)
    : searchParams.get("duration") || (templateParam === "cardnews" ? "18" : null);
  const hasVoice = loadedProject?.voiceAudioUrl
    ? true
    : searchParams.get("voice") === "true";
  const aspectRatioParam = (loadedProject?.aspectRatio ||
    searchParams.get("aspectRatio") ||
    (templateParam === "cardnews" ? "4:5" : null) ||
    DEFAULT_ASPECT_RATIO) as AspectRatioId;
  const aspectRatioConfig = ASPECT_RATIOS.find(
    (ar) => ar.id === aspectRatioParam,
  ) ?? ASPECT_RATIOS.find((ar) => ar.id === DEFAULT_ASPECT_RATIO)!;
  const compositionWidth = aspectRatioConfig.width;
  const compositionHeight = aspectRatioConfig.height;

  // If we have an initial prompt from URL, start in streaming state
  // so syntax highlighting is disabled from the beginning
  const willAutoStart = Boolean(initialPrompt);

  const [durationInFrames, setDurationInFrames] = useState(
    durationParam ? Number(durationParam) * 30 : 450, // 15초 기본값
  );
  const [fps, setFps] = useState(examples[0]?.fps || 30);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isStreaming, setIsStreaming] = useState(willAutoStart);
  const [streamPhase, setStreamPhase] = useState<StreamPhase>(
    willAutoStart ? "reasoning" : "idle",
  );
  const [prompt, setPrompt] = useState(initialPrompt);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const currentProjectId = loadedProject?.id ?? null;

  // Load voice audio from project or sessionStorage
  useEffect(() => {
    if (loadedProject?.voiceAudioUrl) {
      setVoiceAudioUrl(loadedProject.voiceAudioUrl);
    } else if (hasVoice) {
      const storedAudio = sessionStorage.getItem("voiceAudio");
      if (storedAudio) {
        setVoiceAudioUrl(storedAudio);
      }
    }
  }, [hasVoice, loadedProject]);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  // Template mode state
  const [templateSlides, setTemplateSlides] = useState<SlideContent[] | null>(null);
  const [motionScenes, setMotionScenes] = useState<MotionScene[] | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [generationError, setGenerationError] = useState<{
    message: string;
    type: GenerationErrorType;
    failedEdit?: EditOperation;
  } | null>(null);

  // Self-correction state
  const [errorCorrection, setErrorCorrection] =
    useState<ErrorCorrectionContext | null>(null);

  // Conversation state for follow-up edits
  const {
    messages,
    hasManualEdits,
    pendingMessage,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
    markManualEdit,
    getFullContext,
    getPreviouslyUsedSkills,
    getLastUserAttachedImages,
    setPendingMessage,
    clearPendingMessage,
    isFirstGeneration,
    hasGeneratedCode,
  } = useConversationState();

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const {
    code,
    Component,
    error: compilationError,
    isCompiling,
    setCode,
    compileCode,
  } = useAnimationState(loadedProject?.code || examples[0]?.code || "");

  // Compile loaded project code on mount
  useEffect(() => {
    if (loadedProject?.code) {
      compileCode(loadedProject.code);
      setHasGeneratedOnce(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Template mode: auto-generate JSON when prompt is available
  useEffect(() => {
    if (templateParam === "cardnews" && initialPrompt && !templateSlides && !templateLoading && !hasAutoStarted) {
      setHasAutoStarted(true);
      setTemplateLoading(true);
      const model = initialModel || "claude-sonnet-4-6";
      fetch("/api/generate-cardnews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: initialPrompt, model }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.slides) {
            setTemplateSlides(data.slides);
            setDurationInFrames(data.slides.length * 90);
            setHasGeneratedOnce(true);
            addAssistantMessage(
              `📱 카드뉴스 ${data.slides.length}장을 생성했습니다. 수정하고 싶은 부분이 있으면 말씀해주세요.`,
              "" // no code snapshot for template mode
            );
          }
        })
        .catch(() => {
          addAssistantMessage("카드뉴스 생성에 실패했습니다. 다시 시도해주세요.", "");
        })
        .finally(() => setTemplateLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateParam, initialPrompt, templateSlides, templateLoading, hasAutoStarted]);

  // Motion template mode
  useEffect(() => {
    if (templateParam === "motion" && initialPrompt && !motionScenes && !templateLoading && !hasAutoStarted) {
      setHasAutoStarted(true);
      setTemplateLoading(true);
      const model = initialModel || "claude-sonnet-4-6";
      fetch("/api/generate-motion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: initialPrompt, model }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.scenes) {
            setMotionScenes(data.scenes);
            setDurationInFrames(data.scenes.length * 150);
            setHasGeneratedOnce(true);
            addAssistantMessage(
              `🎬 모션그래픽 ${data.scenes.length}장면을 생성했습니다. 수정하고 싶은 부분이 있으면 말씀해주세요.`,
              ""
            );
          }
        })
        .catch(() => {
          addAssistantMessage("모션그래픽 생성에 실패했습니다. 다시 시도해주세요.", "");
        })
        .finally(() => setTemplateLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateParam, initialPrompt, motionScenes, templateLoading, hasAutoStarted]);

  // Runtime errors from the Player (e.g., "cannot access variable before initialization")
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  // Combined error for display - either compilation or runtime error
  const codeError = compilationError || runtimeError;

  // Refs
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStreamingRef = useRef(isStreaming);
  const codeRef = useRef(code);
  const chatSidebarRef = useRef<ChatSidebarRef>(null);
  // Track if last response was conversation (to skip compile on stream end)
  const lastResponseWasConversationRef = useRef(false);

  // Auto-correction hook - use combined code error (compilation + runtime)
  const { markAsAiGenerated, markAsUserEdited } = useAutoCorrection({
    maxAttempts: MAX_CORRECTION_ATTEMPTS,
    compilationError: codeError,
    generationError,
    isStreaming,
    isCompiling,
    hasGeneratedOnce,
    code,
    errorCorrection,
    onTriggerCorrection: useCallback(
      (correctionPrompt: string, context: ErrorCorrectionContext) => {
        setErrorCorrection(context);
        setPrompt(correctionPrompt);
        // Get attached images from the last user message to include in retry
        const lastImages = getLastUserAttachedImages();
        setTimeout(() => {
          // Use silent mode to avoid showing retry as a user message
          // Include images from the last user message so image-based requests can be retried
          chatSidebarRef.current?.triggerGeneration({
            silent: true,
            attachedImages: lastImages,
          });
        }, 100);
      },
      [getLastUserAttachedImages],
    ),
    onAddErrorMessage: addErrorMessage,
    onClearGenerationError: useCallback(() => setGenerationError(null), []),
    onClearErrorCorrection: useCallback(() => setErrorCorrection(null), []),
  });

  // Sync refs
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    const wasStreaming = isStreamingRef.current;
    isStreamingRef.current = isStreaming;

    // Compile when streaming ends - but only if it was a code response
    if (wasStreaming && !isStreaming && !lastResponseWasConversationRef.current) {
      markAsAiGenerated();
      compileCode(codeRef.current);

      // Final duration parse after streaming completes (catches self-healing rewrites)
      if (!durationParam && codeRef.current) {
        const finalCode = codeRef.current;
        const allDurations = Array.from(finalCode.matchAll(/durationInFrames\s*[=:]\s*(\d+)/g))
          .map(m => parseInt(m[1], 10))
          .filter(d => d > 0);
        if (allDurations.length > 0) {
          const usesSeries = finalCode.includes("Series.Sequence") || finalCode.includes("<Series>");
          const parsedDuration = usesSeries && allDurations.length > 1
            ? allDurations.reduce((sum, d) => sum + d, 0)
            : Math.max(...allDurations);
          if (parsedDuration > 0) {
            setDurationInFrames(parsedDuration);
          }
        }
      }
    }
    // Reset conversation flag when streaming starts
    if (isStreaming) {
      lastResponseWasConversationRef.current = false;
    }
  }, [isStreaming, compileCode, markAsAiGenerated]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      setHasGeneratedOnce(true);

      // Parse durationInFrames from AI-generated code
      // Parse during streaming AND after follow-up edits (non-streaming)
      if (!durationParam) {
        // Strategy 1: Find all durationInFrames values and sum Series.Sequence durations
        const allDurations = Array.from(newCode.matchAll(/durationInFrames\s*[=:]\s*(\d+)/g))
          .map(m => parseInt(m[1], 10))
          .filter(d => d > 0);

        if (allDurations.length > 0) {
          // If code uses <Series> or <Series.Sequence>, sum all sequence durations
          const usesSeries = newCode.includes("Series.Sequence") || newCode.includes("<Series>");
          let parsedDuration: number;

          if (usesSeries && allDurations.length > 1) {
            // Sum all Series.Sequence durations
            parsedDuration = allDurations.reduce((sum, d) => sum + d, 0);
          } else {
            // Use the largest value (likely the total composition duration)
            parsedDuration = Math.max(...allDurations);
          }

          if (parsedDuration > 0 && parsedDuration !== durationInFrames) {
            setDurationInFrames(parsedDuration);
          }
        }
      }

      // Mark as manual edit if not streaming (user typing)
      if (!isStreamingRef.current) {
        markManualEdit(newCode);
        markAsUserEdited();
      }

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Skip compilation while streaming - will compile when streaming ends
      if (isStreamingRef.current) {
        return;
      }

      // Set new debounce
      debounceRef.current = setTimeout(() => {
        compileCode(newCode);
      }, 500);
    },
    [setCode, compileCode, markManualEdit, markAsUserEdited],
  );

  // Handle message sent for history
  const handleMessageSent = useCallback(
    (promptText: string, attachedImages?: string[]) => {
      // Fresh user prompts should reset previous auto-correction context.
      // Silent retries do not call this callback, so their attempt count is preserved.
      setErrorCorrection(null);
      addUserMessage(promptText, attachedImages);
    },
    [addUserMessage],
  );

  // Handle generation complete for history + auto-save project
  const handleGenerationComplete = useCallback(
    (generatedCode: string, summary?: string, metadata?: AssistantMetadata) => {
      const content =
        summary || "애니메이션을 생성했습니다. 추가 수정이 필요하신가요?";
      addAssistantMessage(content, generatedCode, metadata);
      markAsAiGenerated();

      // Auto-save disabled — localStorage quota issues + not useful yet
      // TODO: re-enable when server-side storage is implemented
    },
    [
      addAssistantMessage,
      markAsAiGenerated,
      currentProjectId,
      durationInFrames,
      fps,
      voiceAudioUrl,
      initialPrompt,
      initialModel,
      aspectRatioParam,
    ],
  );

  // Handle conversation response (AI replied with text, not code)
  const handleConversationResponse = useCallback(
    (text: string, metadata?: AssistantMetadata) => {
      lastResponseWasConversationRef.current = true;
      addAssistantMessage(text, "", metadata);
    },
    [addAssistantMessage],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleStreamingChange = useCallback((streaming: boolean) => {
    setIsStreaming(streaming);
    // Clear transient errors when starting a new generation.
    // Do NOT clear errorCorrection here: silent auto-correction retries need
    // to keep their accumulated attempt count across generations.
    if (streaming) {
      setGenerationError(null);
      setRuntimeError(null);
    }
  }, []);

  const handleError = useCallback(
    (
      message: string,
      type: GenerationErrorType,
      failedEdit?: EditOperation,
    ) => {
      setGenerationError({ message, type, failedEdit });
    },
    [],
  );

  // Handle runtime errors from the Player (e.g., "cannot access variable before initialization")
  const handleRuntimeError = useCallback((errorMessage: string) => {
    // Set runtime error - this will be combined with compilation errors via codeError
    // The useAutoCorrection hook will pick this up via the compilationError prop
    setRuntimeError(errorMessage);
  }, []);

  // Auto-trigger generation if prompt came from URL
  useEffect(() => {
    if (initialPrompt && !hasAutoStarted && chatSidebarRef.current) {
      setHasAutoStarted(true);
      // Check for initial attached images from sessionStorage
      const storedImagesJson = sessionStorage.getItem("initialAttachedImages");
      let storedImages: string[] | undefined;
      if (storedImagesJson) {
        try {
          storedImages = JSON.parse(storedImagesJson);
        } catch {
          // Ignore parse errors
        }
        sessionStorage.removeItem("initialAttachedImages");
      }
      setTimeout(() => {
        chatSidebarRef.current?.triggerGeneration({
          attachedImages: storedImages,
        });
      }, 100);
    }
  }, [initialPrompt, hasAutoStarted]);

  return (
    <PageLayout showLogoAsLink>
      <div className="flex-1 flex flex-col min-[1000px]:flex-row min-w-0 overflow-hidden">
        {/* Chat History Sidebar */}
        <ChatSidebar
          ref={chatSidebarRef}
          messages={messages}
          pendingMessage={pendingMessage}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          hasManualEdits={hasManualEdits}
          // Generation props for embedded input
          onCodeGenerated={handleCodeChange}
          onStreamingChange={handleStreamingChange}
          onStreamPhaseChange={setStreamPhase}
          onError={handleError}
          prompt={prompt}
          onPromptChange={setPrompt}
          currentCode={code}
          conversationHistory={getFullContext()}
          previouslyUsedSkills={getPreviouslyUsedSkills()}
          isFollowUp={hasGeneratedCode && !isFirstGeneration}
          onMessageSent={handleMessageSent}
          onGenerationComplete={handleGenerationComplete}
          onConversationResponse={handleConversationResponse}
          onErrorMessage={addErrorMessage}
          errorCorrection={errorCorrection ?? undefined}
          onPendingMessage={setPendingMessage}
          onClearPendingMessage={clearPendingMessage}
          // Frame capture props
          Component={Component}
          fps={fps}
          durationInFrames={durationInFrames}
          currentFrame={currentFrame}
          // Video dimensions
          compositionWidth={compositionWidth}
          compositionHeight={compositionHeight}
          aspectRatio={aspectRatioParam}
          initialModel={initialModel as import("../../types/generation").ModelId}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 pr-12 pb-8 overflow-hidden">
          <TabPanel
            codeContent={
              <CodeEditor
                code={hasGeneratedOnce && !generationError ? code : ""}
                onChange={handleCodeChange}
                isStreaming={isStreaming}
                streamPhase={streamPhase}
              />
            }
            previewContent={
              templateSlides || motionScenes || templateLoading ? (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
                  {templateLoading ? (
                    <div style={{ color: "#888", fontSize: 14 }}>생성 중...</div>
                  ) : templateSlides ? (
                    <div style={{ width: "100%", maxWidth: 480, aspectRatio: "4/5" }}>
                      <Player
                        component={CardNewsTemplate}
                        inputProps={{ slides: templateSlides }}
                        durationInFrames={templateSlides.length * 90}
                        fps={30}
                        compositionWidth={1080}
                        compositionHeight={1350}
                        style={{ width: "100%", height: "100%" }}
                        controls
                        loop
                        autoPlay
                      />
                    </div>
                  ) : motionScenes ? (
                    <div style={{ width: "100%", maxWidth: 640, aspectRatio: "9/16" }}>
                      <Player
                        component={MotionTemplate}
                        inputProps={{ scenes: motionScenes }}
                        durationInFrames={motionScenes.length * 150}
                        fps={30}
                        compositionWidth={1080}
                        compositionHeight={1920}
                        style={{ width: "100%", height: "100%" }}
                        controls
                        loop
                        autoPlay
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
              <AnimationPlayer
                Component={generationError ? null : Component}
                durationInFrames={durationInFrames}
                fps={fps}
                onDurationChange={setDurationInFrames}
                onFpsChange={setFps}
                isCompiling={isCompiling}
                isStreaming={isStreaming}
                error={generationError?.message || codeError}
                errorType={generationError?.type || "compilation"}
                code={code}
                onRuntimeError={handleRuntimeError}
                onFrameChange={setCurrentFrame}
                compositionWidth={compositionWidth}
                compositionHeight={compositionHeight}
                audioSrc={voiceAudioUrl}
              />
              )
            }
          />
        </div>
      </div>

      {/* Template save button */}
      {hasGeneratedOnce && !generationError && !isStreaming && code && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={() => {
              const name = window.prompt("템플릿 이름을 입력하세요:", "카드뉴스 템플릿");
              if (!name) return;
              saveTemplate({
                name,
                description: initialPrompt?.slice(0, 100) || "커스텀 템플릿",
                code,
                aspectRatio: aspectRatioParam,
                durationInFrames,
                fps,
              });
              alert("템플릿이 저장되었습니다! /cardnews에서 사용할 수 있습니다.");
            }}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500 transition-all"
          >
            📦 템플릿으로 저장
          </button>
        </div>
      )}

      {/* Audio is now embedded in the Remotion composition via AudioWrapper */}
    </PageLayout>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-foreground" />
    </div>
  );
}

const GeneratePage: NextPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GeneratePageContent />
    </Suspense>
  );
};

export default GeneratePage;
