import React, { useState, useCallback } from 'react';
import { X, Save, Plus, Trash2, GripVertical, AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useTemplateEditContext } from './template-edit-state';
import { TextLayerConfig, TextStylePreset, TextLayerRole, VerticalAlign, TextAnimationType } from '@/types/text-style-preset';
import { TEXT_STYLE_PRESETS } from '@/data/text-style-presets';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ANIMATION_TYPES, ANIMATION_TYPE_LABELS } from '@/editor/items/text/text-animation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TemplateEditOverlayProps {
  onClose?: () => void;
}

/**
 * 템플릿 편집 사이드바 - 뷰포트와 함께 사용
 * 실제 캔버스 위에 오버레이되는 방식으로 변경됨
 */
export const TemplateEditOverlay: React.FC<TemplateEditOverlayProps> = ({ onClose }) => {
  const { state, updateTemplateName, addLayer, updateLayer, removeLayer, saveTemplate, exitEditMode } =
    useTemplateEditContext();
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const handleSave = useCallback(() => {
    const isEditing = !!state.editingTemplateId;
    const result = saveTemplate();
    if (result) {
      toast.success(isEditing ? `템플릿 "${result.name}" 수정됨` : `템플릿 "${result.name}" 생성됨`);
      onClose?.();
    } else {
      toast.error('템플릿 저장 실패: 이름과 레이어를 확인하세요');
    }
  }, [saveTemplate, onClose, state.editingTemplateId]);

  const handleCancel = useCallback(() => {
    exitEditMode();
    onClose?.();
  }, [exitEditMode, onClose]);

  const handleAddLayer = useCallback(() => {
    const defaultPreset = TEXT_STYLE_PRESETS[0];
    // 기본 텍스트 너비를 넉넉하게 설정 (600px)
    const estimatedWidthPx = 600;
    const newLayer: TextLayerConfig = {
      id: `layer-${Date.now()}`,
      role: 'main',
      text: '새 텍스트',
      preset: { ...defaultPreset },
      position: { top: 50, left: 50, width: 80, widthPx: estimatedWidthPx },
    };
    addLayer(newLayer);
    setSelectedLayerId(newLayer.id);
  }, [addLayer]);

  const selectedLayer = state.layers.find((l) => l.id === selectedLayerId);

  // 편집 모드가 아니면 렌더링하지 않음
  if (!state.active) return null;

  return (
    <>
      {/* 타임라인 영역만 차단 (하단) - 뷰포트는 열어둠 */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-[280px] bg-black/60 pointer-events-auto z-40"
        onClick={(e) => e.stopPropagation()}
      />
      
      {/* 상단 배너 */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-neutral-900/95 border-b border-neutral-700 flex items-center justify-between px-4 pointer-events-auto z-50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-white">
            {state.editingTemplateId ? '템플릿 수정 모드' : '새 템플릿 생성 모드'}
          </span>
          <span className="text-xs text-neutral-400">
            캔버스에서 직접 레이어 위치를 조정할 수 있습니다
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleCancel} className="text-neutral-300 hover:text-white">
            취소
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={state.layers.length === 0}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          >
            <Save className="h-4 w-4 mr-1" />
            저장
          </Button>
        </div>
      </div>

      {/* 오른쪽: 편집 패널 */}
      <div className="fixed top-12 right-0 bottom-0 w-[360px] bg-neutral-900 border-l border-neutral-700 flex flex-col pointer-events-auto z-50">
        {/* 템플릿 이름 */}
        <div className="p-3 border-b border-neutral-700">
          <Label className="text-xs text-white mb-1.5 block font-medium">템플릿 이름</Label>
          <Input
            value={state.templateName}
            onChange={(e) => updateTemplateName(e.target.value)}
            placeholder="템플릿 이름 입력"
            className="h-8 text-sm bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-500"
          />
        </div>

        {/* 레이어 목록 */}
        <div className="p-3 border-b border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-white font-medium">레이어</Label>
            <Button size="sm" variant="ghost" onClick={handleAddLayer} className="h-6 px-2 text-neutral-300 hover:text-white hover:bg-neutral-700">
              <Plus className="h-3 w-3 mr-1" />
              추가
            </Button>
          </div>
          <div className="space-y-1">
            {state.layers.length === 0 ? (
              <div className="text-center py-4 text-neutral-400 text-xs">
                레이어를 추가하세요
              </div>
            ) : (
              state.layers.map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded cursor-pointer text-xs',
                    selectedLayerId === layer.id 
                      ? 'bg-primary/20 border border-primary/50 text-white' 
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  )}
                >
                  <GripVertical className="h-3 w-3 text-neutral-500" />
                  <span className="flex-1 truncate">{layer.text}</span>
                  <span className="text-neutral-400 text-[10px] uppercase">{layer.role}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(layer.id);
                      if (selectedLayerId === layer.id) setSelectedLayerId(null);
                    }}
                    className="p-1 hover:bg-red-900/50 rounded text-neutral-400 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 선택된 레이어 편집 */}
        <ScrollArea className="flex-1">
          {selectedLayer ? (
            <LayerEditor layer={selectedLayer} onUpdate={(updates) => updateLayer(selectedLayer.id, updates)} />
          ) : (
            <div className="p-4 text-center text-neutral-400 text-xs">
              레이어를 선택하여 편집하세요
            </div>
          )}
        </ScrollArea>

        {/* 하단 저장 버튼 */}
        <div className="p-3 border-t border-neutral-700">
          <Button 
            onClick={handleSave} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold" 
            disabled={state.layers.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            템플릿 저장
          </Button>
        </div>
      </div>
    </>
  );
};

