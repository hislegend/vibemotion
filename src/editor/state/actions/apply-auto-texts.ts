// 자동 텍스트 오버레이 적용 액션
import { EditorState } from '../types';
import { VideoSegmentAnalysis } from '@/types/video-segment';
import { generateAutoTextOverlays, AutoTextOverlay } from '../../auto-cut/auto-texts';
import { TEXT_STYLE_PRESETS } from '@/types/viral-template';

export interface ApplyAutoTextsParams {
  state: EditorState;
  analysis: VideoSegmentAnalysis;
  fps: number;
  compositionWidth: number;
  compositionHeight: number;
  customTexts?: Partial<Record<string, string>>;
}

/**
 * 분석 결과를 기반으로 자동 텍스트 오버레이 생성 및 적용
 */
export function applyAutoTexts({
  state,
  analysis,
  fps,
  compositionWidth,
  compositionHeight,
  customTexts,
}: ApplyAutoTextsParams): EditorState {
  // 텍스트 오버레이 생성
  let overlays = generateAutoTextOverlays(analysis, customTexts as any);
  
  // 분석 결과가 없으면 기본 Hook/CTA 텍스트 생성
  if (overlays.length === 0) {
    const totalDuration = Math.max(analysis.duration || 15, 5); // 최소 5초 보장
    
    // 기본 Hook 텍스트 (영상 시작부)
    const hookDuration = Math.max(1.5, Math.min(3, totalDuration * 0.2));
    const hookOverlay: AutoTextOverlay = {
      id: 'fallback-hook',
      content: '잠깐! 👀',
      startTime: 0.5,
      duration: hookDuration,
      label: 'hook',
      style: TEXT_STYLE_PRESETS.hook,
      position: { x: 0.5, y: 0.15 },
    };
    
    // 기본 CTA 텍스트 (영상 끝부분) - 최소 1.5초 보장
    const ctaDuration = Math.max(1.5, Math.min(3.5, totalDuration * 0.25));
    const ctaStartTime = Math.max(totalDuration * 0.6, totalDuration - ctaDuration - 0.5);
    const ctaOverlay: AutoTextOverlay = {
      id: 'fallback-cta',
      content: '지금 바로 확인!',
      startTime: ctaStartTime,
      duration: ctaDuration,
      label: 'cta',
      style: TEXT_STYLE_PRESETS.cta,
      position: { x: 0.5, y: 0.85 },
    };
    
    overlays = [hookOverlay, ctaOverlay];
  }

  // 새 텍스트 아이템들 생성
  const newItems: Record<string, any> = {};
  const newTrackItems: string[] = [];
  
  overlays.forEach((overlay, index) => {
    const textItemId = `auto-text-${Date.now()}-${index}`;
    const style = TEXT_STYLE_PRESETS[overlay.label];
    
    // duration이 0이면 Remotion 에러 발생하므로 최소값 보장
    const safeDuration = Math.max(overlay.duration || 1.5, 0.5);
    const safeStartTime = Math.max(overlay.startTime || 0, 0);
    
    const fromFrame = Math.max(0, Math.round(safeStartTime * fps));
    const durationFrames = Math.max(1, Math.round(safeDuration * fps)); // 최소 1프레임
    
    // 위치 계산
    const left = overlay.position.x * compositionWidth - 200; // 중앙 정렬 고려
    const top = overlay.position.y * compositionHeight - 50;
    
    const isBold = style.fontWeight === '700' || style.fontWeight === 'bold';
    
    const textItem = {
      id: textItemId,
      type: 'text' as const,
      from: fromFrame,
      durationInFrames: durationFrames,
      text: overlay.content,
      fontFamily: 'Noto Sans KR',
      fontSize: style.fontSize,
      fontStyle: {
        variant: 'normal',
        weight: style.fontWeight || '400',
      },
      color: style.color,
      left,
      top,
      width: 400,
      height: 120,
      opacity: 1,
      rotation: 0,
      align: 'center' as const,
      lineHeight: 1.2,
      letterSpacing: 0,
      resizeOnEdit: false,
      direction: 'ltr' as const,
      strokeWidth: 0,
      strokeColor: '#000000',
      isBold,
      isItalic: false,
      isUnderline: false,
      shadowEnabled: style.shadowEnabled ?? false,
      shadowColor: 'rgba(0, 0, 0, 0.8)',
      shadowBlur: 10,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      backgroundColor: style.backgroundColor || 'transparent',
      backgroundPadding: 8,
      fadeInDurationInSeconds: 0.2,
      fadeOutDurationInSeconds: 0.2,
      isDraggingInTimeline: false,
    };
    
    newItems[textItemId] = textItem;
    newTrackItems.push(textItemId);
  });

  // 텍스트 트랙 찾기 또는 생성
  let textTrack = state.undoableState.tracks.find(t => t.category === 'text');
  let updatedTracks = [...state.undoableState.tracks];
  
  if (!textTrack) {
    textTrack = {
      id: `text-track-${Date.now()}`,
      category: 'text',
      items: [],
      hidden: false,
      muted: false,
    };
    updatedTracks.push(textTrack);
  }
  
  // 트랙에 아이템 추가
  updatedTracks = updatedTracks.map(track => {
    if (track.id === textTrack!.id) {
      return {
        ...track,
        items: [...track.items, ...newTrackItems],
      };
    }
    return track;
  });

  return {
    ...state,
    undoableState: {
      ...state.undoableState,
      items: {
        ...state.undoableState.items,
        ...newItems as any,
      },
      tracks: updatedTracks,
    },
  };
}

