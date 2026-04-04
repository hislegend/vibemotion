// 자동 텍스트 오버레이 로직
import { SegmentLabel, VideoSegment, VideoSegmentAnalysis } from '../../types/video-segment';
import { TEXT_STYLE_PRESETS, TextStylePreset } from '../../types/viral-template';

export interface AutoTextOverlay {
  id: string;
  content: string;
  startTime: number;      // 초
  duration: number;       // 초
  label: SegmentLabel;
  style: TextStylePreset;
  position: {
    x: number;  // 0-1 비율
    y: number;  // 0-1 비율
  };
}

// 라벨별 기본 텍스트 템플릿
const DEFAULT_TEXT_TEMPLATES: Partial<Record<SegmentLabel, string[]>> = {
  hook: [
    '잠깐!',
    '이거 몰랐죠?',
    '충격적인 사실',
    '알고 계셨나요?',
    '꼭 보세요!',
  ],
  cta: [
    '지금 바로 확인!',
    '링크는 프로필에!',
    '좋아요 & 저장!',
    '더 알아보기 ↓',
    '놓치지 마세요!',
  ],
  feature: [
    '핵심 포인트',
    '주목!',
    '이게 핵심!',
  ],
};

/**
 * 랜덤 기본 텍스트 선택
 */
function getRandomDefaultText(label: SegmentLabel): string | null {
  const templates = DEFAULT_TEXT_TEMPLATES[label];
  if (!templates || templates.length === 0) return null;
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * 위치 비율을 position 문자열에 따라 결정
 */
function getPositionFromPreset(position: 'top' | 'center' | 'bottom'): { x: number; y: number } {
  switch (position) {
    case 'top':
      return { x: 0.5, y: 0.15 };
    case 'center':
      return { x: 0.5, y: 0.5 };
    case 'bottom':
      return { x: 0.5, y: 0.85 };
    default:
      return { x: 0.5, y: 0.5 };
  }
}

/**
 * 분석 결과에서 자동 텍스트 오버레이 생성
 */
export function generateAutoTextOverlays(
  analysis: VideoSegmentAnalysis,
  customTexts?: Partial<Record<SegmentLabel, string>>
): AutoTextOverlay[] {
  const overlays: AutoTextOverlay[] = [];
  
  // Hook과 CTA 세그먼트에만 텍스트 추가
  const targetLabels: SegmentLabel[] = ['hook', 'cta'];
  
  analysis.segments.forEach((segment, index) => {
    if (!targetLabels.includes(segment.label)) return;
    if (segment.keep === false) return; // undefined도 허용
    
    // 커스텀 텍스트가 있으면 사용, 없으면 기본 템플릿
    const content = customTexts?.[segment.label] || getRandomDefaultText(segment.label);
    if (!content) return;
    
    const style = TEXT_STYLE_PRESETS[segment.label];
    const position = getPositionFromPreset(style.position);
    
    // 텍스트 표시 시간: 세그먼트 시작 후 0.5초부터 세그먼트 끝 0.5초 전까지
    const textStart = segment.start + 0.3;
    const textEnd = segment.end - 0.3;
    const textDuration = Math.max(1, textEnd - textStart);
    
    overlays.push({
      id: `auto-text-${segment.label}-${index}`,
      content,
      startTime: textStart,
      duration: textDuration,
      label: segment.label,
      style,
      position,
    });
  });
  
  return overlays;
}

/**
 * 특정 라벨의 첫 번째 세그먼트에만 텍스트 추가
 */
export function generateTextForFirstSegmentOfLabel(
  analysis: VideoSegmentAnalysis,
  label: SegmentLabel,
  text: string
): AutoTextOverlay | null {
  const segment = analysis.segments.find(s => s.label === label && s.keep !== false);
  if (!segment) return null;
  
  const style = TEXT_STYLE_PRESETS[label];
  const position = getPositionFromPreset(style.position);
  
  const textStart = segment.start + 0.3;
  const textDuration = Math.min(3, segment.end - segment.start - 0.5);
  
  if (textDuration < 0.5) return null;
  
  return {
    id: `auto-text-${label}-first`,
    content: text,
    startTime: textStart,
    duration: textDuration,
    label,
    style,
    position,
  };
}

/**
 * 영상 마지막에 CTA 텍스트 추가
 */
export function generateEndCTAOverlay(
  duration: number,
  text: string = '지금 바로 확인!'
): AutoTextOverlay {
  const style = TEXT_STYLE_PRESETS.cta;
  const position = getPositionFromPreset(style.position);
  
  // 마지막 3초 동안 표시
  const ctaDuration = Math.min(3, duration * 0.2);
  const ctaStart = duration - ctaDuration - 0.5;
  
  return {
    id: 'auto-text-end-cta',
    content: text,
    startTime: ctaStart,
    duration: ctaDuration,
    label: 'cta',
    style,
    position,
  };
}
