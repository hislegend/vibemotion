import { EditorStarterAsset, VideoAsset, AudioAsset, ImageAsset } from '../assets/assets';
import { EditorStarterItem } from '../items/item-type';
import { TrackType } from '../state/types';
import { getRectAfterCrop } from '../utils/get-dimensions-after-crop';
import { getCropFromItem } from '../utils/get-crop-from-item';

// Exported for use in overlap detection
// 클립 위치/크기 정보 (Shotstack 렌더링용)
export interface ClipPosition {
  left: number;    // 캔버스 내 픽셀 위치
  top: number;
  width: number;   // 캔버스 내 픽셀 크기
  height: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

// 크롭 정보 (0-1 비율)
export interface CropData {
  left: number;   // 왼쪽에서 잘라낼 비율
  top: number;    // 위에서 잘라낼 비율
  right: number;  // 오른쪽에서 잘라낼 비율
  bottom: number; // 아래에서 잘라낼 비율
}

// 전환 효과 타입 (video-item-type.ts와 동일)
export type TransitionType = 'none' | 'fade' | 'slide-left' | 'slide-right' | 'zoom-in' | 'zoom-out';

export interface ClipInput {
  url: string;
  timelineStart: number;
  timelineEnd: number;
  trimStart: number;
  duration: number;
  muted?: boolean;
  isImage?: boolean; // Flag to indicate this is a static image
  trackIndex: number; // 트랙 레이어 (0=맨 아래, 클수록 위)
  // 위치/크기 정보 (Shotstack 렌더링용) - 크롭 적용 후 보이는 영역
  position?: ClipPosition;
  canvasSize?: CanvasSize;
  opacity?: number;
  rotation?: number;
  // 크롭 정보 (원본 미디어에서 잘라낼 비율)
  crop?: CropData;
  // 전환/페이드 효과
  transitionIn?: TransitionType;
  transitionOut?: TransitionType;
  transitionDurationInSeconds?: number;
  fadeInDurationInSeconds?: number;
  fadeOutDurationInSeconds?: number;
}

export interface AudioClipInput {
  data: string;
  timelineStart: number;
  duration: number;
  trimStart?: number;      // 독립 오디오 트림 시작점 (초)
  isVideoAudio?: boolean;  // 비디오에서 추출된 오디오인지 표시
  videoTrimStart?: number; // 비디오 트림 시작점 (오디오 추출 시 필요)
}

// 텍스트 클립 입력 타입
export interface TextClipInput {
  type: 'text';
  text: string;
  timelineStart: number;
  duration: number;
  trackIndex: number;
  // 스타일
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  // 위치
  position: ClipPosition;
  canvasSize: CanvasSize;
  opacity?: number;
  rotation?: number;
  // 배경
  backgroundColor?: string;
  backgroundPadding?: number;
  backgroundWidth?: number;
  backgroundHeight?: number;
  // 외곽선
  strokeWidth?: number;
  strokeColor?: string;
  // 그림자
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  // 페이드
  fadeInDurationInSeconds?: number;
  fadeOutDurationInSeconds?: number;
}

export interface CloudinaryRenderInput {
  clips: ClipInput[];
  textClips: TextClipInput[];  // 텍스트 클립 배열
  audioClips: AudioClipInput[];
  totalDuration: number;
  hasOverlappingTracks: boolean; // 트랙 중첩 여부
}

/**
 * 트랙 중첩 감지: 같은 시간대에 다른 trackIndex를 가진 클립이 있는지 확인
 */
function detectOverlappingTracks(clips: ClipInput[]): boolean {
  console.log('[detectOverlappingTracks] Checking clips:', clips.map(c => ({
    trackIndex: c.trackIndex,
    timelineStart: c.timelineStart.toFixed(2),
    timelineEnd: c.timelineEnd.toFixed(2),
  })));

  for (let i = 0; i < clips.length; i++) {
    for (let j = i + 1; j < clips.length; j++) {
      const a = clips[i];
      const b = clips[j];

      // 시간이 겹치고 트랙이 다르면 중첩
      const timeOverlap = a.timelineStart < b.timelineEnd &&
                          b.timelineStart < a.timelineEnd;
      const differentTrack = a.trackIndex !== b.trackIndex;

      if (timeOverlap && differentTrack) {
        console.log('[detectOverlappingTracks] ✅ OVERLAP FOUND:', {
          clipA: { idx: i, track: a.trackIndex, start: a.timelineStart.toFixed(2), end: a.timelineEnd.toFixed(2) },
          clipB: { idx: j, track: b.trackIndex, start: b.timelineStart.toFixed(2), end: b.timelineEnd.toFixed(2) },
        });
        return true;
      }
    }
  }
  console.log('[detectOverlappingTracks] ❌ No overlaps found');
  return false;
}

/**
 * Remotion 에디터 상태를 merge-timeline-clips Edge Function 입력 형식으로 변환
 */
export function convertToCloudinaryClips(
  items: Record<string, EditorStarterItem>,
  tracks: TrackType[],
  assets: Record<string, EditorStarterAsset>,
  fps: number = 30,
  compositionWidth?: number,
  compositionHeight?: number
): CloudinaryRenderInput {
  const clips: ClipInput[] = [];
  const textClips: TextClipInput[] = [];
  const audioClips: AudioClipInput[] = [];

  // 트랙 순서대로 아이템 정렬하며 trackIndex 기록
  // trackIndex: 0 = 맨 아래 트랙, 클수록 위 트랙 (덮는 트랙)
  const itemsWithTrack: Array<{ item: EditorStarterItem; trackIndex: number; trackMuted: boolean }> = [];
  
  for (let trackIdx = 0; trackIdx < tracks.length; trackIdx++) {
    const track = tracks[trackIdx];
    for (const itemId of track.items) {
      const item = items[itemId];
      if (item) {
        // 트랙 음소거 상태도 함께 전달
        itemsWithTrack.push({ item, trackIndex: trackIdx, trackMuted: track.muted ?? false });
      }
    }
  }

  // 타임라인 순서대로 정렬 (처리 순서용, 실제 레이어링은 백엔드에서 trackIndex로 처리)
  itemsWithTrack.sort((a, b) => a.item.from - b.item.from);

  for (const { item, trackIndex, trackMuted } of itemsWithTrack) {
    if (item.type === 'video') {
      const asset = assets[item.assetId];
      
      if (!asset || asset.type !== 'video') continue;

      const videoAsset = asset as VideoAsset;
      const videoUrl = videoAsset.remoteUrl || '';
      
      // Validate URL - must be a remote URL, not blob:
      if (!videoUrl) {
        throw new Error(`비디오 에셋 "${videoAsset.filename}"의 원격 URL이 없습니다. 내보내기 전에 업로드가 필요합니다.`);
      }
      if (videoUrl.startsWith('blob:')) {
        throw new Error(`비디오 에셋 "${videoAsset.filename}"이 로컬에만 있습니다. 내보내기 전에 업로드가 필요합니다.`);
      }

      // 프레임을 초로 변환
      const timelineStart = item.from / fps;
      const timelineEnd = (item.from + item.durationInFrames) / fps;
      const trimStart = item.videoStartFromInSeconds || 0;
      const duration = item.durationInFrames / fps;

      const clipInput: ClipInput = {
        url: videoUrl,
        timelineStart,
        timelineEnd,
        trimStart,
        duration,
        muted: trackMuted || item.audioRemoved === true || item.decibelAdjustment <= -100, // 트랙 음소거, 오디오 제거됨, 또는 매우 작은 볼륨은 음소거로 처리
        trackIndex, // 트랙 레이어 정보 추가
      };

      // 위치/크기 정보 추가 (캔버스 크기가 제공된 경우)
      if (compositionWidth && compositionHeight) {
        // 크롭 적용 후 보이는 영역 계산
        const visibleRect = getRectAfterCrop(item);
        const cropData = getCropFromItem(item);
        
        clipInput.position = {
          left: visibleRect.left,
          top: visibleRect.top,
          width: visibleRect.width,
          height: visibleRect.height,
        };
        clipInput.canvasSize = {
          width: compositionWidth,
          height: compositionHeight,
        };
        clipInput.opacity = item.opacity;
        clipInput.rotation = item.rotation || 0;
        
        // 크롭 정보 추가 (크롭이 적용된 경우에만)
        if (cropData && (cropData.cropLeft > 0 || cropData.cropTop > 0 || cropData.cropRight > 0 || cropData.cropBottom > 0)) {
          clipInput.crop = {
            left: cropData.cropLeft,
            top: cropData.cropTop,
            right: cropData.cropRight,
            bottom: cropData.cropBottom,
          };
        }
      }

      // 전환/페이드 효과 추가
      clipInput.transitionIn = item.transitionIn;
      clipInput.transitionOut = item.transitionOut;
      clipInput.transitionDurationInSeconds = item.transitionDurationInSeconds;
      clipInput.fadeInDurationInSeconds = item.fadeInDurationInSeconds;
      clipInput.fadeOutDurationInSeconds = item.fadeOutDurationInSeconds;

      clips.push(clipInput);

      // 트랙이 음소거가 아니고, 오디오가 제거되지 않았고, 개별 볼륨도 충분할 때만 오디오 추출
      if (!trackMuted && item.audioRemoved !== true && item.decibelAdjustment > -100) {
        audioClips.push({
          data: videoUrl,
          timelineStart,
          duration,
          isVideoAudio: true,
          videoTrimStart: trimStart,
        });
      }
    } else if (item.type === 'image') {
      const asset = assets[item.assetId];
      
      if (!asset || asset.type !== 'image') continue;

      const imageAsset = asset as ImageAsset;
      const imageUrl = imageAsset.remoteUrl || '';
      
      // Validate URL - must be a remote URL, not blob:
      if (!imageUrl) {
        throw new Error(`이미지 에셋 "${imageAsset.filename}"의 원격 URL이 없습니다. 내보내기 전에 업로드가 필요합니다.`);
      }
      if (imageUrl.startsWith('blob:')) {
        throw new Error(`이미지 에셋 "${imageAsset.filename}"이 로컬에만 있습니다. 내보내기 전에 업로드가 필요합니다.`);
      }

      // 프레임을 초로 변환
      const timelineStart = item.from / fps;
      const timelineEnd = (item.from + item.durationInFrames) / fps;
      const duration = item.durationInFrames / fps;

      const clipInput: ClipInput = {
        url: imageUrl,
        timelineStart,
        timelineEnd,
        trimStart: 0,
        duration,
        muted: true,
        isImage: true,
        trackIndex, // 트랙 레이어 정보 추가
      };

      // 위치/크기 정보 추가 (캔버스 크기가 제공된 경우)
      if (compositionWidth && compositionHeight) {
        // 크롭 적용 후 보이는 영역 계산
        const visibleRect = getRectAfterCrop(item);
        const cropData = getCropFromItem(item);
        
        clipInput.position = {
          left: visibleRect.left,
          top: visibleRect.top,
          width: visibleRect.width,
          height: visibleRect.height,
        };
        clipInput.canvasSize = {
          width: compositionWidth,
          height: compositionHeight,
        };
        clipInput.opacity = item.opacity;
        clipInput.rotation = item.rotation || 0;
        
        // 크롭 정보 추가 (크롭이 적용된 경우에만)
        if (cropData && (cropData.cropLeft > 0 || cropData.cropTop > 0 || cropData.cropRight > 0 || cropData.cropBottom > 0)) {
          clipInput.crop = {
            left: cropData.cropLeft,
            top: cropData.cropTop,
            right: cropData.cropRight,
            bottom: cropData.cropBottom,
          };
        }
      }

      // 이미지 페이드 효과 추가
      clipInput.fadeInDurationInSeconds = item.fadeInDurationInSeconds;
      clipInput.fadeOutDurationInSeconds = item.fadeOutDurationInSeconds;

      clips.push(clipInput);
    } else if (item.type === 'text') {
      // 텍스트 아이템 처리
      if (!compositionWidth || !compositionHeight) continue;
      
      const timelineStart = item.from / fps;
      const duration = item.durationInFrames / fps;

      const textClip: TextClipInput = {
        type: 'text',
        text: item.text,
        timelineStart,
        duration,
        trackIndex,
        fontFamily: item.fontFamily,
        fontSize: item.fontSize,
        fontWeight: item.fontStyle?.weight || '400',
        color: item.color,
        align: item.align,
        verticalAlign: 'middle', // 기본값 (TextItem에 없으면)
        position: {
          left: item.left,
          top: item.top,
          width: item.width,
          height: item.height,
        },
        canvasSize: {
          width: compositionWidth,
          height: compositionHeight,
        },
        opacity: item.opacity,
        rotation: item.rotation || 0,
        backgroundColor: item.backgroundColor,
        backgroundPadding: item.backgroundPadding,
        strokeWidth: item.strokeWidth,
        strokeColor: item.strokeColor,
        shadowEnabled: item.shadowEnabled,
        shadowColor: item.shadowColor,
        shadowBlur: item.shadowBlur,
        shadowOffsetX: item.shadowOffsetX,
        shadowOffsetY: item.shadowOffsetY,
        fadeInDurationInSeconds: item.fadeInDurationInSeconds,
        fadeOutDurationInSeconds: item.fadeOutDurationInSeconds,
      };

      textClips.push(textClip);
    } else if (item.type === 'audio') {
      const asset = assets[item.assetId];
      
      if (!asset || asset.type !== 'audio') continue;

      const audioAsset = asset as AudioAsset;
      const audioUrl = audioAsset.remoteUrl || '';
      
      // Validate URL - must be a remote URL, not blob:
      if (!audioUrl) {
        throw new Error(`오디오 에셋 "${audioAsset.filename}"의 원격 URL이 없습니다. 내보내기 전에 업로드가 필요합니다.`);
      }
      if (audioUrl.startsWith('blob:')) {
        throw new Error(`오디오 에셋 "${audioAsset.filename}"이 로컬에만 있습니다. 내보내기 전에 업로드가 필요합니다.`);
      }

      const timelineStart = item.from / fps;
      const duration = item.durationInFrames / fps;

      audioClips.push({
        data: audioUrl,
        timelineStart,
        duration,
        trimStart: item.audioStartFromInSeconds || 0,
      });
    }
  }

  // 총 재생 시간 계산
  const totalDuration = clips.reduce((max, clip) => 
    Math.max(max, clip.timelineEnd), 0
  );

  // 트랙 중첩 감지
  const hasOverlappingTracks = detectOverlappingTracks(clips);

  return {
    clips,
    textClips,
    audioClips,
    totalDuration,
    hasOverlappingTracks,
  };
}
