/**
 * 뉴스 씬 데이터를 에디터 초기 상태로 변환하는 유틸리티
 * Phase 3: 뉴스 모드 → 에디터 연동
 * 
 * 🆕 이미지 1개 + 대사 N개 구조 지원
 */

import type { EditorStarterAsset } from '../assets/assets';
import type { EditorStarterItem } from '../items/item-type';
import type { TrackType, UndoableState } from './types';
import { DEFAULT_FPS } from '../constants';
import type { NewsScene, NewsAspectRatio, NewsStory, DialogueBlock } from '@/types/news-story';

const COMPOSITION_KEY = 'remotion-editor-composition';
const NEWS_SCENES_KEY = 'remotion-editor-news-scenes';

// 대사 블록 ID 생성
const generateBlockId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 컴포지션 크기 저장
export function saveCompositionSize(width: number, height: number): void {
  try {
    localStorage.setItem(COMPOSITION_KEY, JSON.stringify({ width, height }));
  } catch (e) {
    console.error('Failed to save composition size:', e);
  }
}

// 컴포지션 크기 로드
export function getCompositionSize(): { width: number; height: number } | null {
  try {
    const stored = localStorage.getItem(COMPOSITION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('Failed to get composition size:', e);
    return null;
  }
}

// 뉴스 씬 데이터 저장 (에디터에서 복원용)
export function saveNewsScenesForEditor(scenes: NewsScene[]): void {
  try {
    localStorage.setItem(NEWS_SCENES_KEY, JSON.stringify(scenes));
  } catch (e) {
    console.error('Failed to save news scenes:', e);
  }
}

// 뉴스 씬 데이터 로드
export function getNewsScenesForEditor(): NewsScene[] {
  try {
    const stored = localStorage.getItem(NEWS_SCENES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to get news scenes:', e);
    return [];
  }
}

/**
 * 뉴스 씬 배열을 에디터 UndoableState로 변환
 * 🆕 이미지 1개 + 대사 N개 구조 지원
 */
export function createNewsEditorState(
  scenes: NewsScene[],
  aspectRatio: NewsAspectRatio,
  fps: number = DEFAULT_FPS
): {
  assets: Record<string, EditorStarterAsset>;
  items: Record<string, EditorStarterItem>;
  tracks: TrackType[];
  compositionWidth: number;
  compositionHeight: number;
} {
  const [width, height] = aspectRatio === '16:9' ? [1920, 1080] : [1080, 1920];

  const assets: Record<string, EditorStarterAsset> = {};
  const items: Record<string, EditorStarterItem> = {};

  // 트랙 구조: 오디오(상단) → 자막(중간) → 이미지(하단)
  const audioTrack: TrackType = {
    id: 'track-audio',
    items: [],
    hidden: false,
    muted: false,
    category: 'audio',
  };

  const subtitleTrack: TrackType = {
    id: 'track-subtitles',
    items: [],
    hidden: false,
    muted: false,
    category: 'text',
  };

  const imageTrack: TrackType = {
    id: 'track-images',
    items: [],
    hidden: false,
    muted: false,
    category: 'video',
  };

  let currentFrame = 0;

  scenes.forEach((scene, sceneIndex) => {
    // 🆕 씬의 총 길이 = 모든 대사 블록 길이 합
    const totalDuration = scene.dialogueBlocks.reduce((sum, b) => sum + b.duration, 0);
    const totalFrames = Math.round(totalDuration * fps);

    // 1. 이미지 에셋 + 아이템 (씬당 한 번만)
    if (scene.imageUrl && totalFrames > 0) {
      const imageAssetId = `asset-image-${scene.id}`;
      const imageItemId = `item-image-${scene.id}`;

      assets[imageAssetId] = {
        id: imageAssetId,
        type: 'image',
        filename: `scene-${sceneIndex + 1}.png`,
        remoteUrl: scene.imageUrl,
        remoteFileKey: null,
        size: 0,
        mimeType: 'image/png',
        width,
        height,
      } as EditorStarterAsset;

      items[imageItemId] = {
        id: imageItemId,
        type: 'image',
        assetId: imageAssetId,
        from: currentFrame,
        durationInFrames: totalFrames,
        left: 0,
        top: 0,
        width,
        height,
        opacity: 1,
        rotation: 0,
        borderRadius: 0,
        keepAspectRatio: true,
        fadeInDurationInSeconds: 0.3,
        fadeOutDurationInSeconds: 0.3,
        isDraggingInTimeline: false,
      } as EditorStarterItem;

      imageTrack.items.push(imageItemId);
    }

    // 2. 각 대사 블록 → 개별 자막/오디오 아이템
    let blockStartFrame = currentFrame;
    
    scene.dialogueBlocks.forEach((block, blockIndex) => {
      const blockFrames = Math.round(block.duration * fps);

      // 자막 텍스트 아이템
      if (block.text && block.text.trim()) {
        const textItemId = `item-text-${scene.id}-${block.id}`;

        items[textItemId] = {
          id: textItemId,
          type: 'text',
          text: block.text,
          from: blockStartFrame,
          durationInFrames: blockFrames,
          left: width * 0.05,
          top: aspectRatio === '9:16' ? height * 0.75 : height * 0.85,
          width: width * 0.9,
          height: 100,
          opacity: 1,
          rotation: 0,
          color: '#FFFFFF',
          align: 'center',
          fontFamily: 'Pretendard',
          fontStyle: { variant: 'normal', weight: '700' },
          fontSize: aspectRatio === '9:16' ? 48 : 36,
          lineHeight: 1.3,
          letterSpacing: 0,
          resizeOnEdit: true,
          direction: 'ltr',
          strokeWidth: 2,
          strokeColor: '#000000',
          fadeInDurationInSeconds: 0.2,
          fadeOutDurationInSeconds: 0.2,
          isBold: true,
          isItalic: false,
          isUnderline: false,
          shadowEnabled: true,
          shadowColor: '#000000',
          shadowBlur: 4,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backgroundPadding: 8,
          isDraggingInTimeline: false,
        } as EditorStarterItem;

        subtitleTrack.items.push(textItemId);
      }

      // TTS 오디오 에셋 + 아이템
      if (block.ttsUrl) {
        const audioAssetId = `asset-audio-${scene.id}-${block.id}`;
        const audioItemId = `item-audio-${scene.id}-${block.id}`;

        assets[audioAssetId] = {
          id: audioAssetId,
          type: 'audio',
          filename: `tts-${sceneIndex + 1}-${blockIndex + 1}.mp3`,
          remoteUrl: block.ttsUrl,
          remoteFileKey: null,
          size: 0,
          mimeType: 'audio/mpeg',
          durationInSeconds: block.duration,
        } as EditorStarterAsset;

        items[audioItemId] = {
          id: audioItemId,
          type: 'audio',
          assetId: audioAssetId,
          from: blockStartFrame,
          durationInFrames: blockFrames,
          left: 0,
          top: 0,
          width: 100,
          height: 50,
          opacity: 1,
          audioStartFromInSeconds: 0,
          decibelAdjustment: 0,
          playbackRate: 1,
          audioFadeInDurationInSeconds: 0.1,
          audioFadeOutDurationInSeconds: 0.1,
          isDraggingInTimeline: false,
        } as EditorStarterItem;

        audioTrack.items.push(audioItemId);
      }

      blockStartFrame += blockFrames;
    });

    currentFrame += totalFrames;
  });

  // 트랙 순서: 오디오 → 자막 → 이미지
  const tracks: TrackType[] = [audioTrack, subtitleTrack, imageTrack];

  return { assets, items, tracks, compositionWidth: width, compositionHeight: height };
}

/**
 * 뉴스 스토리 기반으로 기본 씬 생성
 * @param story 뉴스 스토리
 * @param aspectRatio 화면 비율 (16:9 롱폼은 10개, 9:16 숏폼은 5개)
 */
export function createDefaultScenesFromStory(
  story: NewsStory,
  aspectRatio: NewsAspectRatio = '9:16'
): NewsScene[] {
  const targetSceneCount = aspectRatio === '16:9' ? 10 : 5;
  const keyScenes = story.keyScenes || [];
  const baseScenes: NewsScene[] = [];

  // 인트로 씬 (후킹)
  baseScenes.push({
    id: crypto.randomUUID(),
    sceneNumber: 1,
    dialogueBlocks: [{
      id: generateBlockId(),
      text: story.hook,
      duration: 3,
    }],
  });

  // 주요 장면들 (인트로/아웃트로 제외한 나머지 슬롯)
  const middleSceneCount = targetSceneCount - 2;
  for (let i = 0; i < middleSceneCount; i++) {
    baseScenes.push({
      id: crypto.randomUUID(),
      sceneNumber: i + 2,
      dialogueBlocks: [{
        id: generateBlockId(),
        text: keyScenes[i] || '',
        duration: 4,
      }],
    });
  }

  // 아웃트로 씬
  baseScenes.push({
    id: crypto.randomUUID(),
    sceneNumber: targetSceneCount,
    dialogueBlocks: [{
      id: generateBlockId(),
      text: '',
      duration: 3,
    }],
  });

  return baseScenes;
}
