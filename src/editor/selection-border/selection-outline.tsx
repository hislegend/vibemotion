import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {retryAssetUpload} from '../assets/retry-upload';
import {
	CenterSnapContext,
	ItemSelectedForCropContext,
	TextItemEditingContext,
	TextItemHoverPreviewContext,
} from '../context-provider';
import {FEATURE_CROPPING, FEATURE_SHIFT_AXIS_LOCK} from '../flags';
import {EditorStarterItem} from '../items/item-type';
import {overrideItemWithHoverPreview} from '../items/override-item-with-hover-preview';
import {changeItem} from '../state/actions/change-item';
import {unselectItemForCrop} from '../state/actions/item-cropping';
import {setSelectedItems} from '../state/actions/set-selected-items';
import {markTextAsEditing} from '../state/actions/text-item-editing';
import {ItemContextMenuTrigger} from '../timeline/timeline-item/timeline-item-context-menu-trigger';
import {
	canAssetRetryUpload,
	isAssetError,
	isAssetUploading,
} from '../utils/asset-status-helpers';
import {useCanvasTransformationScale} from '../utils/canvas-transformation-context';
import {calculateCenterSnap} from '../utils/center-snap';
import {CroppableItem, getCanCrop} from '../utils/get-crop-from-item';
import {getRectAfterCrop} from '../utils/get-dimensions-after-crop';
import {isLeftClick} from '../utils/is-left-click';
import {
	useAssetIfApplicable,
	useAssetStatus,
	useCurrentStateAsRef,
	useDimensions,
	useSelectedItems,
	useWriteContext,
} from '../utils/use-context';
import {CropButton} from './crop-button';
import {CropHandle} from './crop-handle';
import {ResizeHandle} from './resize-handle';
import {SelectionDimensions} from './selection-dimensions';
import {SelectionError} from './selection-upload-error';
import {SelectionUploadProgress} from './selection-upload-progress';

const AXIS_LOCK_THRESHOLD = 10; // 축을 결정하기 위한 최소 이동 거리