/**
 * 특정 위치에 수동으로 텍스트 오버레이 추가
 */
export function addTextOverlayAtTime({
  state,
  text,
  startTimeSeconds,
  durationSeconds,
  style,
  fps,
  compositionWidth,
  compositionHeight,
}: {
  state: EditorState;
  text: string;
  startTimeSeconds: number;
  durationSeconds: number;
  style: 'hook' | 'cta' | 'feature';
  fps: number;
  compositionWidth: number;
  compositionHeight: number;
}): EditorState {
  const textItemId = `manual-text-${Date.now()}`;
  const stylePreset = TEXT_STYLE_PRESETS[style];
  
  const fromFrame = Math.round(startTimeSeconds * fps);
  const durationFrames = Math.round(durationSeconds * fps);
  
  // 위치 계산
  const positionY = stylePreset.position === 'top' ? 0.15 : stylePreset.position === 'bottom' ? 0.85 : 0.5;
  const left = compositionWidth * 0.5 - 200;
  const top = compositionHeight * positionY - 50;
  
  const isBold = stylePreset.fontWeight === '700' || stylePreset.fontWeight === 'bold';
  
  const textItem = {
    id: textItemId,
    type: 'text' as const,
    from: fromFrame,
    durationInFrames: durationFrames,
    text,
    fontFamily: 'Noto Sans KR',
    fontSize: stylePreset.fontSize,
    fontStyle: {
      variant: 'normal',
      weight: stylePreset.fontWeight || '400',
    },
    color: stylePreset.color,
    left,
    top,
    width: 400,
    height: 120,
    opacity: 1,
    rotation: 0,
    align: 'center' as const,
    lineHeight: 1.2,
    letterSpacing: 0,
    resizeOnEdit: false,
    direction: 'ltr' as const,
    strokeWidth: 0,
    strokeColor: '#000000',
    isBold,
    isItalic: false,
    isUnderline: false,
    shadowEnabled: stylePreset.shadowEnabled ?? false,
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    shadowBlur: 10,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    backgroundColor: stylePreset.backgroundColor || 'transparent',
    backgroundPadding: 8,
    fadeInDurationInSeconds: 0.2,
    fadeOutDurationInSeconds: 0.2,
    isDraggingInTimeline: false,
  };

  // 텍스트 트랙 찾기 또는 생성
  let textTrack = state.undoableState.tracks.find(t => t.category === 'text');
  let updatedTracks = [...state.undoableState.tracks];
  
  if (!textTrack) {
    textTrack = {
      id: `text-track-${Date.now()}`,
      category: 'text',
      items: [],
      hidden: false,
      muted: false,
    };
    updatedTracks.push(textTrack);
  }
  
  updatedTracks = updatedTracks.map(track => {
    if (track.id === textTrack!.id) {
      return {
        ...track,
        items: [...track.items, textItemId],
      };
    }
    return track;
  });

  return {
    ...state,
    undoableState: {
      ...state.undoableState,
      items: {
        ...state.undoableState.items,
        [textItemId]: textItem as any,
      },
      tracks: updatedTracks,
    },
  };
}
