import {useCallback} from 'react';
import {useDragOverlay} from '../../../drag-overlay-provider';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../../../force-specific-cursor';
import {EditorStarterItem} from '../../../items/item-type';
import {applySnapPoint} from '../../../state/actions/apply-snap-point';
import {
	markMultipleAsDraggingInTimeline,
	unmarkMultipleAsDraggingInTimeline,
} from '../../../state/actions/make-as-dragging-in-timeline';
import {EditorState, TrackType} from '../../../state/types';
import {getCompositionDuration} from '../../../utils/get-composition-duration';
import {getVisibleFrames} from '../../../utils/get-visible-frames';
import {isLeftClick} from '../../../utils/is-left-click';
import {timelineScrollContainerRef} from '../../../utils/restore-scroll-after-zoom';
import {
	adjustSelectionAfterClick,
	calculateSelectionAndDragState,
	hasExceededMoveThreshold,
} from '../../../utils/selection-utils';
import {
	useCurrentStateAsRef,
	useFps,
	useWriteContext,
} from '../../../utils/use-context';
import {
	PreviewPosition,
	useDragPreviewSetter,
} from '../../drag-preview-provider';
import type {SnapPoint} from '../snap-points';
import {collectSnapPoints} from '../snap-points';
import {useTimelineSize} from '../use-timeline-size';
import {applyNewPositionsToState} from './apply-new-positions-to-state';
import {calculateNewItemPositions} from './calculate-new-item-positions';

type DragOffsets = {
	offsetX: number;
	offsetY: number;
};

const cleanupDragEvent = ({
	pointerUpEvent,
	startX,
	startY,
	initialScrollLeft,
	initialScrollTop,
	stopDragOverlay,
}: {
	pointerUpEvent: PointerEvent;
	startX: number;
	startY: number;
	initialScrollLeft: number;
	initialScrollTop: number;
	stopDragOverlay: () => void;
}): DragOffsets => {
	stopDragOverlay();

	const finalScrollLeft = timelineScrollContainerRef.current?.scrollLeft ?? 0;
	const finalScrollTop = timelineScrollContainerRef.current?.scrollTop ?? 0;
	const scrollDifferenceX = finalScrollLeft - initialScrollLeft;
	const scrollDifferenceY = finalScrollTop - initialScrollTop;

	const offsetX = pointerUpEvent.clientX - startX + scrollDifferenceX;
	const offsetY = pointerUpEvent.clientY - startY + scrollDifferenceY;

	return {offsetX, offsetY};
};

const collectDraggedItemsData = ({
	tracks,
	items,
	itemsToDrag,
}: {
	tracks: TrackType[];
	items: Record<string, EditorStarterItem>;
	itemsToDrag: string[];
}): PreviewPosition[] => {
	const draggedItemsData: PreviewPosition[] = [];

	for (let i = 0; i < tracks.length; i++) {
		for (const trackItemId of tracks[i].items) {
			const trackItem = items[trackItemId];
			if (itemsToDrag.includes(trackItem.id)) {
				draggedItemsData.push({
					id: trackItem.id,
					from: trackItem.from,
					durationInFrames: trackItem.durationInFrames,
					trackIndex: i,
				});
			}
		}
	}

	return draggedItemsData;
};