const SelectionOutlineUnmemoized: React.FC<{
	item: EditorStarterItem;
}> = ({item: itemWithoutHoverPreview}) => {
	const scale = useCanvasTransformationScale();
	const scaledBorder = Math.ceil(2 / scale);
	const textItemHoverPreview = useContext(TextItemHoverPreviewContext);
	const item = useMemo(
		() =>
			overrideItemWithHoverPreview({
				item: itemWithoutHoverPreview,
				hoverPreview: textItemHoverPreview,
			}),
		[itemWithoutHoverPreview, textItemHoverPreview],
	);

	const {selectedItems} = useSelectedItems();
	const {setState} = useWriteContext();
	const {assetStatus} = useAssetStatus();
	const stateAsRef = useCurrentStateAsRef();
	const textItemEditing = useContext(TextItemEditingContext);
	const {compositionWidth, compositionHeight} = useDimensions();
	const centerSnap = useContext(CenterSnapContext);
	const itemSelectedForCrop = useContext(ItemSelectedForCropContext);
	const isInCropMode = itemSelectedForCrop === item.id;

	const [hovered, setHovered] = React.useState(false);

	const onMouseEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onMouseLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const selected = selectedItems.includes(item.id);

	const style: React.CSSProperties = useMemo(() => {
		const hasRotation = 'rotation' in item;
		// 선택 프레임은 항상 크롭된 결과 영역을 기준으로 함
		const rect = getRectAfterCrop(item);
		return {
			width: rect.width,
			height: rect.height,
			left: rect.left,
			top: rect.top,
			position: 'absolute',
			outline:
				(hovered && !textItemEditing) || selected
					? `${scaledBorder}px solid ${isInCropMode ? 'hsl(var(--muted-foreground))' : 'var(--color-editor-starter-accent)'}`
					: undefined,
			userSelect: 'none',
			touchAction: 'none',
			transform: hasRotation ? `rotate(${item.rotation}deg)` : undefined,
			pointerEvents:
				item.type === 'text' && item.id === textItemEditing ? 'none' : 'auto',
			cursor: isInCropMode ? 'move' : undefined,
		};
	}, [hovered, item, scaledBorder, selected, textItemEditing, isInCropMode]);

	// ESC 키로 크롭 모드 종료
	useEffect(() => {
		if (!isInCropMode) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				e.stopPropagation();
				setState({
					update: (state) => unselectItemForCrop(state),
					commitToUndoStack: true,
				});
			}
		};

		window.addEventListener('keydown', handleKeyDown, {capture: true});
		return () => {
			window.removeEventListener('keydown', handleKeyDown, {capture: true});
		};
	}, [isInCropMode, setState]);

	const startDragging = useCallback(
		(e: PointerEvent | React.MouseEvent, selectedItemIds: string[]) => {
			const initialX = e.clientX;
			const initialY = e.clientY;

			let offsetX = 0;
			let offsetY = 0;

			const items = stateAsRef.current.undoableState.items;

			const originalLeft = selectedItemIds.map((id) => items[id].left);
			const originalTop = selectedItemIds.map((id) => items[id].top);

			// 크롭 모드용 초기 값 저장
			const originalCrops = selectedItemIds.map((id) => {
				const it = items[id];
				if (getCanCrop(it)) {
					const croppable = it as CroppableItem;
					return {
						cropLeft: croppable.cropLeft ?? 0,
						cropTop: croppable.cropTop ?? 0,
						cropRight: croppable.cropRight ?? 0,
						cropBottom: croppable.cropBottom ?? 0,
					};
				}
				return null;
			});

			let didMove = false;
			const multiSelect = e.metaKey || e.shiftKey;
			let shiftPressed = e.shiftKey;

			const reposition = () => {
				let axisLocked: 'horizontal' | 'vertical' | null = null;

				if (FEATURE_SHIFT_AXIS_LOCK && shiftPressed) {
					const totalMovementX = Math.abs(offsetX);
					const totalMovementY = Math.abs(offsetY);

					if (
						totalMovementX > AXIS_LOCK_THRESHOLD ||
						totalMovementY > AXIS_LOCK_THRESHOLD
					) {
						axisLocked =
							totalMovementX > totalMovementY ? 'horizontal' : 'vertical';
					}
				}

				for (let idx = 0; idx < selectedItemIds.length; idx++) {
					const itemId = selectedItemIds[idx];
					const currentItem = items[itemId];

					const effectiveOffsetX = axisLocked === 'vertical' ? 0 : offsetX;
					const effectiveOffsetY = axisLocked === 'horizontal' ? 0 : offsetY;

					// 크롭 모드: 이미지가 창 안에서 움직이는 효과
					// - left/top을 이동하되, crop 값을 반대로 조정해서 visibleBox는 고정
					if (isInCropMode && originalCrops[idx]) {
						const crop = originalCrops[idx]!;
						const ratioX = effectiveOffsetX / currentItem.width;
						const ratioY = effectiveOffsetY / currentItem.height;

						// 크롭 값 조정 (이동의 반대 방향)
						const newCropLeft = Math.max(0, Math.min(1 - crop.cropRight - 1 / currentItem.width, crop.cropLeft - ratioX));
						const newCropTop = Math.max(0, Math.min(1 - crop.cropBottom - 1 / currentItem.height, crop.cropTop - ratioY));
						const newCropRight = Math.max(0, Math.min(1 - newCropLeft - 1 / currentItem.width, crop.cropRight + ratioX));
						const newCropBottom = Math.max(0, Math.min(1 - newCropTop - 1 / currentItem.height, crop.cropBottom + ratioY));

						// 새 left/top 계산
						const newLeft = Math.round(originalLeft[idx] + effectiveOffsetX);
						const newTop = Math.round(originalTop[idx] + effectiveOffsetY);

						setState({
							update: (state) => {
								return changeItem(state, itemId, (i) => {
									return {
										...i,
										left: newLeft,
										top: newTop,
										cropLeft: newCropLeft,
										cropTop: newCropTop,
										cropRight: newCropRight,
										cropBottom: newCropBottom,
									} as EditorStarterItem;
								});
							},
							commitToUndoStack: false,
						});
					} else {
						// 일반 모드: 기존 로직
						let newLeft = Math.round(originalLeft[idx] + effectiveOffsetX);
						let newTop = Math.round(originalTop[idx] + effectiveOffsetY);

						// 단일 선택 시에만 중앙 스냅 적용
						if (selectedItemIds.length === 1 && centerSnap) {
							const snapResult = calculateCenterSnap({
								itemLeft: newLeft,
								itemTop: newTop,
								itemWidth: currentItem.width,
								itemHeight: currentItem.height,
								compositionWidth,
								compositionHeight,
							});

							newLeft = snapResult.snappedLeft;
							newTop = snapResult.snappedTop;

							// 가이드라인 표시 상태 업데이트
							centerSnap.setShowHorizontalGuide(snapResult.isHorizontallyCentered);
							centerSnap.setShowVerticalGuide(snapResult.isVerticallyCentered);
						}

						setState({
							update: (state) => {
								return changeItem(state, itemId, (i) => {
									const updatedItem: EditorStarterItem = {
										...(i as EditorStarterItem),
										left: newLeft,
										top: newTop,
									};
									return updatedItem as EditorStarterItem;
								});
							},
							commitToUndoStack: false,
						});
					}
				}
			};

			const onPointerMove = (pointerMoveEvent: PointerEvent) => {
				offsetX = (pointerMoveEvent.clientX - initialX) / scale;
				offsetY = (pointerMoveEvent.clientY - initialY) / scale;

				shiftPressed = pointerMoveEvent.shiftKey;
				didMove = true;
				reposition();
			};

			const onPointerUp = () => {
				// 드래그 종료 시 가이드라인 숨기기
				if (centerSnap) {
					centerSnap.setShowHorizontalGuide(false);
					centerSnap.setShowVerticalGuide(false);
				}

				setState({
					update: (state) => {
						return setSelectedItems(
							state,
							!didMove && !multiSelect ? [item.id] : state.selectedItems,
						);
					},
					commitToUndoStack: true,
				});

				cleanup();
			};

			const onKeyDown = (evt: KeyboardEvent) => {
				if (evt.key === 'Shift') {
					shiftPressed = true;
					reposition();
				}
			};

			const onKeyUp = (evt: KeyboardEvent) => {
				if (evt.key === 'Shift') {
					shiftPressed = false;
					reposition();
				}
			};

			const cleanup = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('keydown', onKeyDown);
				window.removeEventListener('keyup', onKeyUp);
				window.removeEventListener('pointerup', onPointerUp);
			};

			window.addEventListener('pointermove', onPointerMove, {passive: true});
			window.addEventListener('keydown', onKeyDown, {passive: true});
			window.addEventListener('keyup', onKeyUp, {passive: true});
			window.addEventListener('pointerup', onPointerUp, {
				once: true,
			});
		},
		[centerSnap, compositionHeight, compositionWidth, isInCropMode, item, scale, setState, stateAsRef],
	);

	const onPointerDown = useCallback(
		(e: React.MouseEvent) => {
			if (!isLeftClick(e)) {
				return;
			}
			e.stopPropagation();

			// text가 편집 중일 때 drag를 허용하지 않음
			if (item.type === 'text' && item.id === textItemEditing) {
				return;
			}

			const multiSelect = e.metaKey || e.shiftKey;
			const updatedSelectedItems = (
				prev: string[],
			): {allowDrag: boolean; newSelectedItems: string[]} => {
				const isSelected = prev.includes(item.id);
				// shift와 cmd를 누르고 이미 선택된 경우, 해당 item을 선택 해제
				if (isSelected && multiSelect) {
					return {
						allowDrag: false,
						newSelectedItems: prev.filter((id) => id !== item.id),
					};
				}

				// 이미 선택됨, drag 허용
				if (isSelected) {
					return {allowDrag: true, newSelectedItems: prev};
				}

				if (multiSelect) {
					return {allowDrag: true, newSelectedItems: [...prev, item.id]};
				}

				return {allowDrag: true, newSelectedItems: [item.id]};
			};

			setState({
				update: (state) => {
					const newSelectedItems = updatedSelectedItems(
						state.selectedItems,
					).newSelectedItems;

					if (newSelectedItems === state.selectedItems) {
						return state;
					}

					return {
						...state,
						selectedItems: newSelectedItems,
					};
				},
				commitToUndoStack: true,
			});

			const {newSelectedItems, allowDrag} = updatedSelectedItems(selectedItems);

			// item이 선택 해제되지 않은 경우에만 drag 허용
			if (allowDrag) {
				startDragging(e, newSelectedItems);
			}
		},
		[item, selectedItems, setState, startDragging, textItemEditing],
	);

	const onDoubleClick = useCallback(
		(e: React.MouseEvent) => {
			if (item.type === 'text' && selected) {
				setState({
					update: (state) => {
						return markTextAsEditing({state, itemId: item.id});
					},
					commitToUndoStack: true,
				});
				e.stopPropagation();
			}
		},
		[setState, item.id, item.type, selected],
	);

	const asset = useAssetIfApplicable(item);
	const currentAssetStatus = asset ? assetStatus[asset.id] : null;

	const uploadProgress = isAssetUploading(currentAssetStatus)
		? currentAssetStatus.progress
		: null;

	const uploadError = useMemo(() => {
		if (isAssetError(currentAssetStatus)) {
			return currentAssetStatus.error;
		}
		return null;
	}, [currentAssetStatus]);

	const canRetry = canAssetRetryUpload(currentAssetStatus);

	const handleRetry = useCallback(() => {
		if (asset) {
			retryAssetUpload({asset, setState});
		}
	}, [asset, setState]);

	return (
		<ItemContextMenuTrigger item={item}>
			<div
				onPointerDown={onPointerDown}
				onPointerEnter={onMouseEnter}
				onPointerLeave={onMouseLeave}
				onDoubleClick={onDoubleClick}
				style={style}
				data-id={item.id}
			>
				{uploadProgress ? (
					<SelectionUploadProgress uploadProgress={uploadProgress} />
				) : null}
				{uploadError ? (
					<SelectionError
						uploadError={uploadError}
						onRetry={canRetry ? handleRetry : undefined}
						canRetry={Boolean(canRetry)}
					/>
				) : null}
				{selected &&
				!(item.type === 'text' && item.id === textItemEditing) &&
				selectedItems.length === 1 ? (
					<>
						{/* 크롭 모드일 때는 크롭 핸들 표시 */}
						{isInCropMode ? (
							<>
								<CropHandle itemId={item.id} type="top-left" itemWidth={item.width} itemHeight={item.height} />
								<CropHandle itemId={item.id} type="top-right" itemWidth={item.width} itemHeight={item.height} />
								<CropHandle itemId={item.id} type="bottom-left" itemWidth={item.width} itemHeight={item.height} />
								<CropHandle itemId={item.id} type="bottom-right" itemWidth={item.width} itemHeight={item.height} />
								<CropHandle itemId={item.id} type="top" itemWidth={item.width} itemHeight={item.height} />
								<CropHandle itemId={item.id} type="right" itemWidth={item.width} itemHeight={item.height} />
								<CropHandle itemId={item.id} type="bottom" itemWidth={item.width} itemHeight={item.height} />
								<CropHandle itemId={item.id} type="left" itemWidth={item.width} itemHeight={item.height} />
							</>
						) : (
							<>
								<ResizeHandle
									height={item.height}
									width={item.width}
									left={item.left}
									top={item.top}
									itemId={item.id}
									type="top-left"
								/>
								<ResizeHandle
									height={item.height}
									width={item.width}
									left={item.left}
									top={item.top}
									itemId={item.id}
									type="top-right"
								/>
								<ResizeHandle
									height={item.height}
									width={item.width}
									left={item.left}
									top={item.top}
									itemId={item.id}
									type="bottom-left"
								/>
								<ResizeHandle
									height={item.height}
									width={item.width}
									left={item.left}
									top={item.top}
									itemId={item.id}
									type="bottom-right"
								/>
								<ResizeHandle
									height={item.height}
									width={item.width}
									left={item.left}
									top={item.top}
									itemId={item.id}
									type="top"
								/>
								<ResizeHandle
									height={item.height}
									width={item.width}
									left={item.left}
									top={item.top}
									itemId={item.id}
									type="right"
								/>
								<ResizeHandle
									height={item.height}
									width={item.width}
									left={item.left}
									top={item.top}
									itemId={item.id}
									type="bottom"
								/>
								<ResizeHandle
									height={item.height}
									width={item.width}
									left={item.left}
									top={item.top}
									itemId={item.id}
									type="left"
								/>
								<SelectionDimensions height={item.height} width={item.width} />
								{/* 크롭 가능한 아이템에만 크롭 버튼 표시 */}
								{FEATURE_CROPPING && getCanCrop(item) ? (
									<CropButton itemId={item.id} />
								) : null}
							</>
						)}
					</>
				) : null}
			</div>
		</ItemContextMenuTrigger>
	);
};

export const SelectionOutline = React.memo(SelectionOutlineUnmemoized);
