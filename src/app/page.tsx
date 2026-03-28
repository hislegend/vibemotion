"use client";

import { LandingPageInput } from "@/components/LandingPageInput";
import { PageLayout } from "@/components/PageLayout";
import {
  deleteProject,
  getProjects,
  renameProject,
  type Project,
} from "@/lib/project-storage";
import type { AspectRatioId, ModelId } from "@/types/generation";
import { getTemplates, deleteTemplate, type SavedTemplate } from "@/lib/template-storage";
import { X } from "lucide-react";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Style cards (4종) ─── */

interface StyleCard {
  id: string;
  emoji: string;
  title: string;
  description: string;
  action: "smart" | "prefill" | "link";
  prefillPrompt?: string;
  aspectRatio?: AspectRatioId;
  href?: string;
  template?: string;
}

const STYLE_CARDS: StyleCard[] = [
  {
    id: "smart",
    emoji: "🧠",
    title: "스마트 분석",
    description: "URL이나 텍스트를 넣으면 AI가 분석하고 최적 영상을 만듭니다",
    action: "smart",
  },
  {
    id: "motion",
    emoji: "🎬",
    title: "모션그래픽",
    description: "로고 인트로, 제품 소개, 데이터 시각화, 텍스트 효과",
    action: "prefill",
    prefillPrompt: "",
  },
  {
    id: "cardnews",
    emoji: "📱",
    title: "카드뉴스",
    description: "인스타그램 카루셀 슬라이드. 표지→본문→마무리 자동 구성",
    action: "prefill",
    prefillPrompt: "",
    aspectRatio: "4:5",
    template: "cardnews",
  },
  {
    id: "cinematic",
    emoji: "🎥",
    title: "시네마틱",
    description: "감성적이고 몰입감 있는 스토리텔링 영상",
    action: "prefill",
    prefillPrompt: "시네마틱 스타일로 만들기: ",
  },
];

/* ─── Preset prompts (6종) ─── */

interface PresetPrompt {
  id: string;
  label: string;
  prompt: string;
  aspectRatio?: AspectRatioId;
  duration?: number; // seconds
}

const PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: "brand-intro",
    label: "크랩스 브랜드 인트로",
    prompt:
      '크랩스(Crabs) 브랜드 인트로 영상. 인디고-바이올렛 그라데이션 배경, 로고 스프링 등장, 슬로건 "Build faster, ship smarter" 페이드인. 10초, 9:16 세로형',
    aspectRatio: "9:16",
  },
  {
    id: "revenue-chart",
    label: "매출 성장 그래프",
    prompt:
      '월별 매출 성장 바 차트. 1월 100만→6월 850만 순차 스프링 등장. 다크 배경, 블루 악센트, 마지막에 "850% 성장" 임팩트 숫자. 15초',
  },
  {
    id: "product-teaser",
    label: "신제품 출시 티저",
    prompt:
      "신제품 앱 출시 티저. 3D 틸트 폰 목업에 앱 화면, 파스텔 그라데이션 배경. Coming Soon → 기능 3개 하이라이트 → CTA. 20초, 9:16",
    aspectRatio: "9:16",
  },
  {
    id: "testimonial",
    label: "고객 후기 카드",
    prompt:
      "고객 리뷰 카드. 따뜻한 베이지 배경, 리뷰 텍스트 타이핑 효과, 별 5개 순차 등장, 고객명과 직함 페이드인. 10초",
  },
  {
    id: "startup-intro",
    label: "AI 스타트업 소개",
    prompt:
      "AI 스타트업 회사 소개 영상. 다크 테마, 숫자 카운트업(유저 10만, MAU 5만, 성장률 320%), 글래스 카드 위에 표시, 시네마틱 분위기. 25초",
  },
  {
    id: "event-countdown",
    label: "이벤트 카운트다운",
    prompt:
      '이벤트 D-day 카운트다운. 3-2-1 글로우 타이핑 효과, 스파클 파티클, "Grand Opening" 리빌, 다크 네이비 배경에 골드 악센트. 15초',
  },
];

