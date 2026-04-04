// 자동 편집 상태 관리 훅
import { useState, useCallback } from 'react';
import {
  AutoEditConfig,
  AutoEditProgress,
  AutoEditStep,
  DEFAULT_AUTO_EDIT_CONFIG,
} from '../../types/auto-edit';

interface UseAutoEditReturn {
  config: AutoEditConfig;
  progress: AutoEditProgress;
  isRunning: boolean;
  updateConfig: (updates: Partial<AutoEditConfig>) => void;
  startAutoEdit: () => void;
  updateProgress: (step: AutoEditStep, progressPercent: number, message: string) => void;
  completeAutoEdit: () => void;
  failAutoEdit: (errorMessage: string) => void;
  resetAutoEdit: () => void;
}

const INITIAL_PROGRESS: AutoEditProgress = {
  currentStep: 'idle',
  progress: 0,
  message: '',
};

export function useAutoEdit(): UseAutoEditReturn {
  const [config, setConfig] = useState<AutoEditConfig>(DEFAULT_AUTO_EDIT_CONFIG);
  const [progress, setProgress] = useState<AutoEditProgress>(INITIAL_PROGRESS);
  const [isRunning, setIsRunning] = useState(false);

  const updateConfig = useCallback((updates: Partial<AutoEditConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const startAutoEdit = useCallback(() => {
    setIsRunning(true);
    setProgress({
      currentStep: 'analyzing',
      progress: 0,
      message: '영상 분석 시작...',
    });
  }, []);

  const updateProgress = useCallback(
    (step: AutoEditStep, progressPercent: number, message: string) => {
      setProgress({
        currentStep: step,
        progress: progressPercent,
        message,
      });
    },
    []
  );

  const completeAutoEdit = useCallback(() => {
    setProgress({
      currentStep: 'complete',
      progress: 100,
      message: '자동 편집 완료!',
    });
    setIsRunning(false);
  }, []);

  const failAutoEdit = useCallback((errorMessage: string) => {
    setProgress({
      currentStep: 'error',
      progress: 0,
      message: errorMessage,
    });
    setIsRunning(false);
  }, []);

  const resetAutoEdit = useCallback(() => {
    setProgress(INITIAL_PROGRESS);
    setIsRunning(false);
  }, []);

  return {
    config,
    progress,
    isRunning,
    updateConfig,
    startAutoEdit,
    updateProgress,
    completeAutoEdit,
    failAutoEdit,
    resetAutoEdit,
  };
}

// 스텝별 진행률 기준값
export const STEP_PROGRESS_MAP: Record<AutoEditStep, number> = {
  idle: 0,
  analyzing: 10,
  cutting: 30,
  effects: 50,
  texts: 70,
  bgm: 85,
  broll: 95,
  complete: 100,
  error: 0,
};

// 스텝별 메시지
export const STEP_MESSAGES: Record<AutoEditStep, string> = {
  idle: '',
  analyzing: '영상 분석 중...',
  cutting: '자동 컷 적용 중...',
  effects: '전환효과 적용 중...',
  texts: '텍스트 오버레이 추가 중...',
  bgm: 'BGM 추가 중...',
  broll: 'B-Roll 삽입 중...',
  complete: '자동 편집 완료!',
  error: '오류가 발생했습니다',
};
