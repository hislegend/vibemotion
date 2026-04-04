// 배치 변형 생성 액션
import { EditorState } from '../types';
import { VideoSegmentAnalysis } from '@/types/video-segment';
import { AutoEditPreset, AutoEditStyle } from '@/types/auto-edit';
import { ViralTemplate, VIRAL_TEMPLATES } from '@/types/viral-template';

export interface BatchVariationConfig {
  id: string;
  preset: AutoEditPreset;
  style: AutoEditStyle;
  templateId: string;
}

export interface GeneratedVariation {
  id: string;
  config: BatchVariationConfig;
  state: EditorState;
  estimatedDuration: number;
}

export interface ApplyBatchVariationsParams {
  baseState: EditorState;
  analysis: VideoSegmentAnalysis;
  variations: BatchVariationConfig[];
  fps: number;
}

/**
 * 배치 변형 생성 - 여러 버전의 편집본 생성
 * 
 * 참고: 이 함수는 각 변형에 대한 EditorState를 생성합니다.
 * 실제 프로젝트 저장/내보내기는 별도로 처리해야 합니다.
 */
export async function applyBatchVariations({
  baseState,
  analysis,
  variations,
  fps,
}: ApplyBatchVariationsParams): Promise<GeneratedVariation[]> {
  const results: GeneratedVariation[] = [];

  for (const config of variations) {
    try {
      // 템플릿 찾기
      const template = VIRAL_TEMPLATES.find(t => t.id === config.templateId);
      
      if (!template) {
        console.warn(`템플릿을 찾을 수 없음: ${config.templateId}`);
        continue;
      }

      // 딥 복사로 새 상태 생성
      let variationState = JSON.parse(JSON.stringify(baseState)) as EditorState;
      
      // TODO: 실제 변형 적용
      // 1. applyTemplate - 템플릿 구조 적용
      // 2. applyAutoTransitions - 스타일에 맞는 전환효과
      // 3. applyAutoTexts - 텍스트 오버레이
      // 4. 프리셋에 따른 길이 조절

      const estimatedDuration = template.totalDurationTarget;

      results.push({
        id: `variation-${config.id}-${Date.now()}`,
        config,
        state: variationState,
        estimatedDuration,
      });

      console.log(`변형 생성 완료: ${config.preset} / ${config.style} / ${template.nameKr}`);
    } catch (error) {
      console.error(`변형 생성 실패 (${config.id}):`, error);
    }
  }

  return results;
}

/**
 * 변형 미리보기 정보 생성
 */
export function getVariationPreview(config: BatchVariationConfig): {
  label: string;
  description: string;
  estimatedDuration: number;
} {
  const template = VIRAL_TEMPLATES.find(t => t.id === config.templateId);
  
  const presetLabels: Record<AutoEditPreset, string> = {
    'Ad15': '15초',
    'Ad30': '30초',
    'Full': '전체',
  };

  const styleLabels: Record<AutoEditStyle, string> = {
    'minimal': '미니멀',
    'dynamic': '다이나믹',
    'cinematic': '시네마틱',
  };

  return {
    label: `${presetLabels[config.preset]} / ${styleLabels[config.style]}`,
    description: template ? template.description : '템플릿 없음',
    estimatedDuration: template ? template.totalDurationTarget : 30,
  };
}

/**
 * 기본 변형 구성 세트 생성
 */
export function getDefaultVariationConfigs(): BatchVariationConfig[] {
  return [
    {
      id: '1',
      preset: 'Ad15',
      style: 'dynamic',
      templateId: 'hook-feature-cta',
    },
    {
      id: '2',
      preset: 'Ad30',
      style: 'dynamic',
      templateId: 'problem-solution',
    },
    {
      id: '3',
      preset: 'Full',
      style: 'cinematic',
      templateId: 'storytelling',
    },
  ];
}