// 레이어 편집기
interface LayerEditorProps {
  layer: TextLayerConfig;
  onUpdate: (updates: Partial<TextLayerConfig>) => void;
}

const LayerEditor: React.FC<LayerEditorProps> = ({ layer, onUpdate }) => {
  const handlePresetChange = (presetId: string) => {
    const preset = TEXT_STYLE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onUpdate({ preset: { ...preset } });
    }
  };

  const handlePositionChange = (key: keyof TextLayerConfig['position'], value: number) => {
    onUpdate({
      position: { ...layer.position, [key]: value },
    });
  };

  const handlePresetPropertyChange = <K extends keyof TextStylePreset>(key: K, value: TextStylePreset[K]) => {
    onUpdate({
      preset: { ...layer.preset, [key]: value },
    });
  };

  return (
    <div className="p-3 space-y-4">
      {/* 텍스트 */}
      <div>
        <Label className="text-xs text-white mb-1.5 block font-medium">텍스트</Label>
        <Input
          value={layer.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="h-8 text-sm bg-neutral-800 border-neutral-600 text-white"
        />
      </div>

      {/* 역할 */}
      <div>
        <Label className="text-xs text-white mb-1.5 block font-medium">역할</Label>
        <Select value={layer.role} onValueChange={(v: TextLayerRole) => onUpdate({ role: v })}>
          <SelectTrigger className="h-8 text-sm bg-neutral-800 border-neutral-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">메인</SelectItem>
            <SelectItem value="sub">서브</SelectItem>
            <SelectItem value="cta">CTA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 기본 스타일 프리셋 선택 */}
      <div>
        <Label className="text-xs text-white mb-1.5 block font-medium">기본 스타일</Label>
        <Select value={layer.preset.id} onValueChange={handlePresetChange}>
          <SelectTrigger className="h-8 text-sm bg-neutral-800 border-neutral-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEXT_STYLE_PRESETS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 위치 조정 */}
      <div className="space-y-3">
        <Label className="text-xs text-white block font-medium">위치</Label>
        <div>
          <div className="flex justify-between text-[10px] text-neutral-300 mb-1">
            <span>상단</span>
            <span>{layer.position.top}%</span>
          </div>
          <Slider
            value={[layer.position.top]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => handlePositionChange('top', v)}
            className="[&_[role=slider]]:bg-white"
          />
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-neutral-300 mb-1">
            <span>좌우</span>
            <span>{layer.position.left}%</span>
          </div>
          <Slider
            value={[layer.position.left]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => handlePositionChange('left', v)}
            className="[&_[role=slider]]:bg-white"
          />
        </div>
      </div>

      {/* 텍스트 정렬 */}
      <div className="space-y-3">
        <Label className="text-xs text-white block font-medium">텍스트 정렬</Label>
        <div>
          <div className="text-[10px] text-neutral-300 mb-1.5">수평</div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={layer.preset.align === 'left' ? 'default' : 'ghost'}
              className={cn('h-8 w-8 p-0', layer.preset.align === 'left' ? 'bg-primary' : 'bg-neutral-700')}
              onClick={() => handlePresetPropertyChange('align', 'left')}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={layer.preset.align === 'center' ? 'default' : 'ghost'}
              className={cn('h-8 w-8 p-0', layer.preset.align === 'center' ? 'bg-primary' : 'bg-neutral-700')}
              onClick={() => handlePresetPropertyChange('align', 'center')}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={layer.preset.align === 'right' ? 'default' : 'ghost'}
              className={cn('h-8 w-8 p-0', layer.preset.align === 'right' ? 'bg-primary' : 'bg-neutral-700')}
              onClick={() => handlePresetPropertyChange('align', 'right')}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-neutral-300 mb-1.5">수직</div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={layer.preset.verticalAlign === 'top' ? 'default' : 'ghost'}
              className={cn('h-8 w-8 p-0', layer.preset.verticalAlign === 'top' ? 'bg-primary' : 'bg-neutral-700')}
              onClick={() => handlePresetPropertyChange('verticalAlign', 'top' as VerticalAlign)}
            >
              <AlignVerticalJustifyStart className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={layer.preset.verticalAlign === 'middle' ? 'default' : 'ghost'}
              className={cn('h-8 w-8 p-0', layer.preset.verticalAlign === 'middle' ? 'bg-primary' : 'bg-neutral-700')}
              onClick={() => handlePresetPropertyChange('verticalAlign', 'middle' as VerticalAlign)}
            >
              <AlignVerticalJustifyCenter className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={layer.preset.verticalAlign === 'bottom' ? 'default' : 'ghost'}
              className={cn('h-8 w-8 p-0', layer.preset.verticalAlign === 'bottom' ? 'bg-primary' : 'bg-neutral-700')}
              onClick={() => handlePresetPropertyChange('verticalAlign', 'bottom' as VerticalAlign)}
            >
              <AlignVerticalJustifyEnd className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 폰트 크기 */}
      <div>
        <div className="flex justify-between text-[10px] text-neutral-300 mb-1">
          <span>폰트 크기</span>
          <span>{layer.preset.fontSize}px</span>
        </div>
        <Slider
          value={[layer.preset.fontSize]}
          min={12}
          max={120}
          step={1}
          onValueChange={([v]) => handlePresetPropertyChange('fontSize', v)}
          className="[&_[role=slider]]:bg-white"
        />
      </div>

      {/* B/I/U 서식 */}
      <div>
        <Label className="text-xs text-white mb-1.5 block font-medium">서식</Label>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={layer.preset.isBold ? 'default' : 'ghost'}
            className={cn('h-8 w-8 p-0', layer.preset.isBold ? 'bg-primary' : 'bg-neutral-700')}
            onClick={() => handlePresetPropertyChange('isBold', !layer.preset.isBold)}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={layer.preset.isItalic ? 'default' : 'ghost'}
            className={cn('h-8 w-8 p-0', layer.preset.isItalic ? 'bg-primary' : 'bg-neutral-700')}
            onClick={() => handlePresetPropertyChange('isItalic', !layer.preset.isItalic)}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={layer.preset.isUnderline ? 'default' : 'ghost'}
            className={cn('h-8 w-8 p-0', layer.preset.isUnderline ? 'bg-primary' : 'bg-neutral-700')}
            onClick={() => handlePresetPropertyChange('isUnderline', !layer.preset.isUnderline)}
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 줄 높이 & 자간 */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex justify-between text-[10px] text-neutral-300 mb-1">
            <span>줄 높이</span>
            <span>{layer.preset.lineHeight?.toFixed(1) ?? '1.2'}</span>
          </div>
          <Slider
            value={[layer.preset.lineHeight ?? 1.2]}
            min={0.5}
            max={3}
            step={0.1}
            onValueChange={([v]) => handlePresetPropertyChange('lineHeight', v)}
            className="[&_[role=slider]]:bg-white"
          />
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-neutral-300 mb-1">
            <span>자간</span>
            <span>{layer.preset.letterSpacing ?? 0}px</span>
          </div>
          <Slider
            value={[layer.preset.letterSpacing ?? 0]}
            min={-5}
            max={20}
            step={0.5}
            onValueChange={([v]) => handlePresetPropertyChange('letterSpacing', v)}
            className="[&_[role=slider]]:bg-white"
          />
        </div>
      </div>

      {/* 색상 */}
      <div>
        <Label className="text-xs text-white mb-1.5 block font-medium">텍스트 색상</Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={layer.preset.color}
            onChange={(e) => handlePresetPropertyChange('color', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-neutral-600"
          />
          <Input
            value={layer.preset.color}
            onChange={(e) => handlePresetPropertyChange('color', e.target.value)}
            className="h-8 text-sm flex-1 bg-neutral-800 border-neutral-600 text-white"
          />
        </div>
      </div>

      {/* 배경 색상 */}
      <div>
        <Label className="text-xs text-white mb-1.5 block font-medium">배경 색상</Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={layer.preset.backgroundColor === 'transparent' ? '#000000' : layer.preset.backgroundColor}
            onChange={(e) => handlePresetPropertyChange('backgroundColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-neutral-600"
          />
          <Input
            value={layer.preset.backgroundColor}
            onChange={(e) => handlePresetPropertyChange('backgroundColor', e.target.value)}
            className="h-8 text-sm flex-1 bg-neutral-800 border-neutral-600 text-white"
            placeholder="transparent"
          />
        </div>
      </div>

      {/* 배경 패딩 */}
      <div>
        <div className="flex justify-between text-[10px] text-neutral-300 mb-1">
          <span>배경 패딩</span>
          <span>{layer.preset.backgroundPadding}px</span>
        </div>
        <Slider
          value={[layer.preset.backgroundPadding]}
          min={0}
          max={40}
          step={1}
          onValueChange={([v]) => handlePresetPropertyChange('backgroundPadding', v)}
          className="[&_[role=slider]]:bg-white"
        />
      </div>

      {/* 배경 크기 (배경색이 있을 때만 표시) */}
      {layer.preset.backgroundColor !== 'transparent' && (
        <div className="space-y-3 border-t border-neutral-700 pt-3">
          <Label className="text-xs text-white block font-medium">배경 박스 크기</Label>
          
          {/* 고정 너비 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-neutral-300">고정 너비</span>
              <Switch
                checked={layer.preset.backgroundWidth !== undefined}
                onCheckedChange={(checked) => 
                  handlePresetPropertyChange('backgroundWidth', checked ? 200 : undefined)
                }
              />
            </div>
            {layer.preset.backgroundWidth !== undefined && (
              <div className="flex gap-2 items-center">
                <Slider
                  value={[layer.preset.backgroundWidth]}
                  min={50}
                  max={800}
                  step={10}
                  onValueChange={([v]) => handlePresetPropertyChange('backgroundWidth', v)}
                  className="flex-1 [&_[role=slider]]:bg-white"
                />
                <span className="text-[10px] text-neutral-400 w-12 text-right">{layer.preset.backgroundWidth}px</span>
              </div>
            )}
          </div>
          
          {/* 고정 높이 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-neutral-300">고정 높이</span>
              <Switch
                checked={layer.preset.backgroundHeight !== undefined}
                onCheckedChange={(checked) => 
                  handlePresetPropertyChange('backgroundHeight', checked ? 60 : undefined)
                }
              />
            </div>
            {layer.preset.backgroundHeight !== undefined && (
              <div className="flex gap-2 items-center">
                <Slider
                  value={[layer.preset.backgroundHeight]}
                  min={20}
                  max={300}
                  step={5}
                  onValueChange={([v]) => handlePresetPropertyChange('backgroundHeight', v)}
                  className="flex-1 [&_[role=slider]]:bg-white"
                />
                <span className="text-[10px] text-neutral-400 w-12 text-right">{layer.preset.backgroundHeight}px</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 테두리 */}
      <div className="space-y-2 border-t border-neutral-700 pt-3">
        <Label className="text-xs text-white block font-medium">테두리</Label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={layer.preset.strokeColor === 'transparent' ? '#000000' : layer.preset.strokeColor}
            onChange={(e) => handlePresetPropertyChange('strokeColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-neutral-600"
          />
          <Slider
            value={[layer.preset.strokeWidth]}
            min={0}
            max={10}
            step={0.5}
            onValueChange={([v]) => handlePresetPropertyChange('strokeWidth', v)}
            className="flex-1 [&_[role=slider]]:bg-white"
          />
          <span className="text-[10px] text-neutral-400 w-8 text-right">{layer.preset.strokeWidth}px</span>
        </div>
      </div>

      {/* 그림자 */}
      <div className="space-y-2 border-t border-neutral-700 pt-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-white font-medium">그림자</Label>
          <Switch
            checked={layer.preset.shadowEnabled}
            onCheckedChange={(checked) => handlePresetPropertyChange('shadowEnabled', checked)}
          />
        </div>
        {layer.preset.shadowEnabled && (
          <div className="space-y-2 pl-2 border-l border-neutral-600">
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={layer.preset.shadowColor === 'transparent' ? '#000000' : layer.preset.shadowColor}
                onChange={(e) => handlePresetPropertyChange('shadowColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border border-neutral-600"
              />
              <span className="text-[10px] text-neutral-300">색상</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-neutral-300 block mb-1">흐림</span>
                <Slider value={[layer.preset.shadowBlur]} min={0} max={30} step={1} onValueChange={([v]) => handlePresetPropertyChange('shadowBlur', v)} className="[&_[role=slider]]:bg-white" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-300 block mb-1">X</span>
                <Slider value={[layer.preset.shadowOffsetX]} min={-20} max={20} step={1} onValueChange={([v]) => handlePresetPropertyChange('shadowOffsetX', v)} className="[&_[role=slider]]:bg-white" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-300 block mb-1">Y</span>
                <Slider value={[layer.preset.shadowOffsetY]} min={-20} max={20} step={1} onValueChange={([v]) => handlePresetPropertyChange('shadowOffsetY', v)} className="[&_[role=slider]]:bg-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 애니메이션 */}
      <div className="space-y-2 border-t border-neutral-700 pt-3">
        <Label className="text-xs text-white block font-medium">애니메이션</Label>
        <Select value={layer.preset.animationType ?? 'none'} onValueChange={(v: TextAnimationType) => handlePresetPropertyChange('animationType', v)}>
          <SelectTrigger className="h-8 text-sm bg-neutral-800 border-neutral-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANIMATION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{ANIMATION_TYPE_LABELS[type]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(layer.preset.animationType ?? 'none') !== 'none' && (
          <div>
            <div className="flex justify-between text-[10px] text-neutral-300 mb-1">
              <span>강도</span>
              <span>{Math.round((layer.preset.animationIntensity ?? 0.5) * 100)}%</span>
            </div>
            <Slider
              value={[(layer.preset.animationIntensity ?? 0.5)]}
              min={0.1}
              max={1}
              step={0.1}
              onValueChange={([v]) => handlePresetPropertyChange('animationIntensity', v)}
              className="[&_[role=slider]]:bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