export const useItemDrag = ({
	draggedItem,
}: {
	draggedItem: EditorStarterItem;
}) => {
	const {fps} = useFps();
	const {setState} = useWriteContext();
	const {timelineWidth} = useTimelineSize();
	const stateAsRef = useCurrentStateAsRef();

	if (timelineWidth === null) {
		throw new Error('Timeline width is null');
	}

	const setDragPreview = useDragPreviewSetter();

	const {
		startDrag: startDragOverlay,
		updateCursorPosition,
		stopDrag: stopDragOverlay,
		setSnappedPositions,
	} = useDragOverlay();

	// 선택 영역을 잠재적으로 줄이기 위한 간단한 클릭(드래그 없음) 처리
	const onClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const selectedItems = stateAsRef.current?.selectedItems;

			const multiSelect = e.metaKey || e.shiftKey;
			const newSelection = adjustSelectionAfterClick({
				clickedItem: draggedItem,
				currentSelectedItemIds: selectedItems,
				isMultiSelectMode: multiSelect,
			});

			if (newSelection.length !== selectedItems.length) {
				setState({
					update: (prev: EditorState) => ({
						...prev,
						selectedItems: newSelection,
					}),
					commitToUndoStack: true,
				});
			}
		},
		[draggedItem, setState, stateAsRef],
	);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!isLeftClick(e)) {
				return;
			}

			e.stopPropagation();

			const multiSelect = e.metaKey || e.shiftKey;

			const items = stateAsRef.current?.undoableState.items;
			const tracks = stateAsRef.current?.undoableState.tracks;
			const durationInFrames = getCompositionDuration(Object.values(items));
			const selectedItems = stateAsRef.current?.selectedItems;

			const {allowDrag, newSelectedItems} = calculateSelectionAndDragState({
				clickedItem: draggedItem,
				currentSelectedItemIds: selectedItems,
				isMultiSelectMode: multiSelect,
			});

			setState({
				update: (state: EditorState) => ({
					...state,
					selectedItems: newSelectedItems,
				}),
				commitToUndoStack: true,
			});

			if (allowDrag) {
				const visibleFrames = getVisibleFrames({
					fps,
					totalDurationInFrames: durationInFrames,
				});

				const itemsToDrag = selectedItems.includes(draggedItem.id)
					? selectedItems
					: [draggedItem.id];

				startDragOverlay({
					clickedItemId: draggedItem.id,
					itemIds: itemsToDrag,
					timelineWidth,
					visibleFrames,
					clickX: e.clientX,
					clickY: e.clientY,
					tracks,
					items,
				});
				forceSpecificCursor('grabbing');

				const startX = e.clientX;
				const startY = e.clientY;

				const initialScrollLeft =
					timelineScrollContainerRef.current?.scrollLeft ?? 0;
				const initialScrollTop =
					timelineScrollContainerRef.current?.scrollTop ?? 0;

				let didMove = false;

				// drag gesture를 위한 snap point들 미리 계산
				let snapPoints: SnapPoint[] = [];
				if (stateAsRef.current?.isSnappingEnabled) {
					snapPoints = collectSnapPoints({
						tracks,
						items,
						excludeItemIds: itemsToDrag,
					});
				}

				const onPointerMove = (pointerMoveEvent: PointerEvent) => {
					if (!didMove) {
						if (
							!hasExceededMoveThreshold(
								startX,
								startY,
								pointerMoveEvent.clientX,
								pointerMoveEvent.clientY,
							)
						) {
							// 작은 떨림 무시
							return;
						}
						didMove = true;
						setState({
							update: (state: EditorState) =>
								markMultipleAsDraggingInTimeline(state, itemsToDrag),
							commitToUndoStack: false,
						});
					}

					updateCursorPosition(
						pointerMoveEvent.clientX,
						pointerMoveEvent.clientY,
					);

					// preview를 위한 offset 계산
					const currentScrollLeft =
						timelineScrollContainerRef.current?.scrollLeft ?? 0;
					const currentScrollTop =
						timelineScrollContainerRef.current?.scrollTop ?? 0;
					const scrollDifferenceX = currentScrollLeft - initialScrollLeft;
					const scrollDifferenceY = currentScrollTop - initialScrollTop;
					const currentOffsetX =
						pointerMoveEvent.clientX - startX + scrollDifferenceX;
					const currentOffsetY =
						pointerMoveEvent.clientY - startY + scrollDifferenceY;

					const draggedItemsData = collectDraggedItemsData({
						tracks,
						items,
						itemsToDrag,
					});

					const previewPositions = calculateNewItemPositions({
						draggedItems: draggedItemsData,
						draggedItemIds: itemsToDrag,
						timelineWidth,
						offsetX: currentOffsetX,
						offsetY: currentOffsetY,
						tracks,
						visibleFrames,
						allItems: items,
						clickedItemId: draggedItem.id,
						state: stateAsRef.current,
						setSnappedPositions,
						snapPoints,
					});
					forceSpecificCursor(previewPositions ? 'grabbing' : 'not-allowed');

					setDragPreview(previewPositions);
				};

				const onPointerUp = (pointerUpEvent: PointerEvent) => {
					const {offsetX, offsetY} = cleanupDragEvent({
						pointerUpEvent,
						startX,
						startY,
						initialScrollLeft,
						initialScrollTop,
						stopDragOverlay,
					});

					window.removeEventListener('pointermove', onPointerMove);
					window.removeEventListener('pointerup', onPointerUp);

					setDragPreview(null);
					stopForcingSpecificCursor();

					if (!didMove) {
						return; // 드래그가 발생하지 않음; onClick으로 클릭 처리
					}

					const draggedItemsData: Array<PreviewPosition> =
						collectDraggedItemsData({
							tracks,
							items,
							itemsToDrag,
						});

					const newPositions = calculateNewItemPositions({
						draggedItems: draggedItemsData,
						draggedItemIds: itemsToDrag,
						timelineWidth,
						offsetX,
						offsetY,
						tracks,
						visibleFrames,
						allItems: items,
						clickedItemId: draggedItem.id,
						state: stateAsRef.current,
						setSnappedPositions: null,
						snapPoints,
					});

					setState({
						update: (prevState: EditorState) => {
							let newState = unmarkMultipleAsDraggingInTimeline(
								prevState,
								itemsToDrag,
							);

							newState = applySnapPoint({
								state: newState,
								snapPoint: null,
							});

							if (!newPositions) {
								return newState;
							}

							const {tracks: newTracks, items: newItems} =
								applyNewPositionsToState({
									prevTracks: newState.undoableState.tracks,
									dragPreview: newPositions,
									prevItems: newState.undoableState.items,
									shouldRemoveEmptyTracks: true,
								});

							return {
								...newState,
								undoableState: {
									...newState.undoableState,
									tracks: newTracks,
									items: newItems,
								},
							};
						},
						commitToUndoStack: true,
					});
				};

				window.addEventListener('pointermove', onPointerMove);
				window.addEventListener('pointerup', onPointerUp);
			}
		},
		[
			fps,
			draggedItem,
			setState,
			startDragOverlay,
			stopDragOverlay,
			timelineWidth,
			updateCursorPosition,
			stateAsRef,
			setDragPreview,
			setSnappedPositions,
		],
	);

	return {onPointerDown, onClick};
};
