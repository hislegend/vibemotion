// 바이럴 템플릿 적용 액션
import { EditorState } from '../types';
import { VideoSegmentAnalysis } from '@/types/video-segment';
import { ViralTemplate, TemplateSection } from '@/types/viral-template';
import { STYLE_TRANSITION_DURATIONS } from '@/types/auto-edit';

export interface ApplyTemplateParams {
  state: EditorState;
  template: ViralTemplate;
  analysis: VideoSegmentAnalysis;
  fps: number;
}

/**
 * 바이럴 템플릿을 영상에 적용
 * 분석 결과에서 각 섹션에 맞는 세그먼트를 찾아 재구성
 */
export function applyTemplate({
  state,
  template,
  analysis,
  fps,
}: ApplyTemplateParams): EditorState {
  const targetDuration = template.totalDurationTarget;
  const transitionDuration = STYLE_TRANSITION_DURATIONS[template.style];
  
  // 각 템플릿 섹션에 맞는 세그먼트 매칭
  const matchedSegments: Array<{
    section: TemplateSection;
    segment: typeof analysis.segments[0] | null;
    targetDuration: number;
  }> = [];

  template.structure.forEach((section) => {
    const sectionDuration = targetDuration * section.durationRatio;
    
    // 해당 라벨의 세그먼트 중 가장 점수 높은 것 선택
    const matchingSegments = analysis.segments
      .filter(seg => seg.label === section.type && seg.keep !== false)
      .sort((a, b) => b.score - a.score);
    
    matchedSegments.push({
      section,
      segment: matchingSegments[0] || null,
      targetDuration: sectionDuration,
    });
  });

  // 현재 비디오 아이템들 가져오기
  const videoItems = Object.values(state.undoableState.items)
    .filter(item => item.type === 'video')
    .sort((a, b) => a.from - b.from);

  if (videoItems.length === 0) {
    console.warn('비디오 아이템이 없습니다');
    return state;
  }

  // 원본 비디오 아이템 (첫 번째)
  const originalItem = videoItems[0];
  const originalAssetId = (originalItem as any).assetId;
  
  // 새 아이템들 생성
  const newItems: Record<string, any> = {};
  const newTrackItems: string[] = [];
  let currentFrame = 0;

  matchedSegments.forEach((match, index) => {
    if (!match.segment) {
      // 매칭되는 세그먼트가 없으면 건너뛰기
      return;
    }

    const itemId = `template-item-${Date.now()}-${index}`;
    const durationFrames = Math.round(match.targetDuration * fps);
    
    // 실제 세그먼트 시간 vs 목표 시간
    const segmentDuration = match.segment.end - match.segment.start;
    const trimStart = match.segment.start;
    
    // 전환효과 설정
    let transitionIn = match.section.transition || 'fade';
    let transitionOut = 'none';
    
    // 마지막 아이템은 아웃 전환
    if (index === matchedSegments.length - 1) {
      transitionOut = template.style === 'cinematic' ? 'fade' : 'zoom-out';
    }

    const newItem = {
      ...originalItem,
      id: itemId,
      assetId: originalAssetId,
      from: currentFrame,
      durationInFrames: durationFrames,
      trimStartInSeconds: trimStart,
      transitionIn,
      transitionOut,
      transitionDurationInSeconds: transitionDuration,
      kenBurnsEffect: match.section.kenBurns || 'none',
      kenBurnsIntensity: 0.15,
    };

    newItems[itemId] = newItem;
    newTrackItems.push(itemId);
    currentFrame += durationFrames;
  });

  // 기존 비디오 트랙 업데이트
  const videoTrack = state.undoableState.tracks.find(t => t.category === 'video');
  if (!videoTrack) {
    return state;
  }

  const updatedTracks = state.undoableState.tracks.map(track => {
    if (track.id === videoTrack.id) {
      return {
        ...track,
        items: newTrackItems,
      };
    }
    return track;
  });

  // 기존 비디오 아이템 제거하고 새 아이템 추가
  const filteredItems = Object.fromEntries(
    Object.entries(state.undoableState.items)
      .filter(([_, item]) => item.type !== 'video')
  );

  return {
    ...state,
    undoableState: {
      ...state.undoableState,
      items: {
        ...filteredItems,
        ...newItems,
      },
      tracks: updatedTracks,
    },
  };
}

/**
 * 템플릿 미리보기 정보 계산
 */
export function calculateTemplatePreview(
  template: ViralTemplate,
  analysis: VideoSegmentAnalysis
): {
  estimatedDuration: number;
  matchedSections: number;
  unmatchedSections: string[];
} {
  let matchedSections = 0;
  const unmatchedSections: string[] = [];

  template.structure.forEach((section) => {
    const hasMatch = analysis.segments.some(
      seg => seg.label === section.type && seg.keep !== false
    );
    
    if (hasMatch) {
      matchedSections++;
    } else {
      unmatchedSections.push(section.type);
    }
  });

  return {
    estimatedDuration: template.totalDurationTarget,
    matchedSections,
    unmatchedSections,
  };
}
