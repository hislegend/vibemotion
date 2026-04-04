import { renderMediaOnWeb } from '@remotion/web-renderer';
// [STUB] supabase import removed
import { taskIndicatorRef } from '../action-row/tasks-indicator/tasks-indicator';
import { EditorStarterAsset } from '../assets/assets';
import { EditorStarterItem } from '../items/item-type';
import { TrackType } from '../state/types';
import { SetState } from '../context-provider';
import { addRenderingTask, updateRenderingTask } from '../state/actions/set-render-state';
import { RenderingTask } from './render-state';
import { generateRandomId } from '../utils/generate-random-id';
import { getEditorExportFileName } from '../utils/export-file-name';
import { getCompositionDuration } from '../utils/get-composition-duration';
import { RenderCompositionWrapper, type RenderCompositionWrapperProps } from './render-composition-wrapper';
import { uploadRenderedBlob } from './upload-rendered-blob';

interface TriggerWebRenderOptions {
  items: Record<string, EditorStarterItem>;
  tracks: TrackType[];
  assets: Record<string, EditorStarterAsset>;
  fps: number;
  compositionWidth: number;
  compositionHeight: number;
  projectId: string;
  setState: SetState;
  durationInSeconds: number;
}

/**
 * 브라우저에서 직접 렌더링 (WebCodecs + Mediabunny)
 * Remotion의 @remotion/web-renderer를 사용하여 프리뷰와 100% 동일한 MP4 생성
 */
export async function triggerWebRender({
  items,
  tracks,
  assets,
  fps,
  compositionWidth,
  compositionHeight,
  projectId,
  setState,
  durationInSeconds,
}: TriggerWebRenderOptions): Promise<void> {
  const taskId = generateRandomId();
  const durationInFrames = getCompositionDuration(Object.values(items));

  // 렌더링 태스크 생성
  const renderTask: RenderingTask = {
    id: taskId,
    status: { type: 'render-initiated' },
    codec: 'h264',
    durationInSeconds,
    outputName: getEditorExportFileName('h264'),
    startedAt: Date.now(),
    type: 'rendering',
  };

  setState({
    commitToUndoStack: false,
    update: (state) => addRenderingTask({ state, task: renderTask }),
  });

  taskIndicatorRef.current?.open();

  try {
    console.log('[triggerWebRender] 🧪 Starting browser render with @remotion/web-renderer');
    console.log('[triggerWebRender] Config:', {
      durationInFrames,
      fps,
      width: compositionWidth,
      height: compositionHeight,
      tracksCount: tracks.length,
      itemsCount: Object.keys(items).length,
    });

    setState({
      commitToUndoStack: false,
      update: (state) =>
        updateRenderingTask({
          state,
          taskId,
          newStatus: { type: 'in-progress', overallProgress: 0.05 },
        }),
    });

    const defaultProps: RenderCompositionWrapperProps = {
      tracks,
      items,
      assets,
      fps,
      compositionWidth,
      compositionHeight,
    };

    const result = await renderMediaOnWeb({
      composition: {
        component: RenderCompositionWrapper as React.ComponentType<Record<string, unknown>>,
        durationInFrames,
        fps,
        width: compositionWidth,
        height: compositionHeight,
        id: 'web-render-comp',
        defaultProps: defaultProps as unknown as Record<string, unknown>,
        calculateMetadata: null,
      },
      inputProps: defaultProps as unknown as Record<string, unknown>,
      onProgress: ({ renderedFrames, encodedFrames }) => {
        const progress = encodedFrames / durationInFrames;
        console.log(`[triggerWebRender] Progress: ${(progress * 100).toFixed(1)}% (rendered: ${renderedFrames}, encoded: ${encodedFrames})`);
        setState({
          commitToUndoStack: false,
          update: (state) =>
            updateRenderingTask({
              state,
              taskId,
              newStatus: { type: 'in-progress', overallProgress: progress * 0.9 },
            }),
        });
      },
    });

    console.log('[triggerWebRender] ✅ Encoding complete, getting blob...');

    const blob = await result.getBlob();
    console.log(`[triggerWebRender] Blob size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

    // Storage에 업로드
    setState({
      commitToUndoStack: false,
      update: (state) =>
        updateRenderingTask({
          state,
          taskId,
          newStatus: { type: 'in-progress', overallProgress: 0.92 },
        }),
    });

    const videoUrl = await uploadRenderedBlob(blob, projectId);
    console.log('[triggerWebRender] ✅ Uploaded to storage:', videoUrl);

    // videos 테이블에 저장
    const videoId = `web-render-${Date.now()}`;
    const { error: insertError } = await supabase.from('videos').insert({
      project_id: projectId,
      video_id: videoId,
      product_name: `브라우저렌더링_${new Date().toISOString().slice(0, 10)}`,
      status: 'completed',
      video_url: videoUrl,
      concept_type: 'web-rendered',
    });

    if (insertError) {
      console.error('[triggerWebRender] Failed to save to videos table:', insertError);
    }

    // 완료
    setState({
      commitToUndoStack: false,
      update: (state) =>
        updateRenderingTask({
          state,
          taskId,
          newStatus: {
            type: 'done',
            outputFile: videoUrl,
            outputSizeInBytes: blob.size,
            doneAt: Date.now(),
          },
        }),
    });

    console.log('[triggerWebRender] 🎉 Browser render complete!');

  } catch (error) {
    console.error('[triggerWebRender] ❌ Error:', error);

    setState({
      commitToUndoStack: false,
      update: (state) =>
        updateRenderingTask({
          state,
          taskId,
          newStatus: {
            type: 'error',
            error: error instanceof Error ? error.message : '브라우저 렌더링 중 알 수 없는 오류',
          },
        }),
    });
  }
}
