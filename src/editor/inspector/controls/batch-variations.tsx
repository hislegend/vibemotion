import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Plus, Loader2 } from 'lucide-react';
import { AutoEditPreset, AutoEditStyle } from '../../../types/auto-edit';
import { VIRAL_TEMPLATES } from '../../../types/viral-template';

export interface BatchVariation {
  id: string;
  preset: AutoEditPreset;
  style: AutoEditStyle;
  templateId: string;
}

interface BatchVariationsProps {
  onGenerateBatch: (variations: BatchVariation[]) => Promise<void>;
  isGenerating?: boolean;
}

const DEFAULT_VARIATION: Omit<BatchVariation, 'id'> = {
  preset: 'Ad30',
  style: 'dynamic',
  templateId: 'hook-feature-cta',
};

export const BatchVariations: React.FC<BatchVariationsProps> = ({
  onGenerateBatch,
  isGenerating = false,
}) => {
  const [variations, setVariations] = useState<BatchVariation[]>([
    { ...DEFAULT_VARIATION, id: '1' },
  ]);

  const addVariation = () => {
    if (variations.length >= 5) return;
    
    const newId = String(Date.now());
    setVariations((prev) => [...prev, { ...DEFAULT_VARIATION, id: newId }]);
  };

  const removeVariation = (id: string) => {
    if (variations.length <= 1) return;
    setVariations((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVariation = (id: string, updates: Partial<BatchVariation>) => {
    setVariations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const handleGenerate = async () => {
    await onGenerateBatch(variations);
  };

  const getPresetLabel = (preset: AutoEditPreset) => {
    switch (preset) {
      case 'Ad15':
        return '15초';
      case 'Ad30':
        return '30초';
      case 'Full':
        return '전체';
    }
  };

  const getStyleLabel = (style: AutoEditStyle) => {
    switch (style) {
      case 'minimal':
        return '미니멀';
      case 'dynamic':
        return '다이나믹';
      case 'cinematic':
        return '시네마틱';
    }
  };

  return (
    <div className="space-y-4">
      {/* 버전 목록 */}
      <div className="space-y-3">
        {variations.map((variation, index) => (
          <div
            key={variation.id}
            className="p-3 rounded-lg border border-border bg-card space-y-2"
          >
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                버전 {index + 1}
              </Badge>
              {variations.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeVariation(variation.id)}
                  disabled={isGenerating}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* 프리셋 */}
              <div>
                <Label className="text-[10px] text-muted-foreground">길이</Label>
                <Select
                  value={variation.preset}
                  onValueChange={(value: AutoEditPreset) =>
                    updateVariation(variation.id, { preset: value })
                  }
                  disabled={isGenerating}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ad15">15초</SelectItem>
                    <SelectItem value="Ad30">30초</SelectItem>
                    <SelectItem value="Full">전체</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 스타일 */}
              <div>
                <Label className="text-[10px] text-muted-foreground">스타일</Label>
                <Select
                  value={variation.style}
                  onValueChange={(value: AutoEditStyle) =>
                    updateVariation(variation.id, { style: value })
                  }
                  disabled={isGenerating}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">미니멀</SelectItem>
                    <SelectItem value="dynamic">다이나믹</SelectItem>
                    <SelectItem value="cinematic">시네마틱</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 템플릿 */}
              <div>
                <Label className="text-[10px] text-muted-foreground">템플릿</Label>
                <Select
                  value={variation.templateId}
                  onValueChange={(value) =>
                    updateVariation(variation.id, { templateId: value })
                  }
                  disabled={isGenerating}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIRAL_TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nameKr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 버전 추가 버튼 */}
      {variations.length < 5 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={addVariation}
          disabled={isGenerating}
        >
          <Plus className="h-3 w-3 mr-1" />
          버전 추가 (최대 5개)
        </Button>
      )}

      {/* 요약 */}
      <div className="p-2 rounded bg-muted/50 text-xs text-muted-foreground">
        <p>
          {variations.length}개 버전 생성 예정:
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {variations.map((v, i) => (
            <Badge key={v.id} variant="secondary" className="text-[10px]">
              {getPresetLabel(v.preset)} / {getStyleLabel(v.style)}
            </Badge>
          ))}
        </div>
      </div>

      {/* 일괄 생성 버튼 */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || variations.length === 0}
        className="w-full"
        size="sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            생성 중...
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            🚀 {variations.length}개 버전 일괄 생성
          </>
        )}
      </Button>
    </div>
  );
};
