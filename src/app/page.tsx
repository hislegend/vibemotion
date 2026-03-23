"use client";

import { LandingPageInput } from "@/components/LandingPageInput";
import { PageLayout } from "@/components/PageLayout";
import {
  examples,
  type RemotionExample,
} from "@/examples/code";
import { generateRemotionPrompt } from "@/lib/generate-prompt";
import { generateNarrationScript } from "@/lib/generate-script";
import type { AspectRatioId, ModelId } from "@/types/generation";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

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

function SmartCard({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col gap-3 rounded-xl border p-4 text-left transition-all ${
        active
          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
          : "border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10"
      }`}
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
  smartMode,
  onSmartClick,
}: {
  onSelect: (example: RemotionExample) => void;
  smartMode: boolean;
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
        {/* Smart Analysis card as first in Snack tier */}
        {activeTier === 0 && (
          <SmartCard active={smartMode} onClick={onSmartClick} />
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

/* ─── Smart Analysis Modal ─── */

function SmartAnalysisModal({
  analysis,
  styles,
  selectedStyle,
  onSelectStyle,
  duration,
  onDurationChange,
  voiceEnabled,
  onVoiceToggle,
  narrationScript,
  onNarrationChange,
  selectedVoiceId,
  onVoiceIdChange,
  onGenerate,
  onClose,
  generating,
}: {
  analysis: ContentAnalysis;
  styles: StyleResult[];
  selectedStyle: string | null;
  onSelectStyle: (style: string) => void;
  duration: number;
  onDurationChange: (d: number) => void;
  voiceEnabled: boolean;
  onVoiceToggle: () => void;
  narrationScript: string;
  onNarrationChange: (s: string) => void;
  selectedVoiceId: string;
  onVoiceIdChange: (id: string) => void;
  onGenerate: () => void;
  onClose: () => void;
  generating: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background p-6 space-y-6 shadow-2xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors text-lg"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-foreground">🧠 스마트 분석 결과</h2>

        {/* Analysis */}
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
                  onClick={() => onSelectStyle(s.style)}
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

        {/* Duration */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">영상 길이</h3>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onDurationChange(opt.value)}
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
              onClick={onVoiceToggle}
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
              {/* Voice selector */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  음성 선택
                </label>
                <select
                  value={selectedVoiceId}
                  onChange={(e) => onVoiceIdChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  {VOICE_OPTIONS.map((v) => (
                    <option key={v.voiceId} value={v.voiceId}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Script preview */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  내레이션 스크립트 (수정 가능)
                </label>
                <textarea
                  value={narrationScript}
                  onChange={(e) => onNarrationChange(e.target.value)}
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
            onClick={onClose}
            className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={!selectedStyle || generating}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner /> 준비 중...
              </span>
            ) : (
              "영상 만들기"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */

const Home: NextPage = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [prefillPrompt, setPrefillPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<RemotionExample | null>(null);
  const [smartMode, setSmartMode] = useState(false);

  // Smart analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [styles, setStyles] = useState<StyleResult[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [smartDuration, setSmartDuration] = useState(30);
  const [showModal, setShowModal] = useState(false);

  // Voice/TTS state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [narrationScript, setNarrationScript] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState(VOICE_OPTIONS[0].voiceId);
  const [generatingVoice, setGeneratingVoice] = useState(false);

  const handleSmartToggle = useCallback(() => {
    setSmartMode((prev) => {
      if (!prev) {
        // 스마트 모드 활성화 시 템플릿 선택 해제
        setSelectedTemplate(null);
        setPrefillPrompt("");
      }
      return !prev;
    });
  }, []);

  const handleNavigate = async (
    prompt: string,
    model: ModelId,
    aspectRatio: AspectRatioId,
    attachedImages?: string[],
  ) => {
    if (smartMode) {
      // 스마트 모드: 분석 먼저
      if (!prompt.trim()) return;
      setAnalyzing(true);
      try {
        const isUrl = prompt.trim().startsWith("http://") || prompt.trim().startsWith("https://");
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: prompt.trim(),
            inputType: isUrl ? "url" : "text",
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "분석 실패");
        }
        const data: ContentAnalysis = await res.json();
        setAnalysis(data);
        setSmartDuration(data.suggestedDuration);

        // 스타일 추천
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

        // 내레이션 스크립트 자동 생성
        const script = generateNarrationScript(data, styles[0]?.style || "cinematic", data.suggestedDuration);
        setNarrationScript(script);

        setShowModal(true);
      } catch {
        // 분석 실패 시 일반 모드로 fallback
        setIsNavigating(true);
        if (attachedImages && attachedImages.length > 0) {
          sessionStorage.setItem("initialAttachedImages", JSON.stringify(attachedImages));
        } else {
          sessionStorage.removeItem("initialAttachedImages");
        }
        const params = new URLSearchParams({ prompt, model, aspectRatio });
        router.push(`/generate?${params.toString()}`);
      } finally {
        setAnalyzing(false);
      }
      return;
    }

    // 일반 모드
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
  };

  const handleModalGenerate = async () => {
    if (!analysis || !selectedStyle) return;

    let voicePromptAddition = "";

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
          const audioUrl = URL.createObjectURL(audioBlob);
          sessionStorage.setItem("voiceAudio", audioUrl);
          voicePromptAddition = "\n\nThis video has narration audio. Sync scene transitions with the narration timing.";
        }
      } catch {
        // TTS 실패 시 음성 없이 진행
      } finally {
        setGeneratingVoice(false);
      }
    }

    const prompt = generateRemotionPrompt(analysis, selectedStyle, smartDuration) + voicePromptAddition;
    const params = new URLSearchParams({
      prompt,
      model: "claude-sonnet-4-6",
      aspectRatio: "9:16",
      duration: String(smartDuration),
      ...(voiceEnabled ? { voice: "true" } : {}),
    });
    setShowModal(false);
    setIsNavigating(true);
    router.push(`/generate?${params.toString()}`);
  };

  const handleTemplateSelect = (example: RemotionExample) => {
    setSmartMode(false);
    setSelectedTemplate(example);
    setPrefillPrompt(`"${example.name}" 템플릿 기반으로: `);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 스타일 변경 시 내레이션 스크립트 재생성
  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    if (analysis) {
      setNarrationScript(generateNarrationScript(analysis, style, smartDuration));
    }
  };

  const handleDurationChange = (d: number) => {
    setSmartDuration(d);
    if (analysis && selectedStyle) {
      setNarrationScript(generateNarrationScript(analysis, selectedStyle, d));
    }
  };

  return (
    <PageLayout>
      <LandingPageInput
        onNavigate={handleNavigate}
        isNavigating={isNavigating || analyzing}
        showCodeExamplesLink
        prefillPrompt={prefillPrompt}
        onPrefillConsumed={() => setPrefillPrompt("")}
        smartMode={smartMode}
        onSmartToggle={handleSmartToggle}
        analyzing={analyzing}
      />

      <TemplateGallery
        onSelect={handleTemplateSelect}
        smartMode={smartMode}
        onSmartClick={handleSmartToggle}
      />

      {/* Smart Analysis Modal */}
      {showModal && analysis && (
        <SmartAnalysisModal
          analysis={analysis}
          styles={styles}
          selectedStyle={selectedStyle}
          onSelectStyle={handleStyleSelect}
          duration={smartDuration}
          onDurationChange={handleDurationChange}
          voiceEnabled={voiceEnabled}
          onVoiceToggle={() => setVoiceEnabled((v) => !v)}
          narrationScript={narrationScript}
          onNarrationChange={setNarrationScript}
          selectedVoiceId={selectedVoiceId}
          onVoiceIdChange={setSelectedVoiceId}
          onGenerate={handleModalGenerate}
          onClose={() => setShowModal(false)}
          generating={generatingVoice}
        />
      )}
    </PageLayout>
  );
};

export default Home;