/* ─── small components ─── */

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
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
                prev.map((p) =>
                  p.id === project.id ? { ...p, title } : p,
                ),
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

/* ─── Saved Templates ─── */

function SavedTemplates() {
  const router = useRouter();
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  if (templates.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-10">
      <div className="mb-4 text-center">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          📦 내 템플릿
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          저장된 템플릿으로 바로 시작하세요
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {templates.map((t) => (
          <div key={t.id} className="relative group">
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("templateCode", t.code);
                const params = new URLSearchParams({
                  prompt: `"${t.name}" 템플릿 기반으로: `,
                  model: "claude-sonnet-4-6",
                  aspectRatio: t.aspectRatio || "9:16",
                  duration: String(Math.round(t.durationInFrames / t.fps)),
                });
                router.push(`/generate?${params.toString()}`);
              }}
              className="w-full rounded-xl border border-border bg-secondary/30 p-4 text-left transition-all hover:border-primary/40 hover:bg-secondary/60"
            >
              <div className="text-sm font-semibold text-foreground truncate">{t.name}</div>
              <div className="text-xs text-muted-foreground mt-1 truncate">{t.description}</div>
              <div className="text-xs text-primary mt-2">
                {t.aspectRatio} · {Math.round(t.durationInFrames / t.fps)}s
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("이 템플릿을 삭제할까요?")) {
                  deleteTemplate(t.id);
                  setTemplates(getTemplates());
                }
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive text-xs transition-opacity p-1 rounded-md hover:bg-destructive/20"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Main page ─── */

const Home: NextPage = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [prefillPrompt, setPrefillPrompt] = useState("");
  const [prefillAspectRatio, setPrefillAspectRatio] = useState<AspectRatioId | null>(null);
  const [prefillDuration, setPrefillDuration] = useState<number | null>(null);
  const [prefillTemplate, setPrefillTemplate] = useState<string | null>(null);
  const [isSmartSelected, setIsSmartSelected] = useState(false);
  const [smartAnalyzing, setSmartAnalyzing] = useState(false);
  const [smartError, setSmartError] = useState("");
  const [voiceEnabled] = useState(false);

  const [smartModel, setSmartModel] = useState<string | null>(null);

  const runSmartAnalysis = useCallback(
    async (input: string) => {
      setSmartError("");
      setSmartAnalyzing(true);

      const isUrl =
        input.startsWith("http://") || input.startsWith("https://");

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

        const data = await res.json();

        const styleRes = await fetch("/api/route-style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        let stylesData: unknown[] = [];
        if (styleRes.ok) {
          const parsed = await styleRes.json();
          stylesData = parsed.styles;
        }

        sessionStorage.setItem("smartAnalysis", JSON.stringify(data));
        sessionStorage.setItem("smartStyles", JSON.stringify(stylesData));
        sessionStorage.setItem(
          "smartVoiceEnabled",
          JSON.stringify(voiceEnabled),
        );
        // Voice OFF: skip /smart-result, go directly to /generate
        if (!voiceEnabled) {
          const bestStyle = stylesData.length > 0
            ? (stylesData[0] as { style: string }).style
            : "cinematic";
          const density = data.suggestedDuration <= 15 ? "short" : data.suggestedDuration <= 30 ? "normal" : "long";
          const { generateRemotionPrompt } = await import("@/lib/generate-prompt");
          const densityDuration: Record<string, number> = { short: 12, normal: 20, long: 45 };
          const dur = densityDuration[density] || 20;
          const promptText = generateRemotionPrompt(data, bestStyle, dur, density);
          const model = smartModel || "claude-sonnet-4-6";
          const params = new URLSearchParams({
            prompt: promptText,
            model,
            aspectRatio: "9:16",
            duration: String(dur),
          });
          setSmartAnalyzing(false);
          router.push(`/generate?${params.toString()}`);
          return;
        }

        // Voice ON: go to /smart-result for script editing
        if (smartModel) {
          sessionStorage.setItem("smartModel", smartModel);
        }
        router.push("/smart-result");
      } catch (e) {
        setSmartError(
          e instanceof Error ? e.message : "오류가 발생했습니다.",
        );
        setSmartAnalyzing(false);
      }
    },
    [router, voiceEnabled],
  );

  const handleNavigate = useCallback(
    (
      prompt: string,
      model: ModelId,
      aspectRatio: AspectRatioId,
      attachedImages?: string[],
    ) => {
      if (isSmartSelected) {
        if (!prompt.trim()) return;
        setSmartModel(model);
        runSmartAnalysis(prompt.trim());
        return;
      }

      setIsNavigating(true);
      if (attachedImages && attachedImages.length > 0) {
        sessionStorage.setItem(
          "initialAttachedImages",
          JSON.stringify(attachedImages),
        );
      } else {
        sessionStorage.removeItem("initialAttachedImages");
      }
      const params = new URLSearchParams({ prompt, model, aspectRatio });
      if (prefillDuration) {
        params.set("duration", String(prefillDuration));
      }
      if (prefillTemplate) {
        params.set("template", prefillTemplate);
      }
      router.push(`/generate?${params.toString()}`);
    },
    [router, isSmartSelected, runSmartAnalysis, prefillDuration, prefillTemplate],
  );

  const handleStyleClick = (card: StyleCard) => {
    if (card.action === "link" && card.href) {
      router.push(card.href);
      return;
    }
    if (card.action === "smart") {
      setIsSmartSelected((prev) => !prev);
      setSmartError("");
      setPrefillPrompt("");
      setPrefillAspectRatio(null);
    } else {
      setIsSmartSelected(false);
      setPrefillPrompt(card.prefillPrompt || "");
      setPrefillAspectRatio(card.aspectRatio || null);
      setPrefillTemplate(card.template || null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePresetClick = (preset: PresetPrompt) => {
    setIsSmartSelected(false);
    setPrefillPrompt(preset.prompt);
    setPrefillAspectRatio(preset.aspectRatio || null);
    setPrefillDuration(preset.duration || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageLayout>
      <LandingPageInput
        onNavigate={handleNavigate}
        isNavigating={isNavigating || smartAnalyzing}
        showCodeExamplesLink
        prefillPrompt={prefillPrompt}
        onPrefillConsumed={() => setPrefillPrompt("")}
        prefillAspectRatio={prefillAspectRatio}
        onAspectRatioConsumed={() => setPrefillAspectRatio(null)}
      />

      {/* Smart analyzing overlay */}
      {smartAnalyzing && (
        <div className="mx-auto w-full max-w-2xl px-4 pb-6">
          <div className="flex flex-col items-center gap-3 py-8">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-sm text-muted-foreground">
              AI가 콘텐츠를 분석하고 있습니다...
            </p>
          </div>
        </div>
      )}

      {/* Smart error */}
      {smartError && (
        <div className="mx-auto w-full max-w-2xl px-4 pb-4">
          <p className="text-sm text-destructive text-center">{smartError}</p>
        </div>
      )}

      {/* ─── Style cards (4종) ─── */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-10">
        <h2 className="mb-4 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          스타일로 시작하기
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STYLE_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => handleStyleClick(card)}
              className={`group flex flex-col items-center gap-2 rounded-xl border p-5 text-center transition-all ${
                card.action === "smart" && isSmartSelected
                  ? "border-primary bg-primary/15 ring-2 ring-primary/40"
                  : "border-border bg-secondary/50 hover:border-primary/40 hover:bg-secondary"
              }`}
            >
              <span className="text-3xl">{card.emoji}</span>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {card.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Preset prompts (6종) ─── */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-16">
        <div className="mb-4 text-center">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            프리셋으로 바로 체험
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            클릭하면 프롬프트가 채워집니다. 엔터만 누르세요.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESET_PROMPTS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="rounded-lg border border-border bg-secondary/30 px-4 py-3 text-left transition-all hover:border-primary/40 hover:bg-secondary/60"
            >
              <span className="text-sm font-medium text-foreground">
                {preset.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <SavedTemplates />

      <ProjectHistory />
    </PageLayout>
  );
};

export default Home;
