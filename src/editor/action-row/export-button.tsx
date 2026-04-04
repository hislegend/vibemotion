import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Loader2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { useExportTimeline } from '../hooks/useExportTimeline';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { saveEditorStateSnapshot } from '../state/supabase-initial-state';
import { useAssets, useAllItems, useTracks } from '../utils/use-context';

// Video preview component with duration validation and retry logic
const VideoPreview: React.FC<{ videoUrl?: string }> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'zero-duration'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const duration = video.duration;
    console.log(`[VideoPreview] Loaded metadata: duration=${duration}`);

    if (isNaN(duration) || duration === 0 || !isFinite(duration)) {
      if (retryCount < maxRetries) {
        console.log(`[VideoPreview] Zero/invalid duration, retry ${retryCount + 1}/${maxRetries}`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
      } else {
        setStatus('zero-duration');
      }
    } else {
      setStatus('ready');
    }
  }, [retryCount]);

  const handleError = useCallback(() => {
    console.error('[VideoPreview] Video load error');
    setStatus('error');
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setStatus('loading');
  }, []);

  // Add cache-buster on retry
  const videoSrc = videoUrl ? `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}cb=${retryCount}` : undefined;

  useEffect(() => {
    if (videoUrl) {
      setStatus('loading');
    }
  }, [videoUrl, retryCount]);

  if (!videoUrl) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden bg-black relative min-h-[200px]">
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-neutral-400">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">영상 준비 중... {retryCount > 0 && `(재시도 ${retryCount}/${maxRetries})`}</p>
            </div>
          </div>
        )}
        
        {status === 'zero-duration' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-yellow-400 p-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm mb-3">영상이 아직 처리 중입니다</p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={handleRetry} className="gap-1">
                  <RefreshCw className="h-3 w-3" />
                  재시도
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                    새 탭에서 열기
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-red-400 p-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm mb-3">영상을 불러올 수 없습니다</p>
              <Button size="sm" variant="outline" asChild>
                <a href={videoUrl} download>
                  <Download className="h-3 w-3 mr-1" />
                  다운로드
                </a>
              </Button>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
          className={`w-full max-h-[300px] ${status !== 'ready' ? 'opacity-0' : 'opacity-100'}`}
        />
      </div>
    </div>
  );
};

interface ExportButtonProps {
  projectId?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ projectId }) => {
  const { exportTimeline, isExporting, progress, result, resetExport } = useExportTimeline(projectId);
  const [showResultDialog, setShowResultDialog] = React.useState(false);
  const { assets } = useAssets();
  const { items } = useAllItems();
  const { tracks } = useTracks();

  const handleExport = async () => {
    const exportResult = await exportTimeline();
    if (exportResult) {
      setShowResultDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setShowResultDialog(false);
    resetExport();
  };

  // 현재 에디터 상태를 스냅샷으로 저장 (갤러리 이동 전)
  const saveCurrentState = useCallback(() => {
    if (projectId) {
      saveEditorStateSnapshot({
        projectId,
        assets,
        items,
        tracks,
      });
    }
  }, [projectId, assets, items, tracks]);

  const handleGoToGallery = () => {
    if (projectId) {
      // 에디터 상태 저장 (프로젝트 연속성)
      saveCurrentState();
      
      // URL 파라미터로 projectId 전달 (wakawaka-app-state 공유 키 불필요)
      window.open(`/gallery?projectId=${projectId}`, '_blank');
    }
    handleCloseDialog();
  };

  return (
    <>
      <Button
        onClick={handleExport}
        disabled={isExporting || !projectId}
        variant="outline"
        size="sm"
        className="gap-2 bg-neutral-800 border-neutral-600 hover:bg-neutral-700 text-white"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">{progress || '내보내는 중...'}</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span className="text-xs">내보내기</span>
          </>
        )}
      </Button>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">내보내기 완료</DialogTitle>
            <DialogDescription className="text-neutral-400">
              영상이 성공적으로 생성되었습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <VideoPreview videoUrl={result?.videoUrl} />

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="border-neutral-600 bg-black text-white hover:bg-neutral-800"
              >
                닫기
              </Button>
              <Button
                onClick={handleGoToGallery}
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <ExternalLink className="h-4 w-4" />
                갤러리로 이동
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
