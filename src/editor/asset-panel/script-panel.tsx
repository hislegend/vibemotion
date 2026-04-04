import React, { useState, useEffect, useCallback } from 'react';
import { PlayerRef } from '@remotion/player';
import { Loader2, Wand2, Volume2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
// [STUB] supabase import removed
import { useToast } from '@/hooks/use-toast';
import { useWriteContext, useFps, useDimensions, useTracks } from '../utils/use-context';
import { addAsset } from '../assets/add-asset';
import { getScriptForEditor, saveScriptForEditor, getProjectDataForEditor } from '../state/supabase-initial-state';

// OpenAI TTS 음성 옵션
const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy (중성적)', description: '균형 잡힌 중성 음성' },
  { value: 'echo', label: 'Echo (남성)', description: '깊고 차분한 남성 음성' },
  { value: 'fable', label: 'Fable (영국식)', description: '영국식 억양의 음성' },
  { value: 'onyx', label: 'Onyx (남성)', description: '깊고 풍부한 남성 음성' },
  { value: 'nova', label: 'Nova (여성)', description: '밝고 친근한 여성 음성' },
  { value: 'shimmer', label: 'Shimmer (여성)', description: '부드럽고 따뜻한 여성 음성' },
];

interface ScriptPanelProps {
  projectId?: string;
  playerRef: React.RefObject<PlayerRef | null>;
}

