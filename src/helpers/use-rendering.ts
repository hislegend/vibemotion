import { renderMediaOnWeb } from "@remotion/web-renderer";
import type { ComponentType } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

export type State =
  | {
      status: "init";
    }
  | {
      status: "invoking";
    }
  | {
      status: "rendering";
      progress: number;
    }
  | {
      status: "error";
      error: Error;
    }
  | {
      url: string;
      size: number;
      status: "done";
    };

interface RenderingOptions {
  Component: ComponentType | null;
  durationInFrames: number;
  fps: number;
  compositionWidth?: number;
  compositionHeight?: number;
}

export const useRendering = ({
  Component,
  durationInFrames,
  fps,
  compositionWidth,
  compositionHeight,
}: RenderingOptions) => {
  const [state, setState] = useState<State>({
    status: "init",
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const renderMedia = useCallback(async () => {
    if (!Component) return;

    setState({ status: "invoking" });

    try {
      abortControllerRef.current = new AbortController();

      setState({ status: "rendering", progress: 0 });

      const result = await renderMediaOnWeb({
        composition: {
          component: Component,
          id: "browser-render",
          width: compositionWidth || 1920,
          height: compositionHeight || 1080,
          fps,
          durationInFrames,
        },
        inputProps: {},
        onProgress: ({ progress }) => {
          setState({ status: "rendering", progress });
        },
        signal: abortControllerRef.current.signal,
      });

      const blob = await result.getBlob();
      const url = URL.createObjectURL(blob);

      setState({
        url,
        size: blob.size,
        status: "done",
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setState({ status: "init" });
        return;
      }
      setState({
        status: "error",
        error: err as Error,
      });
    }
  }, [Component, durationInFrames, fps, compositionWidth, compositionHeight]);

  const undo = useCallback(() => {
    // Abort any in-progress render
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState({ status: "init" });
  }, []);

  return useMemo(() => {
    return {
      renderMedia,
      state,
      undo,
    };
  }, [renderMedia, state, undo]);
};
