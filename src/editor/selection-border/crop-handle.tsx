import React, {useCallback, useRef} from 'react';
import {updateAllCropValues} from '../state/actions/item-cropping';
import {useCanvasTransformationScale} from '../utils/canvas-transformation-context';
import {useCurrentStateAsRef, useWriteContext} from '../utils/use-context';
import {getCanCrop, CroppableItem} from '../utils/get-crop-from-item';
import {isLeftClick} from '../utils/is-left-click';

export type CropHandleType =
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right'
	| 'top'
	| 'right'
	| 'bottom'
	| 'left';

const HANDLE_SIZE = 10;

interface CropHandleProps {
	itemId: string;
	type: CropHandleType;
	itemWidth: number;
	itemHeight: number;
}

export const CropHandle: React.FC<CropHandleProps> = ({
	itemId,
	type,
	itemWidth,
	itemHeight,
}) => {
	const scale = useCanvasTransformationScale();
	const {setState} = useWriteContext();
	const stateRef = useCurrentStateAsRef();
	const isDragging = useRef(false);

	const scaledHandleSize = HANDLE_SIZE / scale;
	const halfHandle = scaledHandleSize / 2;

	// 핸들 위치 계산 (크롭된 영역 기준)
	const getHandlePosition = (): React.CSSProperties => {
		const baseStyle: React.CSSProperties = {
			position: 'absolute',
			width: scaledHandleSize,
			height: scaledHandleSize,
			backgroundColor: 'white',
			border: `${1 / scale}px solid var(--color-editor-starter-accent)`,
			borderRadius: 2 / scale,
			cursor: getCursor(),
			zIndex: 20,
		};

		switch (type) {
			case 'top-left':
				return {...baseStyle, left: -halfHandle, top: -halfHandle};
			case 'top-right':
				return {...baseStyle, right: -halfHandle, top: -halfHandle};
			case 'bottom-left':
				return {...baseStyle, left: -halfHandle, bottom: -halfHandle};
			case 'bottom-right':
				return {...baseStyle, right: -halfHandle, bottom: -halfHandle};
			case 'top':
				return {...baseStyle, left: '50%', top: -halfHandle, transform: 'translateX(-50%)'};
			case 'bottom':
				return {...baseStyle, left: '50%', bottom: -halfHandle, transform: 'translateX(-50%)'};
			case 'left':
				return {...baseStyle, left: -halfHandle, top: '50%', transform: 'translateY(-50%)'};
			case 'right':
				return {...baseStyle, right: -halfHandle, top: '50%', transform: 'translateY(-50%)'};
			default:
				return baseStyle;
		}
	};

	const getCursor = (): string => {
		switch (type) {
			case 'top-left':
			case 'bottom-right':
				return 'nwse-resize';
			case 'top-right':
			case 'bottom-left':
				return 'nesw-resize';
			case 'top':
			case 'bottom':
				return 'ns-resize';
			case 'left':
			case 'right':
				return 'ew-resize';
			default:
				return 'move';
		}
	};

	const onPointerDown = useCallback(
		(e: React.PointerEvent) => {
			// 좌클릭만 처리
			if (!isLeftClick(e as unknown as React.MouseEvent)) {
				return;
			}

			e.stopPropagation();
			e.preventDefault();

			const item = stateRef.current.undoableState.items[itemId];
			if (!item || !getCanCrop(item)) return;

			const croppableItem = item as CroppableItem;
			const initialX = e.clientX;
			const initialY = e.clientY;
			const initialCropLeft = croppableItem.cropLeft ?? 0;
			const initialCropTop = croppableItem.cropTop ?? 0;
			const initialCropRight = croppableItem.cropRight ?? 0;
			const initialCropBottom = croppableItem.cropBottom ?? 0;

			// 최소 1px 보장을 위한 clamp 값 계산
			const minVisibleX = 1 / itemWidth;
			const minVisibleY = 1 / itemHeight;

			isDragging.current = true;

			const onPointerMove = (moveEvent: PointerEvent) => {
				if (!isDragging.current) return;

				const deltaX = (moveEvent.clientX - initialX) / scale;
				const deltaY = (moveEvent.clientY - initialY) / scale;

				// 픽셀 이동량을 비율로 변환
				const deltaRatioX = deltaX / itemWidth;
				const deltaRatioY = deltaY / itemHeight;

				let newCropLeft = initialCropLeft;
				let newCropTop = initialCropTop;
				let newCropRight = initialCropRight;
				let newCropBottom = initialCropBottom;

				// 핸들 타입에 따라 크롭 값 업데이트 (최소 1px 보장)
				if (type.includes('left')) {
					newCropLeft = Math.max(0, Math.min(1 - newCropRight - minVisibleX, initialCropLeft + deltaRatioX));
				}
				if (type.includes('right')) {
					newCropRight = Math.max(0, Math.min(1 - newCropLeft - minVisibleX, initialCropRight - deltaRatioX));
				}
				if (type.includes('top') || type === 'top') {
					newCropTop = Math.max(0, Math.min(1 - newCropBottom - minVisibleY, initialCropTop + deltaRatioY));
				}
				if (type.includes('bottom') || type === 'bottom') {
					newCropBottom = Math.max(0, Math.min(1 - newCropTop - minVisibleY, initialCropBottom - deltaRatioY));
				}

				setState({
					update: (state) =>
						updateAllCropValues({
							state,
							itemId,
							cropLeft: newCropLeft,
							cropTop: newCropTop,
							cropRight: newCropRight,
							cropBottom: newCropBottom,
						}),
					commitToUndoStack: false,
				});
			};

			const onPointerUp = () => {
				isDragging.current = false;
				setState({
					update: (s) => s,
					commitToUndoStack: true,
				});
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
		},
		[itemId, itemWidth, itemHeight, scale, setState, stateRef, type],
	);

	return <div style={getHandlePosition()} onPointerDown={onPointerDown} />;
};
