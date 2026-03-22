"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useRef } from "react";
import { useRendering } from "../../../helpers/use-rendering";
import { DownloadButton } from "./DownloadButton";
import { ErrorComp } from "./Error";
import { ProgressBar } from "./ProgressBar";

export const RenderControls: React.FC<{
  Component: React.ComponentType | null;
  code: string;
  durationInFrames: number;
  fps: number;
}> = ({ Component, code, durationInFrames, fps }) => {
  const { renderMedia, state, undo } = useRendering({
    Component,
    durationInFrames,
    fps,
  });
  const previousPropsRef = useRef({ code, durationInFrames, fps });

  // Reset rendering state when code, duration, or fps changes
  useEffect(() => {
    const prev = previousPropsRef.current;
    const hasChanged =
      prev.code !== code ||
      prev.durationInFrames !== durationInFrames ||
      prev.fps !== fps;

    if (hasChanged && state.status !== "init") {
      undo();
    }
    previousPropsRef.current = { code, durationInFrames, fps };
  }, [code, durationInFrames, fps, state.status, undo]);

  const isWebCodecsSupported = typeof globalThis.VideoEncoder !== "undefined";

  if (
    state.status === "init" ||
    state.status === "invoking" ||
    state.status === "error"
  ) {
    return (
      <div>
        {!isWebCodecsSupported && (
          <ErrorComp message="Render requires Chrome/Edge 94+. Your browser doesn't support WebCodecs (VideoEncoder)." />
        )}
        <Button
          disabled={state.status === "invoking" || !code || !Component || !isWebCodecsSupported}
          loading={state.status === "invoking"}
          onClick={renderMedia}
        >
          <Download className="w-4 h-4 mr-2" />
          {state.status === "invoking"
            ? "Starting render..."
            : "Render & Download"}
        </Button>
        {state.status === "error" && (
          <ErrorComp message={state.error.message} />
        )}
      </div>
    );
  }

  if (state.status === "rendering") {
    return <ProgressBar progress={state.progress} />;
  }

  if (state.status === "done") {
    return <DownloadButton state={state} undo={undo} />;
  }

  return null;
};
