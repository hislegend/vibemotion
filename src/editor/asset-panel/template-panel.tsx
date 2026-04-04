import React, { useState, useCallback, useEffect } from 'react';
import { PlayerRef } from '@remotion/player';
import { Check, Plus, Type, Layers, Edit2, Trash2, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TEXT_STYLE_PRESETS,
  COMPOSITE_TEMPLATES,
  getCategoryColor,
  getCategoryLabel,
} from '@/data/text-style-presets';
import { TextStylePreset, CompositeTextTemplate, TextLayerConfig } from '@/types/text-style-preset';
import { useSelectedItems, useWriteContext, useDimensions, useFps, useAllItems } from '../utils/use-context';
import { changeItem } from '../state/actions/change-item';
import { addItem } from '../state/actions/add-item';
import { generateRandomId } from '../utils/generate-random-id';
import { cn } from '@/lib/utils';
import { TextItem } from '../items/text/text-item-type';
import { loadCustomTemplates, deleteCustomTemplate, duplicateCustomTemplate } from '../utils/template-storage';
import { useTemplateEditContext } from '../template/template-edit-state';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TemplatePanelProps {
  playerRef: React.RefObject<PlayerRef | null>;
}

type ViewMode = 'presets' | 'composites';

export const TemplatePanel: React.FC<TemplatePanelProps> = ({ playerRef }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('composites');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedCompositeId, setSelectedCompositeId] = useState<string | null>(null);
  const [customTemplates, setCustomTemplates] = useState<CompositeTextTemplate[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const { selectedItems } = useSelectedItems();
  const { items } = useAllItems();
  const { setState } = useWriteContext();
  const { compositionWidth, compositionHeight } = useDimensions();
  const { fps } = useFps();
  
  // Template edit context - may not be available
  let templateEditContext: ReturnType<typeof useTemplateEditContext> | null = null;
  try {
    templateEditContext = useTemplateEditContext();
  } catch {
    // Context not available, that's okay
  }

  // 커스텀 템플릿 로드 - 초기 및 편집 모드 종료 시 갱신
  useEffect(() => {
    setCustomTemplates(loadCustomTemplates());
  }, []);

  // 편집 모드 종료 시 템플릿 목록 갱신 및 선택 상태 초기화
  useEffect(() => {
    if (templateEditContext && !templateEditContext.state.active) {
      setCustomTemplates(loadCustomTemplates());
      setSelectedCompositeId(null); // 편집 취소 시 선택 상태도 초기화
    }
  }, [templateEditContext?.state.active]);

  const refreshCustomTemplates = useCallback(() => {
    setCustomTemplates(loadCustomTemplates());
  }, []);

  // 모든 복합 템플릿 (기본 + 커스텀) - 중복 ID 필터링
  // 커스텀 템플릿이 기본 템플릿과 ID 충돌 시 커스텀 우선
  const allCompositeTemplates = React.useMemo(() => {
    const customIds = new Set(customTemplates.map(t => t.id));
    const filteredBuiltIn = COMPOSITE_TEMPLATES.filter(t => !customIds.has(t.id));
    return [...filteredBuiltIn, ...customTemplates];
  }, [customTemplates]);

  // 선택된 텍스트 아이템 찾기
  const selectedTextItems = selectedItems
    .map((id) => items[id])
    .filter((item): item is TextItem => item?.type === 'text');

  const hasSelectedText = selectedTextItems.length > 0;

  // 프리셋 스타일을 텍스트 아이템에 적용
  const applyPresetToItem = useCallback(
    (preset: TextStylePreset) => {
      if (!hasSelectedText) return;

      setState({
        update: (state) => {
          let newState = state;
          for (const textItem of selectedTextItems) {
            newState = changeItem(newState, textItem.id, (item) => {
              if (item.type !== 'text') return item;
              return {
                ...item,
                fontSize: preset.fontSize,
                fontFamily: preset.fontFamily,
                fontStyle: {
                  variant: 'normal',
                  weight: preset.fontWeight,
                },
                color: preset.color,
                align: preset.align,
                strokeWidth: preset.strokeWidth,
                strokeColor: preset.strokeColor,
                shadowEnabled: preset.shadowEnabled,
                shadowColor: preset.shadowColor,
                shadowBlur: preset.shadowBlur,
                shadowOffsetX: preset.shadowOffsetX,
                shadowOffsetY: preset.shadowOffsetY,
                backgroundColor: preset.backgroundColor,
                backgroundPadding: preset.backgroundPadding,
                fadeInDurationInSeconds: preset.fadeInDurationInSeconds,
                fadeOutDurationInSeconds: preset.fadeOutDurationInSeconds,
                isBold: preset.isBold,
                isItalic: preset.isItalic,
                isUnderline: preset.isUnderline,
              };
            });
          }
          return newState;
        },
        commitToUndoStack: true,
      });
    },
    [hasSelectedText, selectedTextItems, setState]
  );

  // 프리셋 스타일로 새 텍스트 추가
  const addNewTextWithPreset = useCallback(
    (preset: TextStylePreset, customText?: string, customPosition?: { top: number; left: number; widthPx?: number; heightPx?: number }) => {
      const currentFrame = playerRef.current?.getCurrentFrame() ?? 0;
      const itemId = generateRandomId();
      const durationInFrames = fps * 3; // 3초

      // 화면 중앙에 배치 또는 커스텀 위치
      // widthPx가 제공되면 15% 마진 추가 (렌더링 차이 보정), 아니면 기본값 600
      const baseWidth = customPosition?.widthPx 
        ? Math.ceil(customPosition.widthPx * 1.15) // 15% 안전 마진
        : 600;
      const textWidth = Math.min(baseWidth, compositionWidth * 0.9); // 캔버스 90% 초과 방지
      
      // 높이도 동적 계산 - heightPx가 있으면 사용, 없으면 폰트 기반 추정
      const estimatedHeight = customPosition?.heightPx 
        ? Math.ceil(customPosition.heightPx * 1.15) // 높이에도 15% 마진
        : Math.ceil(preset.fontSize * 1.5 + (preset.backgroundPadding || 0) * 2);
      const textHeight = Math.max(estimatedHeight, 50); // 최소 50px
      
      const left = customPosition 
        ? Math.round((compositionWidth * customPosition.left / 100) - textWidth / 2)
        : Math.round((compositionWidth - textWidth) / 2);
      const top = customPosition
        ? Math.round((compositionHeight * customPosition.top / 100) - textHeight / 2)
        : Math.round((compositionHeight - textHeight) / 2);

      const newItem: TextItem = {
        id: itemId,
        type: 'text',
        text: customText || '샘플 텍스트',
        from: currentFrame,
        durationInFrames,
        top,
        left,
        width: textWidth,
        height: textHeight,
        opacity: 1,
        rotation: 0,
        fontSize: preset.fontSize,
        fontFamily: preset.fontFamily,
        fontStyle: {
          variant: 'normal',
          weight: preset.fontWeight,
        },
        color: preset.color,
        align: preset.align,
        lineHeight: 1.2,
        letterSpacing: 0,
        resizeOnEdit: true,
        direction: 'ltr',
        strokeWidth: preset.strokeWidth,
        strokeColor: preset.strokeColor,
        shadowEnabled: preset.shadowEnabled,
        shadowColor: preset.shadowColor,
        shadowBlur: preset.shadowBlur,
        shadowOffsetX: preset.shadowOffsetX,
        shadowOffsetY: preset.shadowOffsetY,
        backgroundColor: preset.backgroundColor,
        backgroundPadding: preset.backgroundPadding,
        fadeInDurationInSeconds: preset.fadeInDurationInSeconds,
        fadeOutDurationInSeconds: preset.fadeOutDurationInSeconds,
        isBold: preset.isBold,
        isItalic: preset.isItalic,
        isUnderline: preset.isUnderline,
        isDraggingInTimeline: false,
        // 애니메이션 효과
        animationType: preset.animationType ?? 'none',
        animationIntensity: preset.animationIntensity ?? 0.5,
      };

      setState({
        update: (state) => addItem({ state, item: newItem, select: false, position: { type: 'front' } }),
        commitToUndoStack: true,
      });
      
      return itemId;
    },
    [playerRef, fps, compositionWidth, compositionHeight, setState]
  );

  // 복합 템플릿의 모든 레이어를 한 번에 추가
  const addCompositeTemplate = useCallback(
    (template: CompositeTextTemplate) => {
      const addedItemIds: string[] = [];
      
      for (const layer of template.layers) {
        const itemId = addNewTextWithPreset(
          layer.preset,
          layer.text,
          { 
            top: layer.position.top, 
            left: layer.position.left,
            widthPx: layer.position.widthPx,  // 저장된 픽셀 너비 사용
            heightPx: layer.position.heightPx // 저장된 픽셀 높이 사용
          }
        );
        addedItemIds.push(itemId);
      }
      
      // 마지막 아이템 선택
      if (addedItemIds.length > 0) {
        setState({
          update: (state) => ({
            ...state,
            selectedItems: addedItemIds,
          }),
          commitToUndoStack: false,
        });
      }
    },
    [addNewTextWithPreset, setState]
  );

  const handleDeleteTemplate = (templateId: string) => {
    deleteCustomTemplate(templateId);
    refreshCustomTemplates();
    if (selectedCompositeId === templateId) {
      setSelectedCompositeId(null);
    }
    setDeleteConfirmId(null);
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const duplicated = duplicateCustomTemplate(templateId);
    if (duplicated) {
      refreshCustomTemplates();
      toast.success(`템플릿 "${duplicated.name}" 복제됨`);
    }
  };

  const handleCreateTemplate = () => {
    if (templateEditContext) {
      templateEditContext.enterCreateMode();
    }
  };

  const handleEditTemplate = (template: CompositeTextTemplate) => {
    if (templateEditContext) {
      templateEditContext.enterEditMode(template);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* 헤더 - 고정 */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-neutral-700 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-neutral-300">텍스트 템플릿</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            스타일을 선택하여 텍스트에 적용하세요
          </div>
        </div>
        {templateEditContext && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={handleCreateTemplate}
          >
            <Plus className="h-3 w-3 mr-1" />
            추가
          </Button>
        )}
      </div>

      {/* 뷰 모드 탭 - 고정 */}
      <div className="flex-shrink-0 flex border-b border-neutral-700">
        <button
          onClick={() => setViewMode('composites')}
          className={cn(
            'flex-1 py-1.5 text-[11px] font-medium transition-colors',
            viewMode === 'composites'
              ? 'bg-neutral-700 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          )}
        >
          <Layers className="inline-block h-3 w-3 mr-1" />
          복합 템플릿
        </button>
        <button
          onClick={() => setViewMode('presets')}
          className={cn(
            'flex-1 py-1.5 text-[11px] font-medium transition-colors',
            viewMode === 'presets'
              ? 'bg-neutral-700 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          )}
        >
          <Type className="inline-block h-3 w-3 mr-1" />
          단일 스타일
        </button>
      </div>

      {/* 스크롤 가능한 템플릿 목록 - 버튼도 스크롤 안에 포함 */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2">
          {viewMode === 'composites' ? (
            <div className="grid grid-cols-1 gap-2">
              {allCompositeTemplates.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  복합 템플릿이 없습니다.<br />
                  상단 [추가] 버튼을 눌러 생성하세요.
                </div>
              ) : (
                allCompositeTemplates.map((template) => (
                  <CompositeTemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedCompositeId === template.id}
                    onClick={() => setSelectedCompositeId(template.id)}
                    onApply={() => addCompositeTemplate(template)}
                    onEdit={templateEditContext ? () => handleEditTemplate(template) : undefined}
                    onDuplicate={template.isCustom ? () => handleDuplicateTemplate(template.id) : undefined}
                    onDelete={template.isCustom ? () => setDeleteConfirmId(template.id) : undefined}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {TEXT_STYLE_PRESETS.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isSelected={selectedPresetId === preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  onApply={() => applyPresetToItem(preset)}
                  onAddNew={() => addNewTextWithPreset(preset)}
                  hasSelectedText={hasSelectedText}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>템플릿 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 템플릿을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirmId && handleDeleteTemplate(deleteConfirmId)}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// 복합 템플릿 카드 컴포넌트
interface CompositeTemplateCardProps {
  template: CompositeTextTemplate;
  isSelected: boolean;
  onClick: () => void;
  onApply: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const CompositeTemplateCard: React.FC<CompositeTemplateCardProps> = ({
  template,
  isSelected,
  onClick,
  onApply,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-3 rounded-lg border cursor-pointer transition-all',
        'hover:border-primary/50 hover:bg-neutral-800/50',
        isSelected ? 'border-primary bg-neutral-800' : 'border-neutral-700 bg-neutral-900'
      )}
    >
      {/* 선택 표시 */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-primary" />
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <Badge className={cn('text-[10px] mb-1', getCategoryColor(template.category))}>
            {getCategoryLabel(template.category)}
          </Badge>
          <h4 className="text-sm font-medium">{template.name}</h4>
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 min-w-[28px] min-h-[28px] rounded hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center"
              title="수정"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1.5 min-w-[28px] min-h-[28px] rounded hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center"
              title="복제"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 min-w-[28px] min-h-[28px] rounded hover:bg-red-900/50 text-neutral-400 hover:text-red-400 flex items-center justify-center"
              title="삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {template.description && (
        <p className="text-[10px] text-neutral-400 mb-2">{template.description}</p>
      )}

      {/* 레이어 미리보기 */}
      <div className="bg-neutral-950 rounded p-3 space-y-1.5">
        {template.layers.map((layer) => (
          <div
            key={layer.id}
            className="text-center"
            style={{
              fontFamily: layer.preset.fontFamily,
              fontWeight: layer.preset.fontWeight,
              fontSize: `${Math.min(layer.preset.fontSize * 0.3, 18)}px`,
              color: layer.preset.color,
              backgroundColor: layer.preset.backgroundColor !== 'transparent' ? layer.preset.backgroundColor : undefined,
              padding: layer.preset.backgroundPadding > 0 ? `${layer.preset.backgroundPadding * 0.2}px ${layer.preset.backgroundPadding * 0.4}px` : undefined,
              borderRadius: layer.preset.backgroundPadding > 0 ? '3px' : undefined,
              textShadow: layer.preset.shadowEnabled
                ? `${layer.preset.shadowOffsetX * 0.5}px ${layer.preset.shadowOffsetY * 0.5}px ${layer.preset.shadowBlur * 0.5}px ${layer.preset.shadowColor}`
                : undefined,
              WebkitTextStroke: layer.preset.strokeWidth > 0
                ? `${layer.preset.strokeWidth * 0.2}px ${layer.preset.strokeColor}`
                : undefined,
            }}
          >
            {layer.text}
          </div>
        ))}
      </div>

      {/* 하단: 레이어 정보 + 적용 버튼 */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-[10px] text-neutral-500">
          <Layers className="h-3 w-3" />
          <span>{template.layers.length}개 레이어</span>
          {template.isCustom && (
            <>
              <span>•</span>
              <span>커스텀</span>
            </>
          )}
        </div>
        <Button
          size="sm"
          variant="default"
          className="h-6 text-[10px] px-2"
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
        >
          <Plus className="h-3 w-3 mr-0.5" />
          적용
        </Button>
      </div>
    </div>
  );
};

// 프리셋 카드 컴포넌트
interface PresetCardProps {
  preset: TextStylePreset;
  isSelected: boolean;
  onClick: () => void;
  onApply: () => void;
  onAddNew: () => void;
  hasSelectedText: boolean;
}

const PresetCard: React.FC<PresetCardProps> = ({ 
  preset, 
  isSelected, 
  onClick, 
  onApply, 
  onAddNew,
  hasSelectedText 
}) => {
  const previewStyle: React.CSSProperties = {
    fontFamily: preset.fontFamily,
    fontWeight: preset.fontWeight,
    fontSize: '18px',
    color: preset.color,
    textAlign: preset.align,
    WebkitTextStroke: preset.strokeWidth > 0 ? `${preset.strokeWidth * 0.5}px ${preset.strokeColor}` : undefined,
    textShadow:
      preset.shadowEnabled
        ? `${preset.shadowOffsetX}px ${preset.shadowOffsetY}px ${preset.shadowBlur}px ${preset.shadowColor}`
        : undefined,
    backgroundColor: preset.backgroundColor !== 'transparent' ? preset.backgroundColor : undefined,
    padding: preset.backgroundPadding > 0 ? `${preset.backgroundPadding * 0.3}px ${preset.backgroundPadding * 0.5}px` : undefined,
    borderRadius: preset.backgroundPadding > 0 ? '4px' : undefined,
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-3 rounded-lg border cursor-pointer transition-all',
        'hover:border-primary/50 hover:bg-neutral-800/50',
        isSelected ? 'border-primary bg-neutral-800' : 'border-neutral-700 bg-neutral-900'
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-primary" />
        </div>
      )}

      <Badge className={cn('text-[10px] mb-2', getCategoryColor(preset.category))}>
        {getCategoryLabel(preset.category)}
      </Badge>

      <h4 className="text-sm font-medium mb-1">{preset.name}</h4>

      {preset.description && (
        <p className="text-[10px] text-neutral-400 mb-2">{preset.description}</p>
      )}

      <div className="bg-neutral-950 rounded p-2 flex items-center justify-center min-h-[40px]">
        <span style={previewStyle}>가나다</span>
      </div>

      <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-500 flex-wrap">
        <span>{preset.fontSize}px</span>
        <span>•</span>
        <span>{preset.fontFamily}</span>
        {preset.strokeWidth > 0 && (
          <>
            <span>•</span>
            <span>외곽선</span>
          </>
        )}
        {preset.shadowEnabled && (
          <>
            <span>•</span>
            <span>그림자</span>
          </>
        )}
        {preset.backgroundColor !== 'transparent' && (
          <>
            <span>•</span>
            <span>배경</span>
          </>
        )}
      </div>

      {/* 액션 버튼들 */}
      <div className="flex gap-2 mt-2 pt-2 border-t border-neutral-700">
        <Button
          size="sm"
          variant="secondary"
          className="flex-1 h-6 text-[10px]"
          disabled={!hasSelectedText}
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
        >
          <Type className="h-3 w-3 mr-0.5" />
          적용
        </Button>
        <Button
          size="sm"
          variant="default"
          className="flex-1 h-6 text-[10px]"
          onClick={(e) => {
            e.stopPropagation();
            onAddNew();
          }}
        >
          <Plus className="h-3 w-3 mr-0.5" />
          추가
        </Button>
      </div>
    </div>
  );
};
