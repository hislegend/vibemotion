"use client";

import { stripSceneMarkers } from "@/lib/strip-scene-markers";
import { generateRemotionPrompt } from "@/lib/generate-prompt";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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

interface ScriptVersion {
  label: string;
  script: string;
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
  { label: "Rachel (여성, 따뜻한)", voiceId: "21m00Tcm4TlvDq8ikWAM" },
  { label: "Adam (남성, 깊은)", voiceId: "pNInz6obpgDQGcFmaJgB" },
  { label: "Antoni (남성, 부드러운)", voiceId: "ErXwobaYiN019PkySvjV" },
  { label: "Bella (여성, 밝은)", voiceId: "EXAVITQu4vr4xnSDxMaL" },
];

/* ─── small components ─── */

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function getPreviewLines(script: string, count = 3): string {
  const lines = script.split("\n").filter((l) => l.trim() && !l.trim().startsWith("["));
  return lines.slice(0, count).join("\n");
}

/* ─── page ─── */

export default function SmartResultPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [styles, setStyles] = useState<StyleResult[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [scriptVersions, setScriptVersions] = useState<ScriptVersion[]>([]);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState<number | null>(null);
  const [editedScript, setEditedScript] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState(VOICE_OPTIONS[0].voiceId);
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [scriptFetched, setScriptFetched] = useState(false);

  const fetchScript = useCallback(async (data: ContentAnalysis) => {
    setGeneratingScript(true);
    setScriptFetched(false);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: data }),
      });
      if (res.ok) {
        const json = await res.json();
        const versions: ScriptVersion[] = json.versions || [];
        setScriptVersions(versions);
        if (versions.length > 0) {
          setSelectedVersionIdx(0);
          setEditedScript(versions[0].script);
        }
        setScriptFetched(true);
      }
    } catch {
      // 실패 시 빈 스크립트 유지
    } finally {
      setGeneratingScript(false);
    }
  }, []);

  // Load data from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("smartAnalysis");
      const rawStyles = sessionStorage.getItem("smartStyles");
      const rawVoice = sessionStorage.getItem("smartVoiceEnabled");
      if (!raw) {
        router.replace("/");
        return;
      }
      const data: ContentAnalysis = JSON.parse(raw);
      setAnalysis(data);
      setDuration(data.suggestedDuration);

      const isVoice = rawVoice ? JSON.parse(rawVoice) === true : false;
      setVoiceEnabled(isVoice);

      if (rawStyles) {
        const parsed: StyleResult[] = JSON.parse(rawStyles);
        setStyles(parsed);
        const first = parsed[0]?.style || "cinematic";
        setSelectedStyle(first);

        // Voice ON: auto-fetch scripts after loading
        if (isVoice) {
          fetchScript(data);
        }
      }
    } catch {
      router.replace("/");
    }
  }, [router, fetchScript]);

  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
  };

  const handleVersionSelect = (idx: number) => {
    setSelectedVersionIdx(idx);
    setEditedScript(scriptVersions[idx].script);
  };

  const handleGenerate = async () => {
    if (!analysis || !selectedStyle) return;

    let voicePromptAddition = "";
    let finalDuration = duration;

    if (voiceEnabled && editedScript.trim()) {
      setGeneratingVoice(true);
      try {
        const ttsText = stripSceneMarkers(editedScript);
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: ttsText,
            voiceId: selectedVoiceId,
          }),
        });
        if (ttsRes.ok) {
          const audioBlob = await ttsRes.blob();
          const audioBlobUrl = URL.createObjectURL(audioBlob);
          const audioDuration = await new Promise<number>((resolve) => {
            const audio = new Audio(audioBlobUrl);
            audio.addEventListener("loadedmetadata", () => {
              resolve(Math.ceil(audio.duration));
              URL.revokeObjectURL(audioBlobUrl);
            });
            audio.addEventListener("error", () => {
              resolve(duration);
              URL.revokeObjectURL(audioBlobUrl);
            });
          });
          const voiceDuration = audioDuration + 2;
          finalDuration = voiceDuration;
          const reader = new FileReader();
          const audioDataUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(audioBlob);
          });
          sessionStorage.setItem("voiceAudio", audioDataUrl);
          voicePromptAddition = `\n\nThis video has ${voiceDuration}초 narration audio. The video duration MUST be exactly ${voiceDuration} seconds (${voiceDuration * 30} frames at 30fps). Distribute scenes evenly across the narration. Sync scene transitions with the narration timing.\n\nNarration script:\n${editedScript.trim()}`;
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
    router.push(`/generate?${params.toString()}`);
  };

  if (!analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 pb-24 space-y-8">
        {/* Header */}
        <div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
          >
            ← 다시 입력
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            📋 콘텐츠 분석 결과
            {voiceEnabled && (
              <span className="ml-2 text-base font-normal text-primary">🔊 음성 모드</span>
            )}
          </h1>
        </div>

        {/* Analysis Card */}
        <div className="rounded-xl border border-border bg-secondary/50 p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">{analysis.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>

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

        {/* Style Picker */}
        {styles.length > 0 && (
          <div>
            <h3 className="mb-4 text-base font-semibold text-foreground">🎨 추천 스타일</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {styles.map((s) => (
                <button
                  key={s.style}
                  type="button"
                  onClick={() => handleStyleSelect(s.style)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                    selectedStyle === s.style
                      ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                      : "border-border bg-secondary/50 hover:border-primary/40"
                  }`}
                >
                  <span className="text-2xl">{STYLE_LABELS[s.style]?.split(" ")[0]}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {STYLE_LABELS[s.style] || s.style}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {s.score}점
                  </span>
                  <p className="text-xs text-muted-foreground leading-snug">{s.reason}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── FLOW A: Voice OFF ─── */}
        {!voiceEnabled && (
          <>
            <div>
              <h3 className="mb-4 text-base font-semibold text-foreground">⏱ 영상 길이</h3>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
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

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!selectedStyle}
              className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              🎬 영상 만들기
            </button>
          </>
        )}

        {/* ─── FLOW B: Voice ON ─── */}
        {voiceEnabled && (
          <>
            {/* Script generating spinner */}
            {generatingScript && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Spinner className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">📝 대본을 생성하고 있습니다...</p>
              </div>
            )}

            {/* Script version picker */}
            {!generatingScript && scriptFetched && scriptVersions.length > 0 && (
              <div>
                <h3 className="mb-4 text-base font-semibold text-foreground">📝 대본 선택</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {scriptVersions.map((ver, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleVersionSelect(idx)}
                      className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
                        selectedVersionIdx === idx
                          ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                          : "border-border bg-secondary/50 hover:border-primary/40"
                      }`}
                    >
                      <span className="text-sm font-semibold text-foreground">{ver.label}</span>
                      <p className="text-xs text-muted-foreground leading-snug line-clamp-3 whitespace-pre-line">
                        {getPreviewLines(ver.script)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Editable script textarea */}
            {!generatingScript && scriptFetched && selectedVersionIdx !== null && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  ✏️ 대본 수정
                </label>
                <textarea
                  value={editedScript}
                  onChange={(e) => setEditedScript(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-primary/60 focus:outline-none"
                />
              </div>
            )}

            {/* Voice selector */}
            {!generatingScript && scriptFetched && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  🔊 음성 선택
                </label>
                <select
                  value={selectedVoiceId}
                  onChange={(e) => setSelectedVoiceId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground"
                >
                  {VOICE_OPTIONS.map((v) => (
                    <option key={v.voiceId} value={v.voiceId}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Generate button */}
            {!generatingScript && scriptFetched && (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!selectedStyle || generatingVoice || !editedScript.trim()}
                className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {generatingVoice ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> 음성 생성 중...
                  </span>
                ) : (
                  "🎬 영상 만들기"
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
