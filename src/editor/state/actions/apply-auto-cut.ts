// Phase 2: 자동 컷 적용 액션
// CutSection[]을 받아 타임라인에 점프컷으로 적용

import { EditorState } from '../types';
import { CutSection } from '@/types/video-segment';
import { VideoItem } from '@/editor/items/video/video-item-type';
import { generateRandomId } from '@/editor/utils/generate-random-id';

interface ApplyAutoCutParams {
  state: EditorState;
  videoItemId: string;
  sections: CutSection[];
  fps: number;
}

/**
 * 자동 컷 분석 결과를 타임라인에 적용합니다.
 * 원본 VideoItem을 여러 개의 분할된 VideoItem으로 변환합니다.
 * 
 * @returns 업데이트된 EditorState
 */
export function applyAutoCut({
  state,
  videoItemId,
  sections,
  fps,
}: ApplyAutoCutParams): EditorState {
  if (sections.length === 0) {
    console.warn('[applyAutoCut] 적용할 섹션이 없습니다.');
    return state;
  }

  // 1. 원본 VideoItem 찾기
  const originalItem = state.undoableState.items[videoItemId] as VideoItem | undefined;
  if (!originalItem || originalItem.type !== 'video') {
    console.error('[applyAutoCut] VideoItem을 찾을 수 없습니다:', videoItemId);
    return state;
  }

  // 2. 원본 아이템이 속한 트랙 찾기
  const trackIndex = state.undoableState.tracks.findIndex(
    track => track.items.includes(videoItemId)
  );
  if (trackIndex === -1) {
    console.error('[applyAutoCut] 트랙을 찾을 수 없습니다.');
    return state;
  }

  const track = state.undoableState.tracks[trackIndex];
  const originalItemIndex = track.items.indexOf(videoItemId);

  // 3. 새로운 VideoItem들 생성
  const newItems: Record<string, VideoItem> = {};
  const newItemIds: string[] = [];
  
  let currentFrom = originalItem.from; // 타임라인에서의 시작 위치
  const totalSections = sections.length;

  for (let i = 0; i < totalSections; i++) {
    const section = sections[i];
    const newId = generateRandomId(8);
    
    // 프레임 계산
    const durationInFrames = Math.round(section.durationInSeconds * fps);
    
    // 첫 번째 클립: 시작 페이드, 마지막 클립: 종료 페이드
    const isFirst = i === 0;
    const isLast = i === totalSections - 1;
    
    const newItem: VideoItem = {
      ...originalItem,
      id: newId,
      from: currentFrom,
      durationInFrames,
      videoStartFromInSeconds: section.start, // 원본 영상에서의 시작점
      // 전환 효과 자동 적용
      transitionIn: isFirst ? 'fade' : 'none',
      transitionOut: isLast ? 'fade' : 'none',
      transitionDurationInSeconds: 0.3,
    };
    
    newItems[newId] = newItem;
    newItemIds.push(newId);
    
    // 다음 아이템의 시작 위치 업데이트
    currentFrom += durationInFrames;
  }

  // 4. 트랙 업데이트: 원본 아이템을 새 아이템들로 교체
  const updatedTrackItems = [
    ...track.items.slice(0, originalItemIndex),
    ...newItemIds,
    ...track.items.slice(originalItemIndex + 1),
  ];

  const updatedTracks = state.undoableState.tracks.map((t, idx) => 
    idx === trackIndex 
      ? { ...t, items: updatedTrackItems }
      : t
  );

  // 5. 아이템 목록 업데이트: 원본 제거, 새 아이템들 추가
  const { [videoItemId]: removedItem, ...remainingItems } = state.undoableState.items;
  const updatedItems = { ...remainingItems, ...newItems };

  // 6. 새 상태 반환
  const newState: EditorState = {
    ...state,
    undoableState: {
      ...state.undoableState,
      tracks: updatedTracks,
      items: updatedItems,
    },
    selectedItems: newItemIds, // 새로 생성된 아이템들 선택
  };

  console.log(`[applyAutoCut] ${sections.length}개 섹션으로 분할 완료`);
  
  return newState;
}

/**
 * 자동 컷 적용 전 미리보기용 정보를 계산합니다.
 */
export function calculateAutoCutPreview(
  sections: CutSection[],
  fps: number
): {
  totalDurationSeconds: number;
  totalFrames: number;
  sectionCount: number;
} {
  const totalDurationSeconds = sections.reduce(
    (sum, sec) => sum + sec.durationInSeconds,
    0
  );
  
  return {
    totalDurationSeconds,
    totalFrames: Math.round(totalDurationSeconds * fps),
    sectionCount: sections.length,
  };
}