export const ScriptPanel: React.FC<ScriptPanelProps> = ({ projectId, playerRef }) => {
  const [scriptText, setScriptText] = useState('');
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [scriptDuration, setScriptDuration] = useState<15 | 30>(30); // 15초 또는 30초
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const { toast } = useToast();
  const timelineWriteContext = useWriteContext();
  const { fps } = useFps();
  const { compositionWidth, compositionHeight } = useDimensions();
  const { tracks } = useTracks();

  // 초기 대본 로드
  useEffect(() => {
    const savedScript = getScriptForEditor();
    if (savedScript) {
      setScriptText(savedScript);
    }
  }, []);

  // 대본 변경 시 저장
  const handleScriptChange = useCallback((value: string) => {
    setScriptText(value);
    saveScriptForEditor(value);
  }, []);

  // AI 대본 자동 생성
  const handleGenerateScript = useCallback(async () => {
    setIsGeneratingScript(true);
    try {
      // 프로젝트 데이터 가져오기
      const projectData = getProjectDataForEditor();
      
      const requestBody: any = {
        productName: projectData?.productName || '',
        productAnalysis: projectData?.productAnalysis || null,
        conceptAnalysis: projectData?.selectedConcept || null,
        imageDescriptions: [],
        duration: scriptDuration, // 대본 길이 전달
      };

      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: requestBody,
      });

      if (error) throw error;
      if (!data?.script) throw new Error('대본 생성 실패');

      handleScriptChange(data.script);
      toast({
        title: '대본 생성 완료',
        description: '나레이션 대본이 생성되었습니다.',
      });
    } catch (error) {
      console.error('Script generation error:', error);
      toast({
        title: '대본 생성 실패',
        description: error instanceof Error ? error.message : '대본 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingScript(false);
    }
  }, [handleScriptChange, toast, scriptDuration]);

  // TTS 음성 생성
  const handleGenerateTTS = useCallback(async () => {
    if (!scriptText.trim()) {
      toast({
        title: '대본 필요',
        description: '음성을 생성하려면 대본을 먼저 작성해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingTTS(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-tts', {
        body: {
          narration: scriptText,
          voice: selectedVoice,
          preview: true, // base64 반환
        },
      });

      if (error) throw error;
      if (!data?.audioContent) throw new Error('TTS 생성 실패');

      // Base64를 Blob으로 변환
      const base64Data = data.audioContent;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const filename = `나레이션_${selectedVoice}_${new Date().toISOString().slice(0, 10)}.mp3`;

      // addAsset 함수를 통해 에셋과 타임라인에 동시 추가
      await addAsset({
        file: audioBlob,
        filename,
        timelineWriteContext,
        playerRef,
        dropPosition: null,
        fps,
        compositionWidth,
        compositionHeight,
        tracks,
      });

      toast({
        title: '음성 생성 완료',
        description: '나레이션 음성이 에셋과 타임라인에 추가되었습니다.',
      });
    } catch (error) {
      console.error('TTS generation error:', error);
      toast({
        title: '음성 생성 실패',
        description: error instanceof Error ? error.message : 'TTS 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingTTS(false);
    }
  }, [scriptText, selectedVoice, timelineWriteContext, playerRef, fps, compositionWidth, compositionHeight, tracks, toast]);

  const charCount = scriptText.length;
  const charMin = scriptDuration === 15 ? 75 : 150;
  const charMax = scriptDuration === 15 ? 100 : 200;
  const isOptimalLength = charCount >= charMin && charCount <= charMax;

  return (
    <div className="flex flex-col h-full space-y-3 p-2">
      {/* 모드 스위치 */}
      <div className="flex items-center justify-between">
        <Label className="text-xs text-neutral-300">생성 모드</Label>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] ${!isAutoMode ? 'text-white' : 'text-neutral-500'}`}>직접 입력</span>
          <Switch
            checked={isAutoMode}
            onCheckedChange={setIsAutoMode}
            className="data-[state=checked]:bg-primary"
          />
          <span className={`text-[10px] ${isAutoMode ? 'text-white' : 'text-neutral-500'}`}>자동 생성</span>
        </div>
      </div>

      {/* 대본 길이 선택 */}
      {isAutoMode && (
        <div className="space-y-1">
          <Label className="text-xs text-neutral-300">대본 길이</Label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScriptDuration(15)}
              className={`flex-1 px-2 py-1.5 text-[10px] rounded transition-colors ${
                scriptDuration === 15 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
              }`}
            >
              15초
            </button>
            <button
              onClick={() => setScriptDuration(30)}
              className={`flex-1 px-2 py-1.5 text-[10px] rounded transition-colors ${
                scriptDuration === 30 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
              }`}
            >
              30초
            </button>
          </div>
        </div>
      )}

      {/* 자동 생성 버튼 */}
      {isAutoMode && (
        <Button
          onClick={handleGenerateScript}
          disabled={isGeneratingScript}
          variant="outline"
          size="sm"
          className="w-full text-xs"
        >
          {isGeneratingScript ? (
            <>
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Wand2 className="mr-1.5 h-3 w-3" />
              AI 대본 생성 ({scriptDuration}초)
            </>
          )}
        </Button>
      )}

      {/* 대본 입력 영역 */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-neutral-300">나레이션 대본</Label>
          <span className={`text-[10px] ${isOptimalLength ? 'text-green-400' : 'text-neutral-500'}`}>
            {charCount}자 {isOptimalLength && <Check className="inline h-3 w-3" />}
          </span>
        </div>
        <Textarea
          value={scriptText}
          onChange={(e) => handleScriptChange(e.target.value)}
          placeholder={`${scriptDuration}초 영상용 나레이션 대본을 입력하세요 (${charMin}~${charMax}자 권장)`}
          className="flex-1 min-h-[120px] text-xs bg-neutral-800 border-neutral-700 resize-none"
        />
        <p className="text-[10px] text-neutral-500">
          {scriptDuration}초 영상 기준 {charMin}~{charMax}자 권장
        </p>
      </div>

      {/* 음성 선택 */}
      <div className="space-y-1">
        <Label className="text-xs text-neutral-300">음성 선택</Label>
        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
          <SelectTrigger className="text-xs bg-neutral-800 border-neutral-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VOICE_OPTIONS.map((voice) => (
              <SelectItem key={voice.value} value={voice.value} className="text-xs">
                <div className="flex flex-col">
                  <span>{voice.label}</span>
                  <span className="text-[10px] text-neutral-500">{voice.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TTS 생성 버튼 */}
      <Button
        onClick={handleGenerateTTS}
        disabled={isGeneratingTTS || !scriptText.trim()}
        className="w-full"
        size="sm"
      >
        {isGeneratingTTS ? (
          <>
            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            음성 생성 중...
          </>
        ) : (
          <>
            <Volume2 className="mr-1.5 h-3 w-3" />
            음성 생성
          </>
        )}
      </Button>
    </div>
  );
};
