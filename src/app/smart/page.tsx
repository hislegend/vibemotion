"use client";

import { PageLayout } from "@/components/PageLayout";
import { generateRemotionPrompt } from "@/lib/generate-prompt";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

const STYLE_LABELS: Record<string, string> = {
  infographic: "📊 데이터 모션",
  presenter: "🎤 프레젠터",
  cinematic: "🎬 시네마틱",
  showcase: "📱 제품 쇼케이스",
  social: "⚡ SNS 숏폼",
};

const DURATION_OPTIONS = [
  { label: "8초", value: 8 },
  { label: "30초", value: 30 },
  { label: "60초", value: 60 },
];

type Step = "input" | "analysis" | "style";

export default function SmartPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [styles, setStyles] = useState<StyleResult[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [analyzing, setAnalyzing] = useState(false);
  const [routingStyles, setRoutingStyles] = useState(false);
  const [error, setError] = useState("");

  const isUrl =
    input.startsWith("http://") || input.startsWith("https://");

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setError("");
    setAnalyzing(true);

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
      setStep("analysis");

      // Auto-fetch styles
      setRoutingStyles(true);
      const styleRes = await fetch("/api/route-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (styleRes.ok) {
        const styleData = await styleRes.json();
        setStyles(styleData.styles);
        setSelectedStyle(styleData.styles[0]?.style || null);
        setStep("style");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
      setRoutingStyles(false);
    }
  };

  const handleGenerate = () => {
    if (!analysis || !selectedStyle) return;
    const prompt = generateRemotionPrompt(analysis, selectedStyle, duration);
    const params = new URLSearchParams({
      prompt,
      model: "claude-sonnet-4-6",
      aspectRatio: "9:16",
    });
    router.push(`/generate?${params.toString()}`);
  };

  return (
    <PageLayout showLogoAsLink>
      <div className="flex-1 flex flex-col items-center overflow-y-auto px-4 py-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              🧠 스마트 생성
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              텍스트나 URL을 입력하면 AI가 분석하고 최적의 영상 스타일을
              추천합니다
            </p>
          </div>

          {/* Step 1: Input */}
          {step === "input" && (
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="텍스트 또는 URL을 입력하세요"
                rows={6}
                className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none resize-none"
              />
              {isUrl && (
                <p className="text-xs text-primary">
                  🔗 URL이 감지되었습니다. 웹 페이지 내용을 자동으로
                  가져옵니다.
                </p>
              )}
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!input.trim() || analyzing}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {analyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> 분석 중...
                  </span>
                ) : (
                  "분석하기"
                )}
              </button>
            </div>
          )}

          {/* Step 2: Analysis result */}
          {step === "analysis" && analysis && (
            <div className="space-y-4">
              <AnalysisCard analysis={analysis} />
              {routingStyles && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                  <Spinner /> 스타일 추천 중...
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  setAnalysis(null);
                  setStyles([]);
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← 다시 분석
              </button>
            </div>
          )}

          {/* Step 3: Style picker */}
          {step === "style" && analysis && styles.length > 0 && (
            <div className="space-y-6">
              <AnalysisCard analysis={analysis} />

              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  추천 스타일
                </h3>
                <div className="grid gap-3">
                  {styles.map((s) => (
                    <button
                      key={s.style}
                      type="button"
                      onClick={() => setSelectedStyle(s.style)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                        selectedStyle === s.style
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary/50 hover:border-primary/40"
                      }`}
                    >
                      <span className="text-2xl">
                        {STYLE_LABELS[s.style]?.split(" ")[0]}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {STYLE_LABELS[s.style] || s.style}
                          </span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {s.score}점
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {s.reason}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration selector */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  영상 길이
                </h3>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDuration(opt.value)}
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
                  disabled={!selectedStyle}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  영상 만들기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

function AnalysisCard({ analysis }: { analysis: ContentAnalysis }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/50 p-5 space-y-3">
      <h2 className="text-lg font-bold text-foreground">{analysis.title}</h2>
      <p className="text-sm text-muted-foreground">{analysis.summary}</p>

      {analysis.dataPoints.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            데이터 포인트
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.dataPoints.map((dp, i) => (
              <span
                key={i}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {dp.label}: {dp.value}
                {dp.unit ? ` ${dp.unit}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.entities.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            주요 엔티티
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.entities.map((e, i) => (
              <span
                key={i}
                className="rounded-full bg-accent px-3 py-1 text-xs text-foreground"
              >
                {e.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {analysis.keywords.map((kw) => (
          <span
            key={kw}
            className="text-xs text-muted-foreground"
          >
            #{kw}
          </span>
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
