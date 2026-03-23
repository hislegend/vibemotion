"use client";

import { LandingPageInput } from "@/components/LandingPageInput";
import { PageLayout } from "@/components/PageLayout";
import {
  examples,
  type RemotionExample,
} from "@/examples/code";
import type { AspectRatioId, ModelId } from "@/types/generation";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
        <span className="text-lg">
          {categoryEmoji[example.category]}
        </span>
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
}: {
  onSelect: (example: RemotionExample) => void;
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
        <h2 className="text-xl font-bold text-foreground">
          템플릿으로 시작하기
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          AI가 원하는 대로 커스터마이징해줍니다
        </p>
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

const Home: NextPage = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = (
    prompt: string,
    model: ModelId,
    aspectRatio: AspectRatioId,
    attachedImages?: string[],
  ) => {
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
    router.push(`/generate?${params.toString()}`);
  };

  const handleTemplateSelect = (example: RemotionExample) => {
    setIsNavigating(true);
    sessionStorage.setItem("templateCode", example.code);
    const params = new URLSearchParams({
      prompt: "Customize this template",
      model: "claude-sonnet-4-6",
      aspectRatio: "9:16",
    });
    router.push(`/generate?${params.toString()}`);
  };

  return (
    <PageLayout>
      <LandingPageInput
        onNavigate={handleNavigate}
        isNavigating={isNavigating}
        showCodeExamplesLink
      />
      <TemplateGallery onSelect={handleTemplateSelect} />
    </PageLayout>
  );
};

export default Home;
