import { useState, useCallback } from 'react';
// [STUB] supabase import removed
import { toast } from 'sonner';
import { useAssets, useTracks, useAllItems, useFps, useWriteContext, useDimensions } from '../utils/use-context';
import { convertToCloudinaryClips, ClipInput } from '../rendering/convert-to-cloudinary-clips';
import { ensureAssetsUploaded } from '../rendering/ensure-assets-uploaded';
import { extractNarrationFromItems } from '../rendering/extract-narration-from-items';
import { getSourceVideoIdsForEditor, getProjectIdForEditor } from '../state/supabase-initial-state';
import { extractNarrationFromPrompt } from '@/utils/scriptExtractor';

// Helper: Check if any clips overlap within the SAME track
// Multi-track overlaps are normal (different trackIndex = layered composition)
// Only warn for same-track overlaps which shouldn't happen in normal editing
function checkForSameTrackOverlaps(clips: ClipInput[]): boolean {
  // Group clips by trackIndex
  const byTrack = new Map<number, ClipInput[]>();
  for (const clip of clips) {
    const trackIdx = clip.trackIndex ?? 0;
    if (!byTrack.has(trackIdx)) {
      byTrack.set(trackIdx, []);
    }
    byTrack.get(trackIdx)!.push(clip);
  }
  
  // Check overlaps only within each track
  for (const [, trackClips] of byTrack) {
    for (let i = 0; i < trackClips.length; i++) {
      for (let j = i + 1; j < trackClips.length; j++) {
        const a = trackClips[i];
        const b = trackClips[j];
        if (a.timelineStart < b.timelineEnd && b.timelineStart < a.timelineEnd) {
          return true; // Same-track overlap found
        }
      }
    }
  }
  return false;
}

// Helper: Check if multi-track composition is used (different trackIndex with time overlap)
function hasMultiTrackComposition(clips: ClipInput[]): boolean {
  for (let i = 0; i < clips.length; i++) {
    for (let j = i + 1; j < clips.length; j++) {
      const a = clips[i];
      const b = clips[j];
      const trackA = a.trackIndex ?? 0;
      const trackB = b.trackIndex ?? 0;
      // Different tracks + time overlap = multi-track composition
      if (trackA !== trackB && a.timelineStart < b.timelineEnd && b.timelineStart < a.timelineEnd) {
        return true;
      }
    }
  }
  return false;
}

interface ExportResult {
  videoUrl: string;
  publicId: string;
  totalDuration: number;
}

