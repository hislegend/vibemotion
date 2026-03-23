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
  compositionWidth?: number;
  compositionHeight?: number;
}> = ({ Component, code, durationInFrames, fps, compositionWidth, compositionHeight }) => {
  const { renderMedia, state, undo } = useRendering({
    Component,
    durationInFrames,
    fps,
    compositionWidth,
    compositionHeight,
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
          <ErrorComp message="렌더링에는 Chrome/Edge 94 이상이 필요합니다. 브라우저가 WebCodecs(VideoEncoder)를 지원하지 않습니다." />
        )}
        <Button
          disabled={state.status === "invoking" || !code || !Component || !isWebCodecsSupported}
          loading={state.status === "invoking"}
          onClick={renderMedia}
        >
          <Download className="w-4 h-4 mr-2" />
          {state.status === "invoking"
            ? "렌더링 시작 중..."
            : "렌더링 & 다운로드"}
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
