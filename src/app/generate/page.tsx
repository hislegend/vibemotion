"use client";

import { Loader2 } from "lucide-react";
import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimationPlayer } from "../../components/AnimationPlayer";
import { ChatSidebar, type ChatSidebarRef } from "../../components/ChatSidebar";
import { CodeEditor } from "../../components/CodeEditor";
import { PageLayout } from "../../components/PageLayout";
import { TabPanel } from "../../components/TabPanel";
import { examples } from "../../examples/code";
import { useAnimationState } from "../../hooks/useAnimationState";
import { useAutoCorrection } from "../../hooks/useAutoCorrection";
import { useConversationState } from "../../hooks/useConversationState";
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
  const initialPrompt = searchParams.get("prompt") || "";
  const initialModel = searchParams.get("model") || undefined;
  const durationParam = searchParams.get("duration");
  const hasVoice = searchParams.get("voice") === "true";
  const aspectRatioParam = (searchParams.get("aspectRatio") ||
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
    durationParam ? Number(durationParam) * 30 : (examples[0]?.durationInFrames || 150),
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
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load voice audio from sessionStorage if available
  useEffect(() => {
    if (hasVoice) {
      const storedAudio = sessionStorage.getItem("voiceAudio");
      if (storedAudio) {
        setVoiceAudioUrl(storedAudio);
      }
    }
  }, [hasVoice]);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
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
  } = useAnimationState(examples[0]?.code || "");

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
      addUserMessage(promptText, attachedImages);
    },
    [addUserMessage],
  );

  // Handle generation complete for history
  const handleGenerationComplete = useCallback(
    (generatedCode: string, summary?: string, metadata?: AssistantMetadata) => {
      const content =
        summary || "애니메이션을 생성했습니다. 추가 수정이 필요하신가요?";
      addAssistantMessage(content, generatedCode, metadata);
      markAsAiGenerated();
    },
    [addAssistantMessage, markAsAiGenerated],
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
    // Clear errors when starting a new generation
    if (streaming) {
      setGenerationError(null);
      setRuntimeError(null);
      // Reset error correction state for fresh retry attempts
      setErrorCorrection(null);
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
              />
            }
          />
        </div>
      </div>

      {/* Voice audio player */}
      {voiceAudioUrl && (
        <div className="fixed bottom-4 right-4 z-50 bg-secondary border border-border rounded-xl p-3 shadow-lg flex items-center gap-3">
          <span className="text-sm text-muted-foreground">🔊 내레이션</span>
          <audio ref={audioRef} src={voiceAudioUrl} controls className="h-8" />
        </div>
      )}
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
