"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";

interface SettingsModalProps {
  durationInFrames: number;
  onDurationChange: (duration: number) => void;
  fps: number;
  onFpsChange: (fps: number) => void;
}

export function SettingsModal({
  durationInFrames,
  onDurationChange,
  fps,
  onFpsChange,
}: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [localDuration, setLocalDuration] = useState(String(durationInFrames));
  const [localFps, setLocalFps] = useState(String(fps));

  // Sync local state when props change
  useEffect(() => {
    setLocalDuration(String(durationInFrames));
    setLocalFps(String(fps));
  }, [durationInFrames, fps]);

  const handleDurationBlur = () => {
    const parsed = parseInt(localDuration);
    if (isNaN(parsed) || parsed < 1) {
      setLocalDuration(String(durationInFrames));
    } else {
      const clamped = Math.min(1000, Math.max(1, parsed));
      setLocalDuration(String(clamped));
      onDurationChange(clamped);
    }
  };

  const handleFpsBlur = () => {
    const parsed = parseInt(localFps);
    if (isNaN(parsed) || parsed < 1) {
      setLocalFps(String(fps));
    } else {
      const clamped = Math.min(60, Math.max(1, parsed));
      setLocalFps(String(clamped));
      onFpsChange(clamped);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="w-4 h-4" />
          설정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background-elevated border-border text-foreground">
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            애니메이션 설정을 구성하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <h3 className="text-sm font-medium text-foreground">애니메이션</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label
                  htmlFor="duration"
                  className="text-muted-foreground text-sm"
                >
                  재생 시간 (프레임)
                </label>
                <input
                  id="duration"
                  type="number"
                  min={1}
                  max={1000}
                  value={localDuration}
                  onChange={(e) => setLocalDuration(e.target.value)}
                  onBlur={handleDurationBlur}
                  className="w-full px-3 py-2 rounded border border-border bg-input text-foreground text-sm font-sans focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="fps" className="text-muted-foreground text-sm">
                  FPS
                </label>
                <input
                  id="fps"
                  type="number"
                  min={1}
                  max={60}
                  value={localFps}
                  onChange={(e) => setLocalFps(e.target.value)}
                  onBlur={handleFpsBlur}
                  className="w-full px-3 py-2 rounded border border-border bg-input text-foreground text-sm font-sans focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground-dim">
              영상 길이: {(durationInFrames / fps).toFixed(2)}초 (
              {durationInFrames} 프레임 / {fps} FPS)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
