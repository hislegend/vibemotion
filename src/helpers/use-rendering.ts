import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { CompositionProps } from "../../types/constants";

export type State =
  | {
      status: "init";
    }
  | {
      status: "invoking";
    }
  | {
      renderId: string;
      bucketName: string;
      progress: number;
      status: "rendering";
    }
  | {
      renderId: string | null;
      status: "error";
      error: Error;
    }
  | {
      url: string;
      size: number;
      status: "done";
    };

export const useRendering = (inputProps: z.infer<typeof CompositionProps>) => {
  const [state, setState] = useState<State>({
    status: "init",
  });

  const renderMedia = useCallback(async () => {
    setState({
      status: "invoking",
    });
    try {
      const result = await fetch("/api/local-render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inputProps }),
      });

      const json = await result.json();
      if (json.type === "error") {
        throw new Error(json.message);
      }

      setState({
        url: json.data.url,
        size: json.data.size,
        status: "done",
      });
    } catch (err) {
      setState({
        status: "error",
        error: err as Error,
        renderId: null,
      });
    }
  }, [inputProps]);

  const undo = useCallback(() => {
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
