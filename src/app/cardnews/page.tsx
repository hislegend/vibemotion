"use client";

import { Player } from "@remotion/player";
import { CardNewsTemplate } from "@/remotion/CardNewsTemplate";
import { useState } from "react";

const PRESET_TOPICS = [
  "디자인 특허의 중요성",
  "AI 스타트업 성장 전략 5가지",
  "브랜드 보호를 위한 IP 전략",
  "리모트 워크 생산성 높이는 법",
];

interface SlideContent {
  type: "cover" | "list" | "split" | "flow" | "focus" | "closing";
  title: string;
  subtitle?: string;
  items?: string[];
  left?: string[];
  right?: string[];
  steps?: string[];
  quote?: string;
  highlight?: string;
  cta?: string;
  url?: string;
  brand?: string;
}

export default function CardNewsPage() {
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState<SlideContent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [model, setModel] = useState("claude-sonnet-4-6");

  const generate = async (t: string) => {
    setLoading(true);
    setError("");
    setSlides(null);
    try {
      const res = await fetch("/api/generate-cardnews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, model }),
      });
      if (!res.ok) throw new Error("생성 실패");
      const data = await res.json();
      setSlides(data.slides);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📱 카드뉴스 (템플릿 모드)</h1>
          <p className="text-gray-400">AI가 JSON 구조만 생성 → 고정 템플릿이 렌더링. 코드 에러 없음.</p>
        </div>

        {/* Input */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="주제를 입력하세요..."
            className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#00AEEF] focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && topic.trim() && generate(topic.trim())}
          />
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white text-sm"
          >
            <option value="claude-sonnet-4-6">Sonnet</option>
            <option value="claude-opus-4-6">Opus</option>
          </select>
          <button
            onClick={() => topic.trim() && generate(topic.trim())}
            disabled={loading || !topic.trim()}
            className="rounded-xl bg-[#00AEEF] px-6 py-3 font-semibold text-white hover:bg-[#00AEEF]/80 disabled:opacity-50"
          >
            {loading ? "생성 중..." : "생성"}
          </button>
        </div>

        {/* Presets */}
        <div className="mb-8 flex flex-wrap gap-2">
          {PRESET_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => { setTopic(t); generate(t); }}
              disabled={loading}
              className="rounded-full border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-300 hover:border-[#00AEEF] hover:text-white disabled:opacity-50"
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-900/50 border border-red-700 p-4 text-red-200">
            {error}
          </div>
        )}

        {/* Result: side by side */}
        {slides && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold mb-4">미리보기</h2>
              <div className="rounded-xl overflow-hidden border border-gray-700" style={{ aspectRatio: "4/5" }}>
                <Player
                  component={CardNewsTemplate}
                  inputProps={{ slides }}
                  durationInFrames={slides.length * 90}
                  fps={30}
                  compositionWidth={1080}
                  compositionHeight={1350}
                  style={{ width: "100%", height: "100%" }}
                  controls
                  loop
                  autoPlay
                />
              </div>
            </div>

            {/* JSON */}
            <div>
              <h2 className="text-lg font-semibold mb-4">생성된 구조 (JSON)</h2>
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 overflow-y-auto" style={{ maxHeight: 600 }}>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(slides, null, 2)}
                </pre>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {slides.length}장 × 3초 = {slides.length * 3}초 | 코드 에러 없음 (고정 템플릿)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
