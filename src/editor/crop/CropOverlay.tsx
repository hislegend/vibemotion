import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {EditModeContext} from '../edit-mode';
import {CropArea, ImageItem} from '../items/image/image-item-type';
import {changeItem} from '../state/actions/change-item';
import {useAllItems, useAssetFromItem, useSelectedItems, useWriteContext} from '../utils/use-context';
import {Button} from '@/components/ui/button';
import {Check, X, RotateCcw, Move, Crop} from 'lucide-react';

interface CropOverlayProps {
	item: ImageItem;
}

// 드래그 모드: 프레이밍(이미지 이동) vs 포커싱(박스/핸들 조작)
type InteractionMode = 'framing' | 'focusing';
type DragTarget = 'image' | 'box' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | null;

/**
 * cropArea를 항상 유효한 범위로 정규화
 */
const normalizeCropArea = (area: CropArea | undefined): CropArea => {
	const minSize = 0.05;
	
	if (!area || 
		!Number.isFinite(area.x) || !Number.isFinite(area.y) ||
		!Number.isFinite(area.width) || !Number.isFinite(area.height)) {
		return {x: 0, y: 0, width: 1, height: 1};
	}
	
	let {x, y, width, height} = area;
	width = Math.max(minSize, Math.min(1, width));
	height = Math.max(minSize, Math.min(1, height));
	x = Math.max(0, Math.min(1 - width, x));
	y = Math.max(0, Math.min(1 - height, y));
	
	return {x, y, width, height};
};

/**
 * 듀얼 모드 크롭 오버레이
 * 
 * 1. 프레이밍 모드 (이미지 드래그): 
 *    - 현재 프레임 비율 유지
 *    - cropArea.x, y만 변경 (width, height 고정)
 *    - "창문 고정, 그림 이동" 개념
 * 
 * 2. 포커싱 모드 (박스/핸들 드래그):
 *    - 박스 선택 영역 = 결과
 *    - cropArea 전체 변경 (x, y, width, height)
 *    - item.width/height도 박스 비율에 맞게 변경
 */
