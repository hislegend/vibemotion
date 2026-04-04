import React, { useCallback, useState } from 'react';
import { TextButton } from '../../action-row/text-button';
import { InspectorLabel } from '../components/inspector-label';
import { InspectorSection } from '../components/inspector-section';
import { VideoItem } from '../../items/video/video-item-type';
import { usePreferredLocalUrl } from '../../utils/find-asset-by-id';
import { useAssetFromItem } from '../../utils/use-context';
import { extractAudio } from '../../captioning/audio-buffer-to-wav';

/**
 * 비디오에서 오디오를 추출하여 WAV 파일로 다운로드하는 컴포넌트
 */
export const ExtractAudioSection: React.FC<{
  item: VideoItem;
}> = ({ item }) => {
  const asset = useAssetFromItem(item);
  const src = usePreferredLocalUrl(asset);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractAudio = useCallback(async () => {
    if (!src) return;
    
    setIsExtracting(true);
    
    try {
      // 오디오 추출 (WAV 형식)
      const wavBuffer = await extractAudio(src);
      
      // Blob 생성 및 다운로드
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      const filename = asset.filename?.replace(/\.[^.]+$/, '') || 'audio';
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('오디오 추출 실패:', error);
      alert('오디오 추출에 실패했습니다.');
    } finally {
      setIsExtracting(false);
    }
  }, [src, asset.filename]);

  if (asset.type !== 'video') {
    return null;
  }

  return (
    <InspectorSection>
      <InspectorLabel>오디오 추출</InspectorLabel>
      <div className="h-2" />
      <TextButton onClick={handleExtractAudio} disabled={isExtracting || !src}>
        {isExtracting ? '추출 중...' : '오디오 다운로드 (WAV)'}
      </TextButton>
    </InspectorSection>
  );
};
