import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useAutoEdit, STEP_MESSAGES } from '../../hooks/useAutoEdit';
import {
  AutoEditPreset,
  AutoEditStyle,
  AutoEditStep,
} from '../../../types/auto-edit';
import { VideoItem } from '../../items/video/video-item-type';
// [STUB] supabase import removed
import { VideoSegmentAnalysis, CutSection } from '../../../types/video-segment';
import { buildSections } from '../../auto-cut/build-sections';
import { CuttingRules, DEFAULT_CUTTING_RULES } from '../../../types/video-segment';
import { ViralTemplate } from '../../../types/viral-template';

interface OneClickEditControlsProps {
  item: VideoItem;
  onApplyAutoCut: (sections: CutSection[]) => void;
  onApplyTransitions: (style: AutoEditStyle, analysis?: VideoSegmentAnalysis) => void;
  onApplyTexts: (analysis: VideoSegmentAnalysis) => void;
  onApplyBGM: (analysis?: VideoSegmentAnalysis) => Promise<void>;
  onSelectTemplate?: (template: ViralTemplate, analysis?: VideoSegmentAnalysis) => void;
  videoUrl?: string;
  videoDuration?: number;
}

export const OneClickEditControls: React.FC<OneClickEditControlsProps> = ({
  item,
  onApplyAutoCut,
  onApplyTransitions,
  onApplyTexts,
  onApplyBGM,
  onSelectTemplate,
  videoUrl,
  videoDuration,
}) => {
  const {
    config,
    progress,
    isRunning,
    updateConfig,
    startAutoEdit,
    updateProgress,
    completeAutoEdit,
    failAutoEdit,
    resetAutoEdit,
  } = useAutoEdit();

  const [analysis, setAnalysis] = useState<VideoSegmentAnalysis | null>(null);

  // 프리셋별 커팅 규칙
  const getPresetRules = (preset: AutoEditPreset): CuttingRules => {
    const baseRules = { ...DEFAULT_CUTTING_RULES };
    switch (preset) {
      case 'Ad15':
        return { ...baseRules, targetDurationSeconds: 15 };
      case 'Ad30':
        return { ...baseRules, targetDurationSeconds: 30 };
      case 'Full':
        return { ...baseRules, targetDurationSeconds: undefined };
      default:
        return baseRules;
    }
  };

  // 원클릭 자동 편집 실행
  const handleOneClickEdit = useCallback(async () => {
    if (!videoUrl || !videoDuration) {
      failAutoEdit('영상 URL 또는 길이 정보가 없습니다.');
      return;
    }

    startAutoEdit();

    try {
      // Step 1: 영상 분석
      updateProgress('analyzing', 10, '영상 분석 중...');
      
      const analysisData = null; const analysisError = new Error("Analysis not available in standalone mode"); if (false) await fetch(
        'analyze-video-segments',
        {
          body: {
            videoUrl,
            videoId: item.id,
            duration: videoDuration,
          },
        }
      );

      if (analysisError || !analysisData) {
        throw new Error(analysisError?.message || '영상 분석 실패');
      }

      const videoAnalysis = analysisData as VideoSegmentAnalysis;
      setAnalysis(videoAnalysis);

      // Step 2: 자동 컷 적용
      if (config.enableAutoCut) {
        updateProgress('cutting', 30, '자동 컷 적용 중...');
        const rules = getPresetRules(config.preset);
        const sections = buildSections(videoAnalysis, rules);
        onApplyAutoCut(sections);
        await delay(500); // UI 업데이트 대기
      }

      // Step 3: 전환효과 적용
      if (config.enableTransitions) {
        updateProgress('effects', 50, '전환효과 적용 중...');
        onApplyTransitions(config.style, videoAnalysis);
        await delay(500);
      }

      // Step 4: 텍스트 오버레이
      if (config.enableTexts) {
        updateProgress('texts', 70, '텍스트 오버레이 추가 중...');
        onApplyTexts(videoAnalysis);
        await delay(500);
      }

      // Step 5: BGM 추가
      if (config.enableBGM) {
        updateProgress('bgm', 85, 'BGM 추가 중...');
        await onApplyBGM(videoAnalysis);
        await delay(500);
      }

      completeAutoEdit();
    } catch (error) {
      console.error('Auto edit error:', error);
      failAutoEdit(error instanceof Error ? error.message : '자동 편집 중 오류 발생');
    }
  }, [
    videoUrl,
    videoDuration,
    item.id,
    config,
    startAutoEdit,
    updateProgress,
    completeAutoEdit,
    failAutoEdit,
    onApplyAutoCut,
    onApplyTransitions,
    onApplyTexts,
    onApplyBGM,
  ]);

  const getStepIcon = (step: AutoEditStep) => {
    switch (step) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return isRunning ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 프리셋 선택 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">프리셋</Label>
          <Select
            value={config.preset}
            onValueChange={(value: AutoEditPreset) => updateConfig({ preset: value })}
            disabled={isRunning}
          >
            <SelectTrigger className="h-8 text-xs bg-neutral-800 border-neutral-600 text-white hover:bg-neutral-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-600">
              <SelectItem value="Ad15">15초 광고</SelectItem>
              <SelectItem value="Ad30">30초 광고</SelectItem>
              <SelectItem value="Full">전체 길이</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">스타일</Label>
          <Select
            value={config.style}
            onValueChange={(value: AutoEditStyle) => updateConfig({ style: value })}
            disabled={isRunning}
          >
            <SelectTrigger className="h-8 text-xs bg-neutral-800 border-neutral-600 text-white hover:bg-neutral-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-600">
              <SelectItem value="minimal">미니멀</SelectItem>
              <SelectItem value="dynamic">다이나믹</SelectItem>
              <SelectItem value="cinematic">시네마틱</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 기능 토글 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">자동 컷 편집</Label>
          <Switch
            checked={config.enableAutoCut}
            onCheckedChange={(checked) => updateConfig({ enableAutoCut: checked })}
            disabled={isRunning}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">전환효과 적용</Label>
          <Switch
            checked={config.enableTransitions}
            onCheckedChange={(checked) => updateConfig({ enableTransitions: checked })}
            disabled={isRunning}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">텍스트 오버레이</Label>
          <Switch
            checked={config.enableTexts}
            onCheckedChange={(checked) => updateConfig({ enableTexts: checked })}
            disabled={isRunning}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">BGM 추가</Label>
          <Switch
            checked={config.enableBGM}
            onCheckedChange={(checked) => updateConfig({ enableBGM: checked })}
            disabled={isRunning}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">B-Roll 삽입 (준비중)</Label>
          <Switch
            checked={config.enableBRoll}
            onCheckedChange={(checked) => updateConfig({ enableBRoll: checked })}
            disabled={true}
          />
        </div>
      </div>

      {/* 진행률 표시 */}
      {isRunning && (
        <div className="space-y-2">
          <Progress value={progress.progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">{progress.message}</p>
        </div>
      )}

      {/* 완료/에러 메시지 */}
      {progress.currentStep === 'complete' && (
        <div className="flex items-center gap-2 text-green-600 text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>자동 편집이 완료되었습니다!</span>
        </div>
      )}
      {progress.currentStep === 'error' && (
        <div className="flex items-center gap-2 text-destructive text-xs">
          <XCircle className="w-4 h-4" />
          <span>{progress.message}</span>
        </div>
      )}

      {/* 실행 버튼 */}
      <Button
        onClick={handleOneClickEdit}
        disabled={isRunning || !videoUrl}
        className="w-full"
        size="sm"
      >
        {getStepIcon(progress.currentStep)}
        <span className="ml-2">
          {isRunning ? '자동 편집 중...' : '✨ 원클릭 자동 편집'}
        </span>
      </Button>

      {progress.currentStep === 'complete' || progress.currentStep === 'error' ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={resetAutoEdit}
        >
          다시 시도
        </Button>
      ) : null}
    </div>
  );
};

// 딜레이 유틸리티
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
