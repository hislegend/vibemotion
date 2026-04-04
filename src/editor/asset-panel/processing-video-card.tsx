import React, { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, Film, Download, Upload, CheckCircle } from 'lucide-react';

interface ProcessingVideoCardProps {
  video: {
    id: string;
    product_name: string;
    progress: number | null;
    created_at: string;
    stage?: 'generating' | 'downloading' | 'uploading' | 'checking';
  };
}

export const ProcessingVideoCard: React.FC<ProcessingVideoCardProps> = ({ video }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // 로컬에서도 단조 증가 보장
  const [displayProgress, setDisplayProgress] = useState(0);
  const maxProgressRef = useRef(0);
  
  useEffect(() => {
    const updateElapsed = () => {
      setElapsedSeconds(Math.floor((Date.now() - new Date(video.created_at).getTime()) / 1000));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [video.created_at]);
  
  // progress 단조 증가 보장
  useEffect(() => {
    const newProgress = video.progress ?? 0;
    if (newProgress > maxProgressRef.current) {
      maxProgressRef.current = newProgress;
      setDisplayProgress(newProgress);
    }
  }, [video.progress]);
  
  const formatElapsed = () => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    if (mins > 0) {
      return `${mins}분 ${secs}초 경과`;
    }
    return `${secs}초 경과`;
  };
  
  // 단계별 표시 텍스트 및 아이콘
  const getStageInfo = () => {
    const stage = video.stage || 'generating';
    const progress = displayProgress;
    
    // 99~100% 구간에서 저장 중 표시
    if (progress >= 99 || stage === 'downloading' || stage === 'uploading') {
      if (stage === 'uploading') {
        return { 
          icon: <Upload className="h-3 w-3 animate-pulse text-blue-400" />, 
          text: '스토리지 업로드 중...',
          showSaving: true
        };
      }
      return { 
        icon: <Download className="h-3 w-3 animate-pulse text-blue-400" />, 
        text: '영상 저장 중...',
        showSaving: true
      };
    }
    
    return { 
      icon: <Loader2 className="h-3 w-3 animate-spin text-primary" />, 
      text: '영상 생성 중...',
      showSaving: false
    };
  };
  
  const stageInfo = getStageInfo();
  
  return (
    <div className="bg-neutral-800 rounded p-2">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="relative flex-shrink-0">
          <Film className="h-4 w-4 text-neutral-400" />
          {stageInfo.icon && (
            <div className="absolute -bottom-0.5 -right-0.5">
              {stageInfo.icon}
            </div>
          )}
        </div>
        <span className="text-xs truncate flex-1" title={video.product_name}>
          {video.product_name || '영상 생성 중'}
        </span>
      </div>
      <Progress value={displayProgress} className="h-1" />
      <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
        <span className={stageInfo.showSaving ? 'text-blue-400' : ''}>
          {stageInfo.showSaving ? stageInfo.text : `${displayProgress}%`}
        </span>
        <span>{formatElapsed()}</span>
      </div>
    </div>
  );
};
