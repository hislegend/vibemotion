"use client";

import { LandingPageInput } from "@/components/LandingPageInput";
import { PageLayout } from "@/components/PageLayout";
import {
  examples,
  type RemotionExample,
} from "@/examples/code";
import { generateRemotionPrompt } from "@/lib/generate-prompt";
import { generateNarrationScript } from "@/lib/generate-script";
import {
  deleteProject,
  getProjects,
  renameProject,
  type Project,
} from "@/lib/project-storage";
import type { AspectRatioId, ModelId } from "@/types/generation";
import { X } from "lucide-react";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─── types ─── */

interface ContentAnalysis {
  title: string;
  summary: string;
  dataPoints: { label: string; value: string; unit?: string }[];
  entities: { name: string; type: string }[];
  tone: string;
  suggestedDuration: number;
  category: string;
  keywords: string[];
}

interface StyleResult {
  style: string;
  score: number;
  reason: string;
}

/* ─── constants ─── */

const STYLE_LABELS: Record<string, string> = {
  infographic: "📊 데이터 모션",
  presenter: "🎤 프레젠터",
  cinematic: "🎬 시네마틱",
  showcase: "📱 제품 쇼케이스",
  social: "⚡ SNS 숏폼",
};

const DURATION_OPTIONS = [
  { label: "8초", value: 8 },
  { label: "15초", value: 15 },
  { label: "30초", value: 30 },
  { label: "60초", value: 60 },
];

const VOICE_OPTIONS = [
  { label: "Adam (남성, 깊은)", voiceId: "pNInz6obpgDQGcFmaJgB" },
  { label: "Rachel (여성, 따뜻한)", voiceId: "21m00Tcm4TlvDq8ikWAM" },
  { label: "Antoni (남성, 부드러운)", voiceId: "ErXwobaYiN019PkySvjV" },
  { label: "Bella (여성, 밝은)", voiceId: "EXAVITQu4vr4xnSDxMaL" },
];

/* ─── tier config ─── */

interface TierConfig {
  label: string;
  emoji: string;
  ids: string[];
}

const tiers: TierConfig[] = [
  {
    label: "Snack (5-10s)",
    emoji: "⚡",
    ids: [
      "brand-intro",
      "progress-bar",
      "text-rotation",
      "typewriter-highlight",
      "word-carousel",
      "animated-shapes",
    ],
  },
  {
    label: "Reels (15-30s)",
    emoji: "📱",
    ids: [
      "app-promo-finance",
      "app-promo-social",
      "app-promo-fitness",
      "testimonial-card",
    ],
  },
  {
    label: "Short (30-50s)",
    emoji: "🎬",
    ids: [
      "product-launch",
      "data-showcase",
      "gold-price-chart",
      "histogram",
      "falling-spheres",
    ],
  },
];

const categoryEmoji: Record<RemotionExample["category"], string> = {
  Text: "✍️",
  Charts: "📊",
  Animation: "🎨",
  "3D": "🧊",
  Other: "✨",
};

function formatDuration(durationInFrames: number, fps: number): string {
  const seconds = Math.round(durationInFrames / fps);
  return `${seconds}s`;
}