export function useExportTimeline(projectId?: string) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [result, setResult] = useState<ExportResult | null>(null);

  const { assets } = useAssets();
  const { tracks } = useTracks();
  const { items } = useAllItems();
  const { fps } = useFps();
  const { compositionWidth, compositionHeight } = useDimensions();
  const { setState } = useWriteContext();

  const exportTimeline = useCallback(async () => {
    if (!projectId) {
      toast.error('프로젝트 ID가 필요합니다');
      return null;
    }

    try {
      setIsExporting(true);
      setResult(null);

      // Step 1: Ensure all local assets are uploaded
      setProgress('로컬 에셋 업로드 중...');
      const updatedAssets = await ensureAssetsUploaded({
        items,
        tracks,
        assets,
        projectId,
        setState,
        onProgress: setProgress,
      });

      // Step 2: Convert timeline to Cloudinary clips format
      setProgress('클립 변환 중...');
      const { clips, textClips, audioClips, totalDuration, hasOverlappingTracks } = convertToCloudinaryClips(
        items,
        tracks,
        updatedAssets,
        fps,
        compositionWidth,
        compositionHeight
      );

      if (clips.length === 0 && textClips.length === 0) {
        toast.error('내보낼 클립이 없습니다');
        setIsExporting(false);
        return null;
      }

      // Check for same-track overlaps (actual issue) vs multi-track composition (normal)
      const hasSameTrackOverlaps = checkForSameTrackOverlaps(clips);
      const hasMultiTrack = hasMultiTrackComposition(clips);
      const hasImageClips = clips.some(c => c.isImage);
      const hasTextClips = textClips.length > 0;
      const hasAudioClips = audioClips.length > 0;
      
      // 크롭이 적용된 클립이 있는지 확인
      const hasAnyCrop = clips.some(c => c.crop && (
        c.crop.left > 0 || c.crop.top > 0 || c.crop.right > 0 || c.crop.bottom > 0
      ));
      
      // Shotstack 사용 조건: 멀티트랙 중첩 OR 이미지 클립 포함 OR 크롭 적용 OR 텍스트 클립 OR 오디오 클립
      // (Cloudinary는 현재 크롭/이미지/텍스트/오디오를 제대로 처리하지 못함)
      const shouldUseShotstack = hasOverlappingTracks || hasImageClips || hasAnyCrop || hasTextClips || hasAudioClips;
      
      console.log('[useExportTimeline] 🎬 Render decision:', {
        hasOverlappingTracks,
        hasImageClips,
        hasAnyCrop,
        hasTextClips,
        hasAudioClips,
        textClipsCount: textClips.length,
        audioClipsCount: audioClips.length,
        shouldUseShotstack,
        renderer: shouldUseShotstack ? 'SHOTSTACK' : 'CLOUDINARY',
        clipsCount: clips.length,
        clips: clips.map(c => ({
          trackIndex: c.trackIndex,
          timelineStart: c.timelineStart.toFixed(2),
          timelineEnd: c.timelineEnd.toFixed(2),
          isImage: c.isImage,
          hasCrop: !!(c.crop && (c.crop.left > 0 || c.crop.top > 0 || c.crop.right > 0 || c.crop.bottom > 0)),
          crop: c.crop,
        })),
        textClips: textClips.map(t => ({
          text: t.text.substring(0, 20),
          timelineStart: t.timelineStart.toFixed(2),
          duration: t.duration.toFixed(2),
        })),
      });
      
      if (hasSameTrackOverlaps) {
        toast.warning('같은 트랙에서 겹치는 클립이 발견되었습니다. 예상치 못한 결과가 발생할 수 있습니다.');
      }
      
      // 렌더러 선택 알림
      if (shouldUseShotstack) {
        const reasons: string[] = [];
        if (hasMultiTrack) reasons.push('멀티 트랙');
        if (hasImageClips) reasons.push('이미지');
        if (hasAnyCrop) reasons.push('크롭');
        if (hasTextClips) reasons.push('텍스트');
        if (hasAudioClips) reasons.push('오디오');
        toast.info(`Shotstack 렌더링 (${reasons.join(', ')})`);
      }

      let data, error;

      if (shouldUseShotstack) {
        // 멀티 트랙 중첩 또는 이미지/텍스트 포함 → Shotstack API 사용
        setProgress('Shotstack 렌더링 중...');
        console.log('[useExportTimeline] ⚡ Using SHOTSTACK with textClips:', textClips.length);
        ({ data, error } = await supabase.functions.invoke('render-shotstack', {
          body: { clips, textClips, audioClips },
        }));
      } else {
        // 단순 비디오 순차 → 기존 Cloudinary 방식
        setProgress('영상 병합 중...');
        console.log('[useExportTimeline] 🔧 Using CLOUDINARY');
        ({ data, error } = await supabase.functions.invoke('merge-timeline-clips', {
          body: { clips, audioClips },
        }));
      }

      if (error) {
        throw new Error(error.message);
      }

      // Prefer transcodedUrl for reliable browser playback (progressive MP4)
      const videoUrl = data?.transcodedUrl || data?.url || data?.videoUrl;
      if (!videoUrl) {
        throw new Error('영상 URL을 받지 못했습니다');
      }

      setProgress('갤러리에 저장 중...');

      // Extract narration with fallback chain
      let narrationPrompt = extractNarrationFromItems(items, updatedAssets);
      
      // 1차 폴백: 원본 영상들의 prompt에서 추출
      if (!narrationPrompt) {
        const sourceVideoIds = getSourceVideoIdsForEditor();
        if (sourceVideoIds.length > 0) {
          const { data: sourceVideos } = await supabase
            .from('videos')
            .select('prompt')
            .in('id', sourceVideoIds);
          
          if (sourceVideos && sourceVideos.length > 0) {
            const narrations: string[] = [];
            for (const v of sourceVideos) {
              const extracted = extractNarrationFromPrompt(v.prompt || '');
              if (extracted) narrations.push(extracted);
            }
            if (narrations.length > 0) {
              narrationPrompt = `Korean narration: "${narrations.join('\\n')}"`;
            }
          }
        }
      }
      
      // 2차 폴백: 프로젝트 scenes.narration에서 조합
      if (!narrationPrompt) {
        const editorProjectId = getProjectIdForEditor() || projectId;
        if (editorProjectId) {
          const { data: scenes } = await supabase
            .from('scenes')
            .select('scene_number, narration')
            .eq('project_id', editorProjectId)
            .order('scene_number', { ascending: true });
          
          if (scenes && scenes.length > 0) {
            const scenesNarration = scenes
              .map((s: any) => (s.narration || '').trim())
              .filter(Boolean)
              .join('\\n');
            
            if (scenesNarration) {
              narrationPrompt = `Korean narration: "${scenesNarration}"`;
            }
          }
        }
      }

      // videos 테이블에 저장
      const { error: insertError } = await supabase.from('videos').insert({
        project_id: projectId,
        video_url: videoUrl,
        video_id: data.public_id || data.publicId || `merged-${Date.now()}`,
        product_name: '타임라인 내보내기',
        status: 'completed',
        concept_type: 'remotion-merged',
        prompt: narrationPrompt,
      });

      if (insertError) {
        console.error('Failed to save to gallery:', insertError);
        toast.warning('영상은 생성되었지만 갤러리 저장에 실패했습니다');
      }

      const exportResult: ExportResult = {
        videoUrl: videoUrl,
        publicId: data.public_id || data.publicId || '',
        totalDuration: data.totalDuration || totalDuration,
      };

      setResult(exportResult);
      setProgress('완료!');
      toast.success('영상 내보내기 완료!');

      return exportResult;
    } catch (err) {
      console.error('Export failed:', err);
      const message = err instanceof Error ? err.message : '내보내기 실패';
      toast.error(message);
      setProgress('');
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [projectId, items, tracks, assets, fps, compositionWidth, compositionHeight, setState]);

  const resetExport = useCallback(() => {
    setResult(null);
    setProgress('');
  }, []);

  return {
    exportTimeline,
    isExporting,
    progress,
    result,
    resetExport,
  };
}
