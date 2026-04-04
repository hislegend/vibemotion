// Phase 2: 자동 컷 분석 및 적용 UI 컴포넌트
// Phase 3: 버전 프리셋 시스템 추가
// Phase 4: 로컬 영상 자동 업로드 지원
// Inspector에서 VideoItem 선택 시 표시됨

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { VideoItem } from '@/editor/items/video/video-item-type';
import { useAssetFromItem, useWriteContext, useFps } from '@/editor/utils/use-context';
import { 
  VideoSegmentAnalysis, 
  CutSection, 
  DEFAULT_CUTTING_RULES,
  DEFAULT_PRESETS,
  VersionPreset,
} from '@/types/video-segment';
import { buildSections } from '@/editor/auto-cut/build-sections';
import { applyAutoCut, calculateAutoCutPreview } from '@/editor/state/actions/apply-auto-cut';
import { uploadAssetForAnalysis } from '@/editor/utils/upload-asset-for-analysis';
import { finishUpload } from '@/editor/state/actions/finish-upload';
import { Wand2, Scissors, Loader2, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { toast } from 'sonner';
// [STUB] react-router-dom removed

interface AutoCutControlsProps {
  item: VideoItem;
}

type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'analyzed' | 'error';

export const AutoCutControls: React.FC<AutoCutControlsProps> = ({ item }) => {
  const asset = useAssetFromItem(item);
  const { setState } = useWriteContext();
  const { fps } = useFps();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || undefined;
  
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [analysis, setAnalysis] = useState<VideoSegmentAnalysis | null>(null);
  const [sections, setSections] = useState<CutSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<VersionPreset | null>(null);

  // 분석 API 호출
  const handleAnalyze = useCallback(async () => {
    if (asset.type !== 'video') return;
    
    setStatus('analyzing');
    setError(null);
    
    try {
      // 영상 URL 가져오기 (로컬 파일이면 먼저 업로드)
      let videoUrl = asset.remoteUrl;
      
      if (!videoUrl || videoUrl.startsWith('blob:')) {
        // 로컬 파일인 경우 분석 전에 서버에 업로드
        setStatus('uploading');
        toast.info('영상 업로드 중... (AI 분석을 위해 필요)');
        
        const uploadResult = await uploadAssetForAnalysis(asset, projectId);
        videoUrl = uploadResult.remoteUrl;
        
        // 상태 업데이트로 remoteUrl 저장
        setState({
          update: (state) => finishUpload({
            state,
            asset,
            remoteUrl: uploadResult.remoteUrl,
            remoteFileKey: uploadResult.remoteFileKey,
          }),
          commitToUndoStack: false,
        });
        
        toast.success('영상 업로드 완료');
        setStatus('analyzing');
      }
      
      // 영상 길이 (초)
      const durationInSeconds = asset.durationInSeconds;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-video-segments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            videoUrl,
            videoId: item.id,
            duration: durationInSeconds,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '분석 실패');
      }
      
      const analysisResult: VideoSegmentAnalysis = await response.json();
      setAnalysis(analysisResult);
      
      // buildSections로 컷 섹션 생성 (기본 프리셋: 전체)
      const fullPreset = DEFAULT_PRESETS.find(p => p.name === 'Full')!;
      setSelectedPreset(fullPreset);
      
      const cutSections = buildSections(analysisResult, DEFAULT_CUTTING_RULES);
      setSections(cutSections);
      
      setStatus('analyzed');
      toast.success(`${cutSections.length}개 섹션 분석 완료`);
      
    } catch (err) {
      console.error('[AutoCutControls] 분석 오류:', err);
      setError(err instanceof Error ? err.message : '분석 중 오류 발생');
      setStatus('error');
      toast.error('영상 분석 실패');
    }
  }, [asset, item]);

  // 프리셋 선택 핸들러
  const handlePresetSelect = useCallback((preset: VersionPreset) => {
    if (!analysis) return;
    
    setSelectedPreset(preset);
    
    const rules = {
      ...DEFAULT_CUTTING_RULES,
      targetDurationSeconds: preset.targetSeconds || undefined,
    };
    
    const newSections = buildSections(analysis, rules);
    setSections(newSections);
  }, [analysis]);

  // 자동 컷 적용
  const handleApply = useCallback(() => {
    if (sections.length === 0) {
      toast.error('적용할 섹션이 없습니다.');
      return;
    }
    
    setState({
      update: (prevState) => applyAutoCut({
        state: prevState,
        videoItemId: item.id,
        sections,
        fps,
      }),
      commitToUndoStack: true,
    });
    
    toast.success(`${sections.length}개 클립으로 분할 완료`);
    
    // 상태 리셋
    setStatus('idle');
    setAnalysis(null);
    setSections([]);
    setSelectedPreset(null);
  }, [sections, item.id, fps, setState]);

  // 미리보기 정보
  const preview = sections.length > 0 
    ? calculateAutoCutPreview(sections, fps)
    : null;

  return (
    <div className="space-y-3">
      {/* 분석 버튼 */}
      <Button
        variant="default"
        size="sm"
        className="w-full"
        onClick={handleAnalyze}
        disabled={status === 'uploading' || status === 'analyzing'}
      >
        {status === 'uploading' ? (
          <>
            <Upload className="w-4 h-4 mr-2 animate-pulse" />
            영상 업로드 중...
          </>
        ) : status === 'analyzing' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            분석 중...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            자동 컷 분석
          </>
        )}
      </Button>

      {/* 에러 표시 */}
      {status === 'error' && error && (
        <div className="flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 분석 결과 표시 */}
      {status === 'analyzed' && analysis && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>{analysis.segments.length}개 구간 감지됨</span>
          </div>
          
          {/* 프리셋 버튼 그룹 */}
          <div className="flex gap-1">
            {DEFAULT_PRESETS.map(preset => (
              <Button 
                key={preset.name}
                variant={selectedPreset?.name === preset.name ? "default" : "outline"}
                size="sm"
                className="flex-1 text-xs h-7"
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          {/* 섹션 요약 */}
          {preview && (
            <div className="bg-muted/50 rounded p-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">선택된 섹션</span>
                <span>{preview.sectionCount}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">예상 길이</span>
                <span>{preview.totalDurationSeconds.toFixed(1)}초</span>
              </div>
            </div>
          )}
          
          {/* 섹션 미리보기 리스트 */}
          {sections.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {sections.map((sec, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between text-xs bg-muted/30 rounded px-2 py-1"
                >
                  <span className="font-mono">
                    {sec.start.toFixed(1)}s - {sec.end.toFixed(1)}s
                  </span>
                  <span className="text-muted-foreground capitalize">
                    {sec.label}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* 적용 버튼 */}
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={handleApply}
            disabled={sections.length === 0}
          >
            <Scissors className="w-4 h-4 mr-2" />
            자동 컷 적용 ({sections.length}개 클립)
          </Button>
        </div>
      )}
    </div>
  );
};
