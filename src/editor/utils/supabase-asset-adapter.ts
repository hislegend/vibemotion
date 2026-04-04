import { VideoAsset } from '../assets/assets';
import { VideoItem } from '../items/video/video-item-type';
import { TrackType } from '../state/types';
import { DEFAULT_FPS } from '../constants';
import { generateRandomId } from '../utils/generate-random-id';
import { byDefaultKeepAspectRatioMap } from '../utils/aspect-ratio';

interface SupabaseVideo {
  id: string;
  video_id: string;
  product_name: string;
  video_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface VideoMetadata {
  durationInSeconds: number;
  width: number;
  height: number;
}

/**
 * Supabase videos 테이블의 레코드를 Remotion VideoAsset으로 변환
 */
export function convertSupabaseVideoToAsset(
  video: SupabaseVideo,
  metadata: VideoMetadata
): VideoAsset {
  const assetId = `supabase-${video.id}`;
  
  return {
    type: 'video',
    id: assetId,
    filename: video.product_name || `video-${video.id}`,
    remoteUrl: video.video_url,
    remoteFileKey: video.video_id,
    durationInSeconds: metadata.durationInSeconds,
    hasAudioTrack: true,
    width: metadata.width,
    height: metadata.height,
    size: 0,
    mimeType: 'video/mp4',
  };
}

/**
 * VideoAsset에서 타임라인에 배치할 VideoItem 생성
 */
export function createVideoItemFromAsset(
  asset: VideoAsset,
  trackIndex: number,
  compositionWidth: number = 1080,
  compositionHeight: number = 1920
): VideoItem {
  const fps = DEFAULT_FPS;
  const durationInFrames = Math.ceil(asset.durationInSeconds * fps);
  const itemId = generateRandomId();
  
  // 캔버스에 맞게 크기 조정
  const scale = Math.min(
    compositionWidth / asset.width,
    compositionHeight / asset.height
  );
  const width = Math.round(asset.width * scale);
  const height = Math.round(asset.height * scale);
  const left = Math.round((compositionWidth - width) / 2);
  const top = Math.round((compositionHeight - height) / 2);
  
  return {
    type: 'video',
    id: itemId,
    assetId: asset.id,
    from: 0,
    durationInFrames: durationInFrames,
    videoStartFromInSeconds: 0,
    playbackRate: 1,
    decibelAdjustment: 0,
    width: width,
    height: height,
    left: left,
    top: top,
    rotation: 0,
    borderRadius: 0,
    opacity: 1,
    isDraggingInTimeline: false,
    audioFadeInDurationInSeconds: 0,
    audioFadeOutDurationInSeconds: 0,
    fadeInDurationInSeconds: 0,
    fadeOutDurationInSeconds: 0,
    keepAspectRatio: byDefaultKeepAspectRatioMap.video,
  };
}

/**
 * 트랙 생성 헬퍼
 */
export function createTrackForItem(itemId: string): TrackType {
  return {
    id: generateRandomId(),
    items: [itemId],
    muted: false,
    hidden: false,
    category: 'video', // 기본값: 영상
  };
}
