"use client";

import { LandingPageInput } from "@/components/LandingPageInput";
import { PageLayout } from "@/components/PageLayout";
import {
  examples,
  type RemotionExample,
} from "@/examples/code";
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

/* ─── template display order ─── */

const TEMPLATE_ORDER = [
  "brand-intro",
  "progress-bar",
  "text-rotation",
  "typewriter-highlight",
  "word-carousel",
  "animated-shapes",
  "app-promo-finance",
  "app-promo-social",
  "app-promo-fitness",
  "testimonial-card",
  "product-launch",
  "data-showcase",
  "gold-price-chart",
  "histogram",
  "falling-spheres",
  "cardnews-cover",
  "cardnews-body-list",
  "cardnews-body-split",
  "cardnews-closing",
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

/* ─── Template components ─── */

function SmartCard({
  onClick,
  active,
  voiceEnabled,
  onVoiceToggle,
}: {
  onClick: () => void;
  active: boolean;
  voiceEnabled: boolean;
  onVoiceToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all ${
        active
          ? "border-primary bg-primary/15 ring-2 ring-primary/40"
          : "border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg">{voiceEnabled ? "🧠+🔊" : "🧠"}</span>
        <div className="flex items-center gap-1.5">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onVoiceToggle();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                onVoiceToggle();
              }
            }}
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer ${
              voiceEnabled
                ? "bg-primary/20 text-primary"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            title={voiceEnabled ? "음성 끄기" : "음성 켜기"}
          >
            🔊 {voiceEnabled ? "ON" : "OFF"}
          </span>
          <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            AI 분석
          </span>
        </div>
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
  isSmartActive,
  voiceEnabled,
  onVoiceToggle,
}: {
  onSelect: (example: RemotionExample) => void;
  onSmartClick: () => void;
  isSmartActive: boolean;
  voiceEnabled: boolean;
  onVoiceToggle: () => void;
}) {
  const exampleMap = new Map(examples.map((e) => [e.id, e]));
  const orderedExamples = TEMPLATE_ORDER
    .map((id) => exampleMap.get(id))
    .filter((e): e is RemotionExample => e !== undefined);

  // Include any examples not in the explicit order (future-proofing)
  const orderedIds = new Set(TEMPLATE_ORDER);
  const remaining = examples.filter((e) => !orderedIds.has(e.id));
  const allExamples = [...orderedExamples, ...remaining];

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-16">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-foreground">템플릿으로 시작하기</h2>
        <p className="mt-1 text-sm text-muted-foreground">AI가 원하는 대로 커스터마이징해줍니다</p>
      </div>

      {/* Cards grid — flat, no tier tabs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SmartCard onClick={onSmartClick} active={isSmartActive} voiceEnabled={voiceEnabled} onVoiceToggle={onVoiceToggle} />
        {allExamples.map((example) => (
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
  const [isSmartSelected, setIsSmartSelected] = useState(false);
  const [smartAnalyzing, setSmartAnalyzing] = useState(false);
  const [smartError, setSmartError] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const runSmartAnalysis = useCallback(async (input: string) => {
    setSmartError("");
    setSmartAnalyzing(true);

    const isUrl = input.startsWith("http://") || input.startsWith("https://");

    try {
      // Step 1: Analyze content
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

      // Step 2: Fetch recommended styles
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

      // Step 3: Store in sessionStorage and navigate
      sessionStorage.setItem("smartAnalysis", JSON.stringify(data));
      sessionStorage.setItem("smartStyles", JSON.stringify(stylesData));
      sessionStorage.setItem("smartVoiceEnabled", JSON.stringify(voiceEnabled));
      router.push("/smart-result");
    } catch (e) {
      setSmartError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setSmartAnalyzing(false);
    }
  }, [router, voiceEnabled]);

  const handleNavigate = useCallback(
    (
      prompt: string,
      model: ModelId,
      aspectRatio: AspectRatioId,
      attachedImages?: string[],
    ) => {
      // Smart mode: run analysis then navigate to /smart-result
      if (isSmartSelected) {
        if (!prompt.trim()) return;
        runSmartAnalysis(prompt.trim());
        return;
      }

      // Normal mode: navigate to /generate
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
    [router, selectedTemplate, isSmartSelected, runSmartAnalysis],
  );

  const handleTemplateSelect = (example: RemotionExample) => {
    setSelectedTemplate(example);
    setIsSmartSelected(false);
    setPrefillPrompt(`"${example.name}" 템플릿 기반으로: `);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSmartClick = () => {
    if (isSmartSelected) {
      setIsSmartSelected(false);
      setSmartError("");
    } else {
      setIsSmartSelected(true);
      setSelectedTemplate(null);
      setPrefillPrompt("");
    }
  };

  return (
    <PageLayout>
      <LandingPageInput
        onNavigate={handleNavigate}
        isNavigating={isNavigating || smartAnalyzing}
        showCodeExamplesLink
        prefillPrompt={prefillPrompt}
        onPrefillConsumed={() => setPrefillPrompt("")}
      />

      {/* Smart analyzing overlay */}
      {smartAnalyzing && (
        <div className="mx-auto w-full max-w-2xl px-4 pb-6">
          <div className="flex flex-col items-center gap-3 py-8">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-sm text-muted-foreground">AI가 콘텐츠를 분석하고 있습니다...</p>
          </div>
        </div>
      )}

      {/* Smart error */}
      {smartError && (
        <div className="mx-auto w-full max-w-2xl px-4 pb-4">
          <p className="text-sm text-destructive text-center">{smartError}</p>
        </div>
      )}

      <TemplateGallery
        onSelect={handleTemplateSelect}
        onSmartClick={handleSmartClick}
        isSmartActive={isSmartSelected}
        voiceEnabled={voiceEnabled}
        onVoiceToggle={() => setVoiceEnabled((v) => !v)}
      />

      <ProjectHistory />
    </PageLayout>
  );
};

export default Home;
