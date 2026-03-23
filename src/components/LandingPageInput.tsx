"use client";

import { ErrorDisplay } from "@/components/ErrorDisplay";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { examplePrompts } from "@/examples/prompts";
import { useImageAttachments } from "@/hooks/useImageAttachments";
import {
  ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIO,
  MODELS,
  type AspectRatioId,
  type ModelId,
} from "@/types/generation";
import {
  ArrowUp,
  BarChart3,
  Disc,
  Hash,
  MessageCircle,
  Paperclip,
  SquareArrowOutUpRight,
  Type,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const iconMap: Record<string, LucideIcon> = {
  Type,
  MessageCircle,
  Hash,
  BarChart3,
  Disc,
};

interface LandingPageInputProps {
  onNavigate: (
    prompt: string,
    model: ModelId,
    aspectRatio: AspectRatioId,
    attachedImages?: string[],
  ) => void;
  isNavigating?: boolean;
  showCodeExamplesLink?: boolean;
}

export function LandingPageInput({
  onNavigate,
  isNavigating = false,
  showCodeExamplesLink = false,
}: LandingPageInputProps) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelId>("claude-sonnet-4-6");
  const [aspectRatio, setAspectRatio] =
    useState<AspectRatioId>(DEFAULT_ASPECT_RATIO);
  const {
    attachedImages,
    isDragging,
    fileInputRef,
    removeImage,
    handleFileSelect,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    canAddMore,
    error,
    clearError,
  } = useImageAttachments();

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isNavigating) return;
    onNavigate(
      prompt,
      model,
      aspectRatio,
      attachedImages.length > 0 ? attachedImages : undefined,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (Shift+Enter for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      <h1 className="text-5xl font-bold text-white mb-10 text-center">
        어떤 영상을 만들까요?
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl">
        <div
          className={`bg-background-elevated rounded-xl border p-4 transition-colors ${
            isDragging ? "border-blue-500 bg-blue-500/10" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Error message */}
          {error && (
            <ErrorDisplay
              error={error}
              variant="inline"
              size="md"
              onDismiss={clearError}
              className="mb-3"
            />
          )}

          {/* Image previews */}
          {attachedImages.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 pt-2">
              {attachedImages.map((img, index) => (
                <div key={index} className="relative flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Attached ${index + 1}`}
                    className="h-20 w-auto rounded border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              isDragging
                ? "이미지를 여기에 놓으세요..."
                : "만들고 싶은 영상을 설명해주세요... (이미지 붙여넣기 또는 드롭)"
            }
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground-dim focus:outline-none resize-none overflow-y-auto text-base min-h-[60px] max-h-[200px]"
            style={{ fieldSizing: "content" }}
            disabled={isNavigating}
          />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <Select
                value={model}
                onValueChange={(value) => setModel(value as ModelId)}
                disabled={isNavigating}
              >
                <SelectTrigger className="w-auto bg-transparent border-none text-muted-foreground hover:text-foreground transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background-elevated border-border">
                  {MODELS.map((m) => (
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      className="text-foreground focus:bg-secondary focus:text-foreground"
                    >
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={aspectRatio}
                onValueChange={(value) =>
                  setAspectRatio(value as AspectRatioId)
                }
                disabled={isNavigating}
              >
                <SelectTrigger className="w-auto bg-transparent border-none text-muted-foreground hover:text-foreground transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background-elevated border-border">
                  {ASPECT_RATIOS.map((ar) => (
                    <SelectItem
                      key={ar.id}
                      value={ar.id}
                      className="text-foreground focus:bg-secondary focus:text-foreground"
                    >
                      {ar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isNavigating || !canAddMore}
                className="text-muted-foreground hover:text-foreground"
                title="이미지 첨부"
              >
                <Paperclip className="w-5 h-5" />
              </Button>

              <Button
                type="submit"
                size="icon-sm"
                disabled={!prompt.trim() || isNavigating}
                loading={isNavigating}
                className="bg-foreground text-background hover:bg-gray-200"
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center mt-6 gap-2">
          <span className="text-muted-foreground-dim text-xs mr-1">
            프롬프트 예시
          </span>
          {examplePrompts.map((example) => {
            const Icon = iconMap[example.icon];
            return (
              <button
                key={example.id}
                type="button"
                onClick={() => setPrompt(example.prompt)}
                style={{
                  borderColor: `${example.color}40`,
                  color: example.color,
                }}
                className="rounded-full bg-background-elevated border hover:brightness-125 transition-all flex items-center gap-1 px-1.5 py-0.5 text-[11px]"
              >
                <Icon className="w-3 h-3" />
                {example.headline}
              </button>
            );
          })}
        </div>

        {showCodeExamplesLink && (
          <div className="flex justify-center mt-4">
            <Link
              href="/code-examples"
              className="text-muted-foreground-dim hover:text-muted-foreground text-xs transition-colors flex items-center gap-1"
            >
              코드 예제 보기
              <SquareArrowOutUpRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}
