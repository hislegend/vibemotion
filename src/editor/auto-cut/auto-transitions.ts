// 자동 전환효과 결정 로직
import { SegmentLabel } from '../../types/video-segment';
import { TransitionType } from '../../types/viral-template';
import { AutoEditStyle, STYLE_TRANSITION_DURATIONS } from '../../types/auto-edit';

// 스타일별 사용 가능한 전환효과 풀
const STYLE_TRANSITION_POOLS: Record<AutoEditStyle, TransitionType[]> = {
  minimal: ['fade'],
  dynamic: ['fade', 'zoom-in', 'zoom-out', 'slide-left', 'slide-right'],
  cinematic: ['fade', 'zoom-in', 'zoom-out'], // 느린 전환 위주
};

// 라벨별 기본 전환효과 매핑
const LABEL_TRANSITION_MAP: Record<SegmentLabel, TransitionType> = {
  hook: 'zoom-in',          // 훅은 줌인으로 시선 집중
  feature: 'slide-left',    // 특징은 슬라이드
  demo: 'fade',             // 데모는 부드러운 페이드
  cta: 'zoom-out',          // CTA는 줌아웃으로 강조
  testimonial: 'fade',      // 리뷰는 페이드
  broll: 'slide-right',     // B-roll은 슬라이드
  silence: 'none',          // 침묵 구간은 전환 없음
  uhm: 'none',              // 어... 구간도 전환 없음
  outro: 'fade',            // 아웃트로
  logo: 'fade',             // 로고/브랜딩
  transition: 'fade',       // 자연 전환 구간
  unknown: 'fade',          // 미분류
};

// 스타일별 전환효과 수정자
const STYLE_MODIFIERS: Record<AutoEditStyle, Partial<Record<SegmentLabel, TransitionType>>> = {
  minimal: {
    hook: 'fade',
    feature: 'fade',
    cta: 'fade',
    broll: 'fade',
  },
  dynamic: {
    // 기본 매핑 사용 - 다양한 전환효과 적용
  },
  cinematic: {
    hook: 'fade',
    feature: 'fade',
    demo: 'fade',
    cta: 'zoom-out',
    testimonial: 'fade',
    broll: 'fade',
  },
};

// 마지막으로 사용된 전환효과 추적 (연속 방지)
let lastUsedTransition: TransitionType = 'none';

/**
 * 전환효과 풀에서 이전과 다른 전환효과 선택
 */
export function selectVariedTransition(
  style: AutoEditStyle,
  preferredTransition: TransitionType,
  avoidTransition?: TransitionType
): TransitionType {
  const pool = STYLE_TRANSITION_POOLS[style];
  
  // minimal은 항상 fade
  if (style === 'minimal') {
    return 'fade';
  }
  
  // 선호 전환효과가 회피 대상과 같으면 다른 것 선택
  if (preferredTransition === avoidTransition && pool.length > 1) {
    const alternatives = pool.filter(t => t !== avoidTransition);
    return alternatives[Math.floor(Math.random() * alternatives.length)] || 'fade';
  }
  
  return preferredTransition;
}

/**
 * 주어진 라벨과 스타일에 따라 적절한 전환효과 결정
 */
export function determineTransitionIn(
  label: SegmentLabel,
  style: AutoEditStyle = 'dynamic',
  prevTransition?: TransitionType
): TransitionType {
  const styleModifier = STYLE_MODIFIERS[style];
  
  // 스타일별 수정자가 있으면 사용, 없으면 기본 매핑
  let transition: TransitionType;
  if (styleModifier && styleModifier[label]) {
    transition = styleModifier[label]!;
  } else {
    transition = LABEL_TRANSITION_MAP[label] || 'fade';
  }
  
  // 연속 방지: 이전과 같은 전환효과면 다른 것 선택
  if (prevTransition && transition === prevTransition && style === 'dynamic') {
    transition = selectVariedTransition(style, transition, prevTransition);
  }
  
  lastUsedTransition = transition;
  return transition;
}

/**
 * 두 라벨 사이의 전환효과 결정 (이전 라벨 → 다음 라벨)
 */
export function determineTransitionBetween(
  fromLabel: SegmentLabel,
  toLabel: SegmentLabel,
  style: AutoEditStyle = 'dynamic',
  prevTransition?: TransitionType
): TransitionType {
  // 특수 케이스: silence나 uhm에서 전환 시
  if (fromLabel === 'silence' || fromLabel === 'uhm') {
    return 'none';
  }
  
  // 스타일이 minimal이면 항상 fade
  if (style === 'minimal') {
    return 'fade';
  }
  
  // cinematic 스타일: 주로 fade, 하지만 CTA는 zoom-out
  if (style === 'cinematic') {
    if (toLabel === 'cta') {
      return 'zoom-out';
    }
    return 'fade';
  }
  
  // dynamic 스타일: 다음 라벨에 따라 결정 + 연속 방지
  return determineTransitionIn(toLabel, style, prevTransition);
}

/**
 * 전환효과 추적 리셋 (새 편집 세션 시작 시 호출)
 */
export function resetTransitionTracking(): void {
  lastUsedTransition = 'none';
}

/**
 * 스타일에 따른 전환 시간 반환 (초)
 */
export function getTransitionDuration(style: AutoEditStyle): number {
  return STYLE_TRANSITION_DURATIONS[style];
}

/**
 * 첫 번째 클립과 마지막 클립의 특수 전환효과
 */
export function getEdgeTransitions(style: AutoEditStyle): {
  firstClipIn: TransitionType;
  lastClipOut: TransitionType;
} {
  switch (style) {
    case 'minimal':
      return { firstClipIn: 'fade', lastClipOut: 'fade' };
    case 'dynamic':
      return { firstClipIn: 'zoom-in', lastClipOut: 'zoom-out' };
    case 'cinematic':
      return { firstClipIn: 'fade', lastClipOut: 'fade' };
    default:
      return { firstClipIn: 'fade', lastClipOut: 'fade' };
  }
}

/**
 * Ken Burns 효과 자동 결정
 */
export function determineKenBurnsEffect(
  label: SegmentLabel,
  index: number,
  totalClips: number
): 'none' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' {
  // 첫 클립은 줌인
  if (index === 0) {
    return 'zoom-in';
  }
  
  // 마지막 클립은 줌아웃
  if (index === totalClips - 1) {
    return 'zoom-out';
  }
  
  // hook은 줌인
  if (label === 'hook') {
    return 'zoom-in';
  }
  
  // cta는 줌아웃
  if (label === 'cta') {
    return 'zoom-out';
  }
  
  // 나머지는 교대로 팬
  return index % 2 === 0 ? 'pan-left' : 'pan-right';
}
