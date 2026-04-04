import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useTemplateEditContext } from './template-edit-state';
import { useDimensions } from '../utils/use-context';
import { cn } from '@/lib/utils';
import { TextLayerConfig } from '@/types/text-style-preset';

interface TemplateCanvasOverlayProps {
  canvasScale: number;
  canvasOffset: { x: number; y: number };
}

/**
 * 템플릿 편집 시 실제 캔버스 위에 오버레이되는 임시 레이어들
 * 드래그로 위치 조정 가능
 * 
 * 이 컴포넌트는 style div 안에 위치하여 transform: scale()이 자동 적용됨
 */
export const TemplateCanvasOverlay: React.FC<TemplateCanvasOverlayProps> = ({
  // canvasScale과 canvasOffset은 이제 부모의 transform에서 처리됨
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canvasScale: _canvasScale,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canvasOffset: _canvasOffset,
}) => {
  const { state, updateLayer } = useTemplateEditContext();
  const { compositionWidth, compositionHeight } = useDimensions();
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    layerId: string;
    startX: number;
    startY: number;
    startTop: number;
    startLeft: number;
  } | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  // 드래그 시작
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, layer: TextLayerConfig) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedLayerId(layer.id);
      setDragState({
        layerId: layer.id,
        startX: e.clientX,
        startY: e.clientY,
        startTop: layer.position.top,
        startLeft: layer.position.left,
      });
    },
    []
  );

  // 레이어 요소들의 ref를 저장
  const layerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 드래그 중 - 스케일 계산 없이 순수 compositionWidth/Height 기준
  useEffect(() => {
    if (!dragState) return;

    // 오버레이 요소의 실제 렌더링 크기 계산
    const overlayElement = overlayRef.current;
    if (!overlayElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      // 오버레이의 실제 렌더링 크기를 기준으로 계산
      const rect = overlayElement.getBoundingClientRect();
      const actualWidth = rect.width;
      const actualHeight = rect.height;

      // 실제 렌더링 크기 대비 이동량 (%)
      const deltaLeftPercent = (deltaX / actualWidth) * 100;
      const deltaTopPercent = (deltaY / actualHeight) * 100;

      const newLeft = Math.max(0, Math.min(100, dragState.startLeft + deltaLeftPercent));
      const newTop = Math.max(0, Math.min(100, dragState.startTop + deltaTopPercent));

      updateLayer(dragState.layerId, {
        position: {
          ...state.layers.find((l) => l.id === dragState.layerId)!.position,
          left: Math.round(newLeft),
          top: Math.round(newTop),
        },
      });
    };

    const handleMouseUp = () => {
      // 드래그 종료 시 현재 너비 저장
      const layer = state.layers.find(l => l.id === dragState.layerId);
      const layerElement = layerRefs.current[dragState.layerId];
      if (layer && layerElement) {
        const actualWidth = layerElement.offsetWidth;
        if (actualWidth > 0 && layer.position.widthPx !== actualWidth) {
          updateLayer(dragState.layerId, {
            position: { ...layer.position, widthPx: actualWidth },
          });
        }
      }
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, updateLayer, state.layers]);

  if (!state.active || state.layers.length === 0) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0"
      style={{
        zIndex: 20, // RemotionPlayer 위에 표시, 편집 모드에서 상호작용 가능
        pointerEvents: state.active ? 'auto' : 'none',
      }}
      onClick={() => setSelectedLayerId(null)} // 빈 영역 클릭 시 선택 해제
    >
      {state.layers.map((layer) => {
        const isSelected = selectedLayerId === layer.id;
        const isDragging = dragState?.layerId === layer.id;

        return (
          <div
            key={layer.id}
          ref={(el) => {
              layerRefs.current[layer.id] = el;
              // 요소가 마운트되면 실제 너비와 높이를 측정하여 저장
              if (el) {
                const actualWidth = el.offsetWidth;
                const actualHeight = el.offsetHeight;
                // 너비나 높이가 유효하고 변경되었을 때만 업데이트
                const needsWidthUpdate = actualWidth > 0 && layer.position.widthPx !== actualWidth;
                const needsHeightUpdate = actualHeight > 0 && layer.position.heightPx !== actualHeight;
                
                if (needsWidthUpdate || needsHeightUpdate) {
                  // 다음 렌더 사이클에서 업데이트 (무한 루프 방지)
                  requestAnimationFrame(() => {
                    updateLayer(layer.id, {
                      position: { 
                        ...layer.position, 
                        widthPx: actualWidth,
                        heightPx: actualHeight,
                      },
                    });
                  });
                }
              }
            }}
            onMouseDown={(e) => handleMouseDown(e, layer)}
            className={cn(
              'absolute cursor-move pointer-events-auto transition-shadow',
              isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-transparent',
              isDragging && 'opacity-90'
            )}
            style={{
              top: `${layer.position.top}%`,
              left: `${layer.position.left}%`,
              transform: 'translate(-50%, -50%)',
              maxWidth: `${layer.position.width}%`,
              fontFamily: layer.preset.fontFamily,
              fontWeight: layer.preset.fontWeight,
              fontSize: `${layer.preset.fontSize}px`,
              color: layer.preset.color,
              textAlign: layer.preset.align || 'center',
              // 배경 박스
              backgroundColor:
                layer.preset.backgroundColor !== 'transparent'
                  ? layer.preset.backgroundColor
                  : undefined,
              // 고정 너비/높이가 있으면 적용, 없으면 패딩으로 조절
              width: layer.preset.backgroundWidth ? `${layer.preset.backgroundWidth}px` : undefined,
              height: layer.preset.backgroundHeight ? `${layer.preset.backgroundHeight}px` : undefined,
              padding:
                layer.preset.backgroundPadding > 0
                  ? `${layer.preset.backgroundPadding}px ${layer.preset.backgroundPadding * 1.5}px`
                  : undefined,
              borderRadius: layer.preset.backgroundPadding > 0 || layer.preset.backgroundWidth ? '4px' : undefined,
              // 수직 정렬 (고정 높이가 있을 때만 적용)
              display: layer.preset.backgroundHeight ? 'flex' : undefined,
              alignItems: layer.preset.backgroundHeight 
                ? (layer.preset.verticalAlign === 'top' ? 'flex-start' 
                   : layer.preset.verticalAlign === 'bottom' ? 'flex-end' 
                   : 'center')
                : undefined,
              justifyContent: layer.preset.backgroundHeight 
                ? (layer.preset.align === 'left' ? 'flex-start'
                   : layer.preset.align === 'right' ? 'flex-end'
                   : 'center')
                : undefined,
              // 그림자
              textShadow: layer.preset.shadowEnabled
                ? `${layer.preset.shadowOffsetX}px ${layer.preset.shadowOffsetY}px ${layer.preset.shadowBlur}px ${layer.preset.shadowColor}`
                : undefined,
              WebkitTextStroke:
                layer.preset.strokeWidth > 0
                  ? `${layer.preset.strokeWidth}px ${layer.preset.strokeColor}`
                  : undefined,
              whiteSpace: layer.preset.backgroundWidth ? 'normal' : 'nowrap',
              overflow: 'hidden',
            }}
          >
            {layer.text}
            {/* 드래그 힌트 */}
            {isSelected && !isDragging && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                드래그하여 이동
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
