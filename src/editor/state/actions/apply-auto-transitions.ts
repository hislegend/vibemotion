// 자동 전환효과 적용 액션
import { EditorState } from '../types';
import { VideoSegmentAnalysis } from '@/types/video-segment';
import { AutoEditStyle, STYLE_TRANSITION_DURATIONS } from '@/types/auto-edit';
import { 
  determineTransitionBetween, 
  getEdgeTransitions,
  determineKenBurnsEffect,
  resetTransitionTracking
} from '../../auto-cut/auto-transitions';
import { TransitionType } from '@/types/viral-template';

export interface ApplyAutoTransitionsParams {
  state: EditorState;
  analysis: VideoSegmentAnalysis;
  style: AutoEditStyle;
  fps: number;
}

/**
 * 분석 결과를 기반으로 각 비디오 아이템에 전환효과 자동 적용
 */
export function applyAutoTransitions({
  state,
  analysis,
  style,
  fps,
}: ApplyAutoTransitionsParams): EditorState {
  // 전환효과 추적 리셋
  resetTransitionTracking();
  
  const transitionDuration = STYLE_TRANSITION_DURATIONS[style];
  const edgeTransitions = getEdgeTransitions(style);
  
  // 비디오 아이템들 가져오기
  const videoItems = Object.values(state.undoableState.items)
    .filter(item => item.type === 'video')
    .sort((a, b) => a.from - b.from);

  if (videoItems.length === 0) {
    return state;
  }

  // 각 아이템에 대해 전환효과 적용
  const updatedItems = { ...state.undoableState.items };
  let prevTransition: TransitionType = 'none';
  
  videoItems.forEach((item, index) => {
    // 해당 시간대의 세그먼트 찾기
    const itemStartSeconds = item.from / fps;
    const matchingSegment = analysis.segments.find(
      seg => seg.start <= itemStartSeconds && seg.end > itemStartSeconds
    );
    
    const label = matchingSegment?.label || 'unknown';
    const prevLabel = index > 0 
      ? analysis.segments.find(seg => {
          const prevItemStart = videoItems[index - 1].from / fps;
          return seg.start <= prevItemStart && seg.end > prevItemStart;
        })?.label || 'unknown'
      : 'unknown';
    
    // 전환효과 결정 (이전 전환효과 전달로 연속 방지)
    let transitionIn = determineTransitionBetween(prevLabel, label, style, prevTransition);
    let transitionOut: TransitionType = 'none';
    
    // 첫 번째 클립
    if (index === 0) {
      transitionIn = edgeTransitions.firstClipIn;
    }
    
    // 마지막 클립
    if (index === videoItems.length - 1) {
      transitionOut = edgeTransitions.lastClipOut;
    }
    
    // Ken Burns 효과 결정
    const kenBurnsEffect = determineKenBurnsEffect(label, index, videoItems.length);
    
    // 아이템 업데이트
    updatedItems[item.id] = {
      ...item,
      transitionIn,
      transitionOut,
      transitionDurationInSeconds: transitionDuration,
      kenBurnsEffect,
      kenBurnsIntensity: 0.15,
    } as any;
    
    prevTransition = transitionIn;
  });

  return {
    ...state,
    undoableState: {
      ...state.undoableState,
      items: updatedItems,
    },
  };
}

/**
 * 스타일에 따라 모든 비디오 아이템에 일괄 전환효과 적용 (분석 없이)
 * Dynamic 스타일에서는 다양한 전환효과를 번갈아 적용
 */
export function applyUniformTransitions({
  state,
  style,
  fps,
}: {
  state: EditorState;
  style: AutoEditStyle;
  fps: number;
}): EditorState {
  // 전환효과 추적 리셋
  resetTransitionTracking();
  
  const transitionDuration = STYLE_TRANSITION_DURATIONS[style];
  const edgeTransitions = getEdgeTransitions(style);
  
  const videoItems = Object.values(state.undoableState.items)
    .filter(item => item.type === 'video')
    .sort((a, b) => a.from - b.from);

  if (videoItems.length === 0) {
    return state;
  }

  const updatedItems = { ...state.undoableState.items };
  
  // Dynamic 스타일용 전환효과 순환 배열
  const dynamicTransitions: TransitionType[] = ['slide-left', 'zoom-in', 'slide-right', 'fade', 'zoom-out'];
  
  videoItems.forEach((item, index) => {
    let transitionIn: TransitionType;
    let transitionOut: TransitionType = 'none';
    
    // 첫 번째 클립
    if (index === 0) {
      transitionIn = edgeTransitions.firstClipIn;
    } else if (style === 'minimal') {
      transitionIn = 'fade';
    } else if (style === 'dynamic') {
      // Dynamic: 전환효과 순환
      transitionIn = dynamicTransitions[(index - 1) % dynamicTransitions.length];
    } else {
      // Cinematic: 주로 fade
      transitionIn = 'fade';
    }
    
    // 마지막 클립
    if (index === videoItems.length - 1) {
      transitionOut = edgeTransitions.lastClipOut;
    }
    
    // Ken Burns 효과 추가 (분석 없이도 위치 기반 적용)
    const kenBurnsEffect = determineKenBurnsEffect('unknown', index, videoItems.length);
    
    updatedItems[item.id] = {
      ...item,
      transitionIn,
      transitionOut,
      transitionDurationInSeconds: transitionDuration,
      kenBurnsEffect,
      kenBurnsIntensity: 0.12,
    } as any;
  });

  return {
    ...state,
    undoableState: {
      ...state.undoableState,
      items: updatedItems,
    },
  };
}
