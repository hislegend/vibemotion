import React, { useMemo } from "react";
import { Audio } from "remotion";

/**
 * Wraps an AI-generated component with a Remotion <Audio> element
 * so that TTS narration is embedded directly in the rendered MP4.
 */
export const AudioWrapper: React.FC<{
  Component: React.ComponentType;
  audioSrc?: string | null;
}> = ({ Component, audioSrc }) => {
  // Convert data URL to blob URL for better Remotion compatibility
  const resolvedSrc = useMemo(() => {
    if (!audioSrc) return null;
    if (audioSrc.startsWith("data:")) {
      try {
        const byteString = atob(audioSrc.split(",")[1]);
        const mimeType = audioSrc.split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeType });
        return URL.createObjectURL(blob);
      } catch {
        return audioSrc;
      }
    }
    return audioSrc;
  }, [audioSrc]);

  return (
    <>
      <Component />
      {resolvedSrc && <Audio src={resolvedSrc} volume={1} />}
    </>
  );
};

/**
 * Creates a wrapped component that includes audio.
 * Used to pass a single component to both Player and renderMediaOnWeb.
 */
export function createAudioWrappedComponent(
  Component: React.ComponentType,
  audioSrc?: string | null,
): React.ComponentType {
  if (!audioSrc) return Component;

  const Wrapped: React.FC = () => (
    <AudioWrapper Component={Component} audioSrc={audioSrc} />
  );
  Wrapped.displayName = "AudioWrapped";
  return Wrapped;
}