export const CropOverlay: React.FC<CropOverlayProps> = ({item}) => {
	const {setEditMode} = useContext(EditModeContext);
	const {setState} = useWriteContext();
	const overlayRef = useRef<HTMLDivElement>(null);
	
	const asset = useAssetFromItem(item);
	const imgWidth = (asset && 'width' in asset) ? asset.width : item.width;
	const imgHeight = (asset && 'height' in asset) ? asset.height : item.height;
	
	// 초기 상태 저장
	const getInitialCropArea = (): CropArea => normalizeCropArea(item.cropArea);
	const initialCropAreaRef = useRef<CropArea>(getInitialCropArea());
	const initialItemSizeRef = useRef({width: item.width, height: item.height});
	
	const [cropArea, setCropAreaState] = useState<CropArea>(getInitialCropArea());
	const cropAreaRef = useRef<CropArea>(cropArea);
	
	// 현재 상호작용 모드
	const [interactionMode, setInteractionMode] = useState<InteractionMode | null>(null);
	
	// 실시간 프리뷰 업데이트
	const updatePreview = useCallback((newArea: CropArea, newWidth?: number, newHeight?: number) => {
		setCropAreaState(newArea);
		cropAreaRef.current = newArea;
		
		const isFullImage = newArea.x === 0 && newArea.y === 0 && 
			newArea.width === 1 && newArea.height === 1;
		
		setState({
			update: (state) =>
				changeItem(state, item.id, (i) => ({
					...(i as ImageItem),
					cropArea: isFullImage ? undefined : newArea,
					// 포커싱 모드: 프레임 크기도 함께 변경
					...(newWidth !== undefined && newHeight !== undefined ? {
						width: newWidth,
						height: newHeight,
					} : {}),
				})),
			commitToUndoStack: false,
		});
	}, [item.id, setState]);
	
	// 드래그 상태
	const [dragTarget, setDragTarget] = useState<DragTarget>(null);
	const dragStartRef = useRef({x: 0, y: 0});
	const cropAreaStartRef = useRef<CropArea>(cropArea);
	const itemSizeStartRef = useRef({width: item.width, height: item.height});
	const pointerIdRef = useRef<number | null>(null);

	// 적용 및 종료
	const applyAndExit = useCallback(() => {
		const currentCropArea = normalizeCropArea(cropAreaRef.current);
		const isFullImage = currentCropArea.x === 0 && currentCropArea.y === 0 && 
			currentCropArea.width === 1 && currentCropArea.height === 1;
		
		setState({
			update: (state) =>
				changeItem(state, item.id, (i) => ({
					...(i as ImageItem),
					cropArea: isFullImage ? undefined : currentCropArea,
					cropZoom: undefined,
					cropOffsetX: undefined,
					cropOffsetY: undefined,
				})),
			commitToUndoStack: true,
		});
		
		setTimeout(() => setEditMode('select'), 0);
	}, [item.id, setState, setEditMode]);

	// 취소 - 원래 상태로 복원
	const cancelAndExit = useCallback(() => {
		const original = initialCropAreaRef.current;
		const originalSize = initialItemSizeRef.current;
		const isFullImage = original.x === 0 && original.y === 0 && 
			original.width === 1 && original.height === 1;
		
		setState({
			update: (state) =>
				changeItem(state, item.id, (i) => ({
					...(i as ImageItem),
					cropArea: isFullImage ? undefined : original,
					width: originalSize.width,
					height: originalSize.height,
				})),
			commitToUndoStack: false,
		});
		
		setEditMode('select');
	}, [item.id, setState, setEditMode]);

	// 초기화
	const resetCrop = useCallback(() => {
		const originalSize = initialItemSizeRef.current;
		updatePreview({x: 0, y: 0, width: 1, height: 1}, originalSize.width, originalSize.height);
	}, [updatePreview]);

	// 프레이밍 모드: 이미지 드래그 시작
	const handleImagePointerDown = useCallback((e: React.PointerEvent) => {
		e.preventDefault();
		e.stopPropagation();
		
		setInteractionMode('framing');
		setDragTarget('image');
		dragStartRef.current = {x: e.clientX, y: e.clientY};
		cropAreaStartRef.current = {...cropArea};
		pointerIdRef.current = e.pointerId;
		
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}, [cropArea]);

	// 포커싱 모드: 박스/핸들 드래그 시작
	const handleBoxPointerDown = useCallback((e: React.PointerEvent, target: DragTarget) => {
		e.preventDefault();
		e.stopPropagation();
		
		setInteractionMode('focusing');
		setDragTarget(target);
		dragStartRef.current = {x: e.clientX, y: e.clientY};
		cropAreaStartRef.current = {...cropArea};
		itemSizeStartRef.current = {width: item.width, height: item.height};
		pointerIdRef.current = e.pointerId;
		
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}, [cropArea, item.width, item.height]);

	// 포인터 이동 처리
	const handlePointerMove = useCallback((e: React.PointerEvent) => {
		if (!dragTarget || pointerIdRef.current !== e.pointerId) return;
		
		e.preventDefault();
		e.stopPropagation();
		
		const overlayRect = overlayRef.current?.getBoundingClientRect();
		if (!overlayRect || overlayRect.width === 0 || overlayRect.height === 0) return;
		
		const clientDeltaX = e.clientX - dragStartRef.current.x;
		const clientDeltaY = e.clientY - dragStartRef.current.y;
		const deltaX = clientDeltaX / overlayRect.width;
		const deltaY = clientDeltaY / overlayRect.height;
		
		const startArea = cropAreaStartRef.current;
		const minSize = 0.1;
		
		if (interactionMode === 'framing' && dragTarget === 'image') {
			// 프레이밍: cropArea.x, y만 변경 (width, height 고정)
			// 이미지를 오른쪽으로 드래그 → 왼쪽 부분이 보임 → x 감소
			const newX = Math.max(0, Math.min(1 - startArea.width, startArea.x - deltaX));
			const newY = Math.max(0, Math.min(1 - startArea.height, startArea.y - deltaY));
			
			updatePreview({
				x: newX,
				y: newY,
				width: startArea.width,
				height: startArea.height,
			});
		} else if (interactionMode === 'focusing') {
			// 포커싱: 박스 이동 또는 리사이즈
			let newArea = {...startArea};
			
			if (dragTarget === 'box') {
				// 박스 이동
				newArea.x = Math.max(0, Math.min(1 - startArea.width, startArea.x + deltaX));
				newArea.y = Math.max(0, Math.min(1 - startArea.height, startArea.y + deltaY));
			} else if (dragTarget === 'resize-nw') {
				const newX = Math.max(0, Math.min(startArea.x + startArea.width - minSize, startArea.x + deltaX));
				const newY = Math.max(0, Math.min(startArea.y + startArea.height - minSize, startArea.y + deltaY));
				newArea = {
					x: newX,
					y: newY,
					width: startArea.width - (newX - startArea.x),
					height: startArea.height - (newY - startArea.y),
				};
			} else if (dragTarget === 'resize-ne') {
				const newY = Math.max(0, Math.min(startArea.y + startArea.height - minSize, startArea.y + deltaY));
				newArea = {
					x: startArea.x,
					y: newY,
					width: Math.max(minSize, Math.min(1 - startArea.x, startArea.width + deltaX)),
					height: startArea.height - (newY - startArea.y),
				};
			} else if (dragTarget === 'resize-sw') {
				const newX = Math.max(0, Math.min(startArea.x + startArea.width - minSize, startArea.x + deltaX));
				newArea = {
					x: newX,
					y: startArea.y,
					width: startArea.width - (newX - startArea.x),
					height: Math.max(minSize, Math.min(1 - startArea.y, startArea.height + deltaY)),
				};
			} else if (dragTarget === 'resize-se') {
				newArea = {
					x: startArea.x,
					y: startArea.y,
					width: Math.max(minSize, Math.min(1 - startArea.x, startArea.width + deltaX)),
					height: Math.max(minSize, Math.min(1 - startArea.y, startArea.height + deltaY)),
				};
			}
			
			const normalized = normalizeCropArea(newArea);
			
			// 포커싱 모드: 프레임 비율도 박스에 맞게 변경
			// 현재 면적 유지하면서 비율만 변경
			const startSize = itemSizeStartRef.current;
			const currentArea = startSize.width * startSize.height;
			
			// 박스의 실제 비율 (원본 이미지 픽셀 기준)
			const boxPixelWidth = imgWidth * normalized.width;
			const boxPixelHeight = imgHeight * normalized.height;
			const boxAspectRatio = boxPixelWidth / boxPixelHeight;
			
			// 면적 유지하면서 새 비율 적용
			const newHeight = Math.sqrt(currentArea / boxAspectRatio);
			const newWidth = newHeight * boxAspectRatio;
			
			updatePreview(normalized, newWidth, newHeight);
		}
	}, [dragTarget, interactionMode, updatePreview, imgWidth, imgHeight]);

	// 포인터 업
	const handlePointerUp = useCallback((e: React.PointerEvent) => {
		if (pointerIdRef.current === e.pointerId) {
			setDragTarget(null);
			setInteractionMode(null);
			pointerIdRef.current = null;
			(e.target as HTMLElement).releasePointerCapture(e.pointerId);
		}
	}, []);

	// 키보드 이벤트
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === 'Escape') {
				e.preventDefault();
				e.stopPropagation();
				cancelAndExit();
			} else if (e.code === 'Enter' || e.code === 'KeyC') {
				e.preventDefault();
				e.stopPropagation();
				applyAndExit();
			}
		};
		window.addEventListener('keydown', handleKeyDown, true);
		return () => window.removeEventListener('keydown', handleKeyDown, true);
	}, [applyAndExit, cancelAndExit]);

	// Wheel 이벤트 차단
	useEffect(() => {
		const overlay = overlayRef.current;
		if (!overlay) return;
		
		const blockWheel = (e: WheelEvent) => {
			e.preventDefault();
			e.stopPropagation();
		};
		overlay.addEventListener('wheel', blockWheel, {passive: false});
		return () => overlay.removeEventListener('wheel', blockWheel);
	}, []);

	// 바깥 클릭 시 적용
	const handleOverlayPointerDownCapture = useCallback((e: React.PointerEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest('button')) return;
		if (target.closest('[data-crop-ui]')) return;
		
		e.preventDefault();
		e.stopPropagation();
		applyAndExit();
	}, [applyAndExit]);

	const hasCrop = cropArea.x !== 0 || cropArea.y !== 0 || 
		cropArea.width !== 1 || cropArea.height !== 1;

	// 크롭 박스 위치 (아이템 내부 기준)
	const boxLeft = cropArea.x * item.width;
	const boxTop = cropArea.y * item.height;
	const boxWidth = cropArea.width * item.width;
	const boxHeight = cropArea.height * item.height;

	// 이미지 드래그 영역 (크롭 박스 내부, 핸들 제외)
	const imageDragCursor = interactionMode === 'framing' && dragTarget === 'image' 
		? 'grabbing' 
		: 'move';

	return (
		<div
			ref={overlayRef}
			style={{
				position: 'absolute',
				left: item.left,
				top: item.top,
				width: item.width,
				height: item.height,
				zIndex: 100,
				touchAction: 'none',
			}}
			onPointerDownCapture={handleOverlayPointerDownCapture}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
		>
			{/* 어두운 마스크 - 4개 영역 */}
			{[
				{left: 0, top: 0, width: '100%', height: boxTop}, // Top
				{left: 0, top: boxTop + boxHeight, width: '100%', height: item.height - boxTop - boxHeight}, // Bottom
				{left: 0, top: boxTop, width: boxLeft, height: boxHeight}, // Left
				{left: boxLeft + boxWidth, top: boxTop, width: item.width - boxLeft - boxWidth, height: boxHeight}, // Right
			].map((mask, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						...mask,
						backgroundColor: 'rgba(0,0,0,0.6)',
						cursor: 'pointer',
					}}
					onPointerDown={(e) => {
						e.preventDefault();
						e.stopPropagation();
						applyAndExit();
					}}
				/>
			))}

			{/* 이미지 드래그 영역 (프레이밍) - 크롭 박스 내부 배경 */}
			<div
				data-crop-ui
				style={{
					position: 'absolute',
					left: boxLeft + 2,
					top: boxTop + 2,
					width: boxWidth - 4,
					height: boxHeight - 4,
					cursor: imageDragCursor,
					zIndex: 1,
				}}
				onPointerDown={handleImagePointerDown}
			/>

			{/* 크롭 박스 테두리 (포커싱 - 박스 이동) */}
			<div
				data-crop-ui
				style={{
					position: 'absolute',
					left: boxLeft,
					top: boxTop,
					width: boxWidth,
					height: boxHeight,
					border: '2px solid hsl(var(--primary))',
					boxSizing: 'border-box',
					pointerEvents: 'none',
					zIndex: 2,
				}}
			/>
			
			{/* 박스 테두리 드래그 영역 (포커싱 - 박스 이동) */}
			{/* Top edge */}
			<div
				data-crop-ui
				style={{
					position: 'absolute',
					left: boxLeft + 12,
					top: boxTop - 4,
					width: boxWidth - 24,
					height: 8,
					cursor: 'grab',
					zIndex: 3,
				}}
				onPointerDown={(e) => handleBoxPointerDown(e, 'box')}
			/>
			{/* Bottom edge */}
			<div
				data-crop-ui
				style={{
					position: 'absolute',
					left: boxLeft + 12,
					top: boxTop + boxHeight - 4,
					width: boxWidth - 24,
					height: 8,
					cursor: 'grab',
					zIndex: 3,
				}}
				onPointerDown={(e) => handleBoxPointerDown(e, 'box')}
			/>
			{/* Left edge */}
			<div
				data-crop-ui
				style={{
					position: 'absolute',
					left: boxLeft - 4,
					top: boxTop + 12,
					width: 8,
					height: boxHeight - 24,
					cursor: 'grab',
					zIndex: 3,
				}}
				onPointerDown={(e) => handleBoxPointerDown(e, 'box')}
			/>
			{/* Right edge */}
			<div
				data-crop-ui
				style={{
					position: 'absolute',
					left: boxLeft + boxWidth - 4,
					top: boxTop + 12,
					width: 8,
					height: boxHeight - 24,
					cursor: 'grab',
					zIndex: 3,
				}}
				onPointerDown={(e) => handleBoxPointerDown(e, 'box')}
			/>

			{/* 코너 핸들 (포커싱 - 리사이즈) */}
			{(['nw', 'ne', 'sw', 'se'] as const).map((corner) => {
				const isLeft = corner.includes('w');
				const isTop = corner.includes('n');
				const handleSize = 14;
				
				return (
					<div
						key={corner}
						data-crop-ui
						style={{
							position: 'absolute',
							left: isLeft ? boxLeft - handleSize / 2 : boxLeft + boxWidth - handleSize / 2,
							top: isTop ? boxTop - handleSize / 2 : boxTop + boxHeight - handleSize / 2,
							width: handleSize,
							height: handleSize,
							backgroundColor: 'white',
							border: '2px solid hsl(var(--primary))',
							borderRadius: 2,
							cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize',
							zIndex: 4,
						}}
						onPointerDown={(e) => handleBoxPointerDown(e, `resize-${corner}` as DragTarget)}
					/>
				);
			})}

			{/* 상단 컨트롤 바 */}
			<div
				style={{
					position: 'absolute',
					top: boxTop + 8,
					left: boxLeft + 8,
					right: item.width - boxLeft - boxWidth + 8,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					pointerEvents: 'auto',
					zIndex: 10,
				}}
			>
				{/* 크롭 영역 크기 + 모드 표시 */}
				<div
					style={{
						backgroundColor: 'hsl(var(--background) / 0.95)',
						color: 'hsl(var(--foreground))',
						padding: '4px 10px',
						borderRadius: 6,
						fontSize: 12,
						fontWeight: 600,
						display: 'flex',
						alignItems: 'center',
						gap: 6,
					}}
				>
					{interactionMode === 'framing' && <Move className="w-3 h-3 text-primary" />}
					{interactionMode === 'focusing' && <Crop className="w-3 h-3 text-primary" />}
					{Math.round(imgWidth * cropArea.width)} × {Math.round(imgHeight * cropArea.height)}
				</div>

				{/* 버튼들 */}
				<div style={{display: 'flex', gap: 4}}>
					{hasCrop && (
						<Button
							size="sm"
							variant="outline"
							onPointerDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
								resetCrop();
							}}
							className="h-7 px-2 bg-background/95"
						>
							<RotateCcw className="w-3.5 h-3.5" />
						</Button>
					)}
					<Button
						size="sm"
						variant="outline"
						onPointerDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							cancelAndExit();
						}}
						className="h-7 px-2 bg-background/95"
					>
						<X className="w-3.5 h-3.5" />
					</Button>
					<Button
						size="sm"
						variant="default"
						onPointerDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							applyAndExit();
						}}
						className="h-7 px-2"
					>
						<Check className="w-3.5 h-3.5" />
					</Button>
				</div>
			</div>

			{/* 하단 도움말 */}
			<div
				style={{
					position: 'absolute',
					bottom: -28,
					left: '50%',
					transform: 'translateX(-50%)',
					backgroundColor: 'hsl(var(--background) / 0.95)',
					color: 'hsl(var(--muted-foreground))',
					padding: '4px 12px',
					borderRadius: 6,
					fontSize: 11,
					whiteSpace: 'nowrap',
					pointerEvents: 'none',
				}}
			>
				이미지 드래그: 위치 조절 · 박스/모서리: 영역 선택 · Enter: 적용 · ESC: 취소
			</div>
		</div>
	);
};

// 선택된 이미지에 대한 크롭 오버레이 래퍼
export const CropOverlayWrapper: React.FC = () => {
	const {selectedItems} = useSelectedItems();
	const {items} = useAllItems();
	
	const selectedItemId = selectedItems.length > 0 ? selectedItems[0] : null;
	const selectedItem = selectedItemId ? items[selectedItemId] : null;
	
	if (!selectedItem || selectedItem.type !== 'image') {
		return null;
	}

	return <CropOverlay item={selectedItem as ImageItem} />;
};