/* ─── small components ─── */

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function AnalysisCard({ analysis }: { analysis: ContentAnalysis }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/50 p-5 space-y-3">
      <h2 className="text-lg font-bold text-foreground">{analysis.title}</h2>
      <p className="text-sm text-muted-foreground">{analysis.summary}</p>
      {analysis.dataPoints.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">데이터 포인트</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.dataPoints.map((dp, i) => (
              <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {dp.label}: {dp.value}{dp.unit ? ` ${dp.unit}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}
      {analysis.entities.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">주요 엔티티</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.entities.map((e, i) => (
              <span key={i} className="rounded-full bg-accent px-3 py-1 text-xs text-foreground">
                {e.name}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {analysis.keywords.map((kw) => (
          <span key={kw} className="text-xs text-muted-foreground">#{kw}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Template components ─── */

function SmartCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-left transition-all hover:border-primary/60 hover:bg-primary/10"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg">🧠</span>
        <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
          AI 분석
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          스마트 분석
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          텍스트나 URL을 AI가 분석하고 최적의 영상을 만듭니다
        </p>
      </div>
    </button>
  );
}

function TemplateCard({
  example,
  onClick,
}: {
  example: RemotionExample;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-secondary/50 p-4 text-left transition-all hover:border-primary/40 hover:bg-secondary"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg">{categoryEmoji[example.category]}</span>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {formatDuration(example.durationInFrames, example.fps)}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {example.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {example.description}
        </p>
      </div>
    </button>
  );
}

function TemplateGallery({
  onSelect,
  onSmartClick,
}: {
  onSelect: (example: RemotionExample) => void;
  onSmartClick: () => void;
}) {
  const [activeTier, setActiveTier] = useState(0);
  const exampleMap = new Map(examples.map((e) => [e.id, e]));
  const tieredExamples = tiers.map((tier) => ({
    ...tier,
    examples: tier.ids
      .map((id) => exampleMap.get(id))
      .filter((e): e is RemotionExample => e !== undefined),
  }));

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-16">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-foreground">템플릿으로 시작하기</h2>
        <p className="mt-1 text-sm text-muted-foreground">AI가 원하는 대로 커스터마이징해줍니다</p>
      </div>

      {/* Tier tabs */}
      <div className="mb-6 flex justify-center gap-2">
        {tieredExamples.map((tier, i) => (
          <button
            key={tier.label}
            type="button"
            onClick={() => setActiveTier(i)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeTier === i
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {tier.emoji} {tier.label}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {activeTier === 0 && (
          <SmartCard onClick={onSmartClick} />
        )}
        {tieredExamples[activeTier].examples.map((example) => (
          <TemplateCard
            key={example.id}
            example={example}
            onClick={() => onSelect(example)}
          />
        ))}
      </div>
    </section>
  );
}

/* ─── Smart Inline Flow ─── */

type SmartStep = "input" | "analyzing" | "result";

function SmartInlineFlow({
  initialPrompt,
  onBack,
  onNavigating,
}: {
  initialPrompt: string;
  onBack: () => void;
  onNavigating: () => void;
}) {
  const router = useRouter();
  const [input, setInput] = useState(initialPrompt);
  const [step, setStep] = useState<SmartStep>("input");
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [styles, setStyles] = useState<StyleResult[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState("");

  // Voice state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [narrationScript, setNarrationScript] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState(VOICE_OPTIONS[0].voiceId);
  const [generatingVoice, setGeneratingVoice] = useState(false);

  const isUrl = input.startsWith("http://") || input.startsWith("https://");

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setError("");
    setStep("analyzing");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          inputType: isUrl ? "url" : "text",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "분석 실패");
      }

      const data: ContentAnalysis = await res.json();
      setAnalysis(data);
      setDuration(data.suggestedDuration);

      // Auto-fetch styles
      const styleRes = await fetch("/api/route-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (styleRes.ok) {
        const styleData = await styleRes.json();
        setStyles(styleData.styles);
        setSelectedStyle(styleData.styles[0]?.style || null);
      }

      // Generate narration script
      const script = generateNarrationScript(data, styles[0]?.style || "cinematic", data.suggestedDuration);
      setNarrationScript(script);

      setStep("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setStep("input");
    }
  };

  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    if (analysis) {
      setNarrationScript(generateNarrationScript(analysis, style, duration));
    }
  };

  const handleDurationChange = (d: number) => {
    setDuration(d);
    if (analysis && selectedStyle) {
      setNarrationScript(generateNarrationScript(analysis, selectedStyle, d));
    }
  };

  const handleGenerate = async () => {
    if (!analysis || !selectedStyle) return;

    let voicePromptAddition = "";
    let finalDuration = duration;

    if (voiceEnabled && narrationScript.trim()) {
      setGeneratingVoice(true);
      try {
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: narrationScript.trim(),
            voiceId: selectedVoiceId,
          }),
        });
        if (ttsRes.ok) {
          const audioBlob = await ttsRes.blob();
          // Get audio duration
          const audioBlobUrl = URL.createObjectURL(audioBlob);
          const audioDuration = await new Promise<number>((resolve) => {
            const audio = new Audio(audioBlobUrl);
            audio.addEventListener("loadedmetadata", () => {
              resolve(Math.ceil(audio.duration));
              URL.revokeObjectURL(audioBlobUrl);
            });
            audio.addEventListener("error", () => {
              resolve(duration); // fallback to selected duration
              URL.revokeObjectURL(audioBlobUrl);
            });
          });
          // Override duration to match voice length (add 2s buffer for intro/outro)
          const voiceDuration = audioDuration + 2;
          setDuration(voiceDuration);
          // Convert blob to base64 data URL (persists across page navigation)
          const reader = new FileReader();
          const audioDataUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(audioBlob);
          });
          sessionStorage.setItem("voiceAudio", audioDataUrl);
          voicePromptAddition = `\n\nThis video has ${voiceDuration}초 narration audio. The video duration MUST be exactly ${voiceDuration} seconds (${voiceDuration * 30} frames at 30fps). Distribute scenes evenly across the narration. Sync scene transitions with the narration timing.\n\nNarration script:\n${narrationScript.trim()}`;
          // Use voice duration for the URL params
          finalDuration = voiceDuration;
        }
      } catch {
        // TTS 실패 시 음성 없이 진행
      } finally {
        setGeneratingVoice(false);
      }
    }

    const prompt = generateRemotionPrompt(analysis, selectedStyle, finalDuration) + voicePromptAddition;
    const params = new URLSearchParams({
      prompt,
      model: "claude-sonnet-4-6",
      aspectRatio: "9:16",
      duration: String(finalDuration),
      ...(voiceEnabled ? { voice: "true" } : {}),
    });
    onNavigating();
    router.push(`/generate?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← 돌아가기
      </button>

      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">🧠 스마트 분석</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          텍스트나 URL을 입력하면 AI가 분석하고 최적의 영상 스타일을 추천합니다
        </p>
      </div>

      {/* Step 1: Input */}
      {(step === "input" || step === "analyzing") && (
        <div className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="텍스트 또는 URL을 입력하세요"
            rows={6}
            disabled={step === "analyzing"}
            className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none resize-none disabled:opacity-50"
          />
          {isUrl && (
            <p className="text-xs text-primary">
              🔗 URL이 감지되었습니다. 웹 페이지 내용을 자동으로 가져옵니다.
            </p>
          )}
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!input.trim() || step === "analyzing"}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {step === "analyzing" ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner /> 분석 중...
              </span>
            ) : (
              "분석하기"
            )}
          </button>
        </div>
      )}

      {/* Steps 2-5: Results + Style + Duration + Voice + Generate */}
      {step === "result" && analysis && (
        <div className="space-y-6">
          {/* Analysis result */}
          <AnalysisCard analysis={analysis} />

          {/* Style picker */}
          {styles.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">추천 스타일</h3>
              <div className="grid gap-3">
                {styles.map((s) => (
                  <button
                    key={s.style}
                    type="button"
                    onClick={() => handleStyleSelect(s.style)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      selectedStyle === s.style
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/50 hover:border-primary/40"
                    }`}
                  >
                    <span className="text-2xl">{STYLE_LABELS[s.style]?.split(" ")[0]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {STYLE_LABELS[s.style] || s.style}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {s.score}점
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration selector */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">영상 길이</h3>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleDurationChange(opt.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    duration === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice / TTS */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setVoiceEnabled((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  voiceEnabled ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    voiceEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-semibold text-foreground">🔊 음성 추가</span>
            </div>

            {voiceEnabled && (
              <div className="space-y-3 rounded-xl border border-border bg-secondary/30 p-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    음성 선택
                  </label>
                  <select
                    value={selectedVoiceId}
                    onChange={(e) => setSelectedVoiceId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    {VOICE_OPTIONS.map((v) => (
                      <option key={v.voiceId} value={v.voiceId}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    내레이션 스크립트 (수정 가능)
                  </label>
                  <textarea
                    value={narrationScript}
                    onChange={(e) => setNarrationScript(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-primary/60 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep("input");
                setAnalysis(null);
                setStyles([]);
              }}
              className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              다시 분석
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!selectedStyle || generatingVoice}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {generatingVoice ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> 음성 생성 중...
                </span>
              ) : (
                "🎬 영상 만들기"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Relative time ─── */

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "어제";
  if (day < 30) return `${day}일 전`;
  const mon = Math.floor(day / 30);
  return `${mon}개월 전`;
}

/* ─── Project History ─── */

function ProjectCard({
  project,
  onClick,
  onDelete,
  onRename,
}: {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const commitRename = () => {
    const t = editTitle.trim();
    if (t && t !== project.title) onRename(t);
    setIsEditing(false);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col gap-2 rounded-xl border border-border bg-secondary/50 p-4 text-left transition-all hover:border-primary/40 hover:bg-secondary"
    >
      {/* Delete */}
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          if (confirm("이 프로젝트를 삭제할까요?")) onDelete();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            if (confirm("이 프로젝트를 삭제할까요?")) onDelete();
          }
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
      >
        <X className="w-3.5 h-3.5" />
      </span>

      {/* Title */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setIsEditing(false);
          }}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-semibold text-foreground bg-transparent border-b border-primary outline-none w-full"
        />
      ) : (
        <h3
          className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1"
          onDoubleClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setEditTitle(project.title);
            setIsEditing(true);
          }}
          title="더블클릭으로 이름 변경"
        >
          {project.title}
        </h3>
      )}

      {/* Meta */}
      <p className="text-xs text-muted-foreground line-clamp-1">
        {project.prompt.slice(0, 60)}
      </p>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {project.duration}s
        </span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
          {project.aspectRatio}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {relativeTime(project.updatedAt)}
        </span>
      </div>
    </button>
  );
}

function ProjectHistory() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  if (projects.length === 0) return null;

  const visible = showAll ? projects : projects.slice(0, 12);

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-16">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-foreground">📁 내 프로젝트</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          이전에 만든 영상을 이어서 수정할 수 있습니다
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => router.push(`/generate?project=${project.id}`)}
            onDelete={() => {
              deleteProject(project.id);
              setProjects((prev) => prev.filter((p) => p.id !== project.id));
            }}
            onRename={(title) => {
              renameProject(project.id, title);
              setProjects((prev) =>
                prev.map((p) => (p.id === project.id ? { ...p, title } : p)),
              );
            }}
          />
        ))}
      </div>

      {!showAll && projects.length > 12 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-sm text-primary hover:underline"
          >
            더보기 ({projects.length - 12}개)
          </button>
        </div>
      )}
    </section>
  );
}

/* ─── Main page ─── */

const Home: NextPage = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [prefillPrompt, setPrefillPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<RemotionExample | null>(null);
  const [mode, setMode] = useState<"normal" | "smart">("normal");

  const handleNavigate = useCallback(
    (
      prompt: string,
      model: ModelId,
      aspectRatio: AspectRatioId,
      attachedImages?: string[],
    ) => {
      setIsNavigating(true);
      if (attachedImages && attachedImages.length > 0) {
        sessionStorage.setItem("initialAttachedImages", JSON.stringify(attachedImages));
      } else {
        sessionStorage.removeItem("initialAttachedImages");
      }
      if (selectedTemplate) {
        sessionStorage.setItem("templateCode", selectedTemplate.code);
      }
      const params = new URLSearchParams({ prompt, model, aspectRatio });
      router.push(`/generate?${params.toString()}`);
    },
    [router, selectedTemplate],
  );

  const handleTemplateSelect = (example: RemotionExample) => {
    setSelectedTemplate(example);
    setPrefillPrompt(`"${example.name}" 템플릿 기반으로: `);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSmartClick = () => {
    setMode("smart");
    setSelectedTemplate(null);
    setPrefillPrompt("");
  };

  const handleBackToNormal = () => {
    setMode("normal");
  };

  return (
    <PageLayout>
      <LandingPageInput
        onNavigate={handleNavigate}
        isNavigating={isNavigating}
        showCodeExamplesLink={mode === "normal"}
        prefillPrompt={prefillPrompt}
        onPrefillConsumed={() => setPrefillPrompt("")}
      />

      {mode === "normal" && (
        <>
          <TemplateGallery
            onSelect={handleTemplateSelect}
            onSmartClick={handleSmartClick}
          />
          <ProjectHistory />
        </>
      )}

      {mode === "smart" && (
        <SmartInlineFlow
          initialPrompt=""
          onBack={handleBackToNormal}
          onNavigating={() => setIsNavigating(true)}
        />
      )}
    </PageLayout>
  );
};

export default Home;
