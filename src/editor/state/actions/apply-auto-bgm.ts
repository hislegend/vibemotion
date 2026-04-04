// 자동 BGM 추가 액션
import { EditorState } from '../types';
// [STUB] supabase import removed
import { VideoSegmentAnalysis } from '@/types/video-segment';

export interface ApplyAutoBGMParams {
  state: EditorState;
  analysis?: VideoSegmentAnalysis;
  fps: number;
  totalDurationSeconds: number;
}

export interface BGMRecommendation {
  bgmId: string;
  bgmUrl: string;
  title: string;
  genre: string;
  suggestedVolume: number;
}

/**
 * AI 추천 BGM을 타임라인에 추가
 */
export async function applyAutoBGM({
  state,
  analysis,
  fps,
  totalDurationSeconds,
}: ApplyAutoBGMParams): Promise<EditorState> {
  // BGM 추천 요청
  const data = null; const error = new Error("BGM not available"); if (false) await fetch('recommend-bgm', {
    body: {
      analysis: analysis || { 
        videoId: 'unknown', 
        duration: totalDurationSeconds, 
        segments: [] 
      },
    },
  });

  if (error || !data?.recommendation) {
    console.error('BGM 추천 실패:', error);
    return state;
  }

  const recommendation: BGMRecommendation = data.recommendation;
  
  // BGM 에셋 생성
  const bgmAssetId = `bgm-asset-${Date.now()}`;
  const bgmItemId = `bgm-item-${Date.now()}`;
  
  const bgmAsset = {
    id: bgmAssetId,
    type: 'audio' as const,
    filename: `${recommendation.title}.mp3`,
    remoteUrl: recommendation.bgmUrl,
    remoteFileKey: null,
    durationInSeconds: totalDurationSeconds,
  };

  const totalFrames = Math.round(totalDurationSeconds * fps);
  
  // BGM 아이템 생성 (-15dB로 배경음 수준)
  const bgmItem = {
    id: bgmItemId,
    type: 'audio' as const,
    assetId: bgmAssetId,
    from: 0,
    durationInFrames: totalFrames,
    audioStartFromInSeconds: 0,
    decibelAdjustment: -15, // 배경음 볼륨
    audioFadeInDurationInSeconds: 1.0, // 페이드인
    audioFadeOutDurationInSeconds: 2.0, // 페이드아웃
    playbackRate: 1,
  };

  // 오디오 트랙 찾기 또는 생성
  let audioTrack = state.undoableState.tracks.find(t => t.category === 'audio');
  let updatedTracks = [...state.undoableState.tracks];
  
  if (!audioTrack) {
    audioTrack = {
      id: `audio-track-${Date.now()}`,
      category: 'audio',
      items: [],
      hidden: false,
      muted: false,
    };
    updatedTracks.push(audioTrack);
  }
  
  // 트랙에 BGM 아이템 추가
  updatedTracks = updatedTracks.map(track => {
    if (track.id === audioTrack!.id) {
      return {
        ...track,
        items: [...track.items, bgmItemId],
      };
    }
    return track;
  });

  return {
    ...state,
    undoableState: {
      ...state.undoableState,
      assets: {
        ...state.undoableState.assets,
        [bgmAssetId]: bgmAsset as any,
      },
      items: {
        ...state.undoableState.items,
        [bgmItemId]: bgmItem as any,
      },
      tracks: updatedTracks,
    },
  };
}

/**
 * 수동으로 BGM 추가 (URL 지정)
 */
export function addBGMFromUrl({
  state,
  bgmUrl,
  title,
  fps,
  totalDurationSeconds,
  volume = -15,
}: {
  state: EditorState;
  bgmUrl: string;
  title: string;
  fps: number;
  totalDurationSeconds: number;
  volume?: number;
}): EditorState {
  const bgmAssetId = `bgm-asset-${Date.now()}`;
  const bgmItemId = `bgm-item-${Date.now()}`;
  
  const bgmAsset = {
    id: bgmAssetId,
    type: 'audio' as const,
    filename: `${title}.mp3`,
    remoteUrl: bgmUrl,
    remoteFileKey: null,
    durationInSeconds: totalDurationSeconds,
  };

  const totalFrames = Math.round(totalDurationSeconds * fps);
  
  const bgmItem = {
    id: bgmItemId,
    type: 'audio' as const,
    assetId: bgmAssetId,
    from: 0,
    durationInFrames: totalFrames,
    audioStartFromInSeconds: 0,
    decibelAdjustment: volume,
    audioFadeInDurationInSeconds: 1.0,
    audioFadeOutDurationInSeconds: 2.0,
    playbackRate: 1,
  };

  let audioTrack = state.undoableState.tracks.find(t => t.category === 'audio');
  let updatedTracks = [...state.undoableState.tracks];
  
  if (!audioTrack) {
    audioTrack = {
      id: `audio-track-${Date.now()}`,
      category: 'audio',
      items: [],
      hidden: false,
      muted: false,
    };
    updatedTracks.push(audioTrack);
  }
  
  updatedTracks = updatedTracks.map(track => {
    if (track.id === audioTrack!.id) {
      return {
        ...track,
        items: [...track.items, bgmItemId],
      };
    }
    return track;
  });

  return {
    ...state,
    undoableState: {
      ...state.undoableState,
      assets: {
        ...state.undoableState.assets,
        [bgmAssetId]: bgmAsset as any,
      },
      items: {
        ...state.undoableState.items,
        [bgmItemId]: bgmItem as any,
      },
      tracks: updatedTracks,
    },
  };
}
