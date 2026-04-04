import {DEFAULT_TIMELINE_SNAPPING_THRESHOLD_PIXELS} from '../../../constants';
import {EditorStarterItem} from '../../../items/item-type';
import {EditorState, TrackType} from '../../../state/types';
import {DragPreviewState, PreviewPosition} from '../../drag-preview-provider';
import type {ItemEdge, SnapPoint} from '../snap-points';
import {findBestSnapForMultipleEdges} from '../snap-points';
import {getTrackOffset} from './get-track-offset';
import {calculateNewItemPositionForMultipleItems} from './multiple-items/calculate-new-item-position-for-multiple-items';
import {
	getMakesSenseToInsertTrackAtBottom,
	getMakesSenseToInsertTrackAtTop,
} from './should-insert-track';
import {calculateNewItemPositionForSingleItem} from './single-items/calculate-new-item-position-for-single-items';

// 가로 드래그 거리를 기반으로 frame offset 계산
const getFrameOffset = ({
	offsetX,
	timelineWidth,
	visibleFrames,
}: {
	offsetX: number;
	timelineWidth: number;
	visibleFrames: number;
}) => Math.round((offsetX / timelineWidth) * visibleFrames);

export const calculateNewItemPositions = ({
	clickedItemId,
	draggedItems,
	draggedItemIds,
	timelineWidth,
	offsetX,
	offsetY,
	tracks,
	visibleFrames,
	allItems,
	state,
	setSnappedPositions,
	snapPoints,
}: {
	clickedItemId: string;
	draggedItems: Array<PreviewPosition>;
	draggedItemIds: string[];
	timelineWidth: number;
	visibleFrames: number;
	offsetX: number;
	offsetY: number;
	tracks: TrackType[];
	allItems: Record<string, EditorStarterItem>;
	state: EditorState;
	setSnappedPositions:
		| null
		| ((positions: Record<string, number> | null) => void);
	snapPoints: SnapPoint[];
}): DragPreviewState | null => {
	const makesSenseToInsertTrackAtTop = getMakesSenseToInsertTrackAtTop({
		tracks,
		itemsBeingDragged: draggedItemIds,
	});
	const makesSenseToInsertTrackAtBottom = getMakesSenseToInsertTrackAtBottom({
		tracks,
		itemsBeingDragged: draggedItemIds,
	});

	let frameOffset = getFrameOffset({offsetX, timelineWidth, visibleFrames});
	let snapPoint: SnapPoint | null = null;

	// snapping이 활성화된 경우 적용
	if (state && state.isSnappingEnabled === true && draggedItems.length > 0) {
		// 드래그된 item들로부터 모든 edge를 수집 (왼쪽과 오른쪽 모두)
		const itemEdges: ItemEdge[] = [];
		for (const item of draggedItems) {
			itemEdges.push({
				frame: item.from + frameOffset,
				type: 'left',
				itemId: item.id,
			});
			itemEdges.push({
				frame: item.from + item.durationInFrames + frameOffset,
				type: 'right',
				itemId: item.id,
			});
		}

		// 모든 edge에서 최적의 snap 찾기
		const {snapOffset, activeSnapPoint} = findBestSnapForMultipleEdges({
			itemEdges,
			snapPoints,
			pixelThreshold: DEFAULT_TIMELINE_SNAPPING_THRESHOLD_PIXELS,
			timelineWidth,
			visibleFrames,
			isSnappingEnabled: state.isSnappingEnabled,
		});
		snapPoint = activeSnapPoint;

		// 각 item에 대한 snap된 위치 전달
		if (setSnappedPositions) {
			if (snapOffset !== null) {
				const snappedPositions: Record<string, number> = {};
				for (const item of draggedItems) {
					snappedPositions[item.id] = item.from + frameOffset + snapOffset;
				}
				setSnappedPositions(snappedPositions);
			} else {
				setSnappedPositions(null);
			}
		}

		// frame offset에 snap offset 적용
		if (snapOffset !== null) {
			frameOffset += snapOffset;
		}
	} else {
		// snapping이 비활성화되었을 때 snap된 위치 지우기
		if (setSnappedPositions) {
			setSnappedPositions(null);
		}
	}

	const clickedItem = draggedItems.find((item) => item.id === clickedItemId);
	if (!clickedItem) {
		throw new Error('Reference item not found');
	}

	const isMultiItemDrag = draggedItems.length > 1;

	const dragDirection = offsetY < 0 ? 'up' : offsetY > 0 ? 'down' : 'none';
	// https://github.com/remotion-dev/editor-starter/issues/368 지원을 위한 분기
	// 여기서는 그룹에 대한 드래그의 기준점으로 위쪽 또는 아래쪽 item을 사용합니다,
	// 드래그 방향에 따라
	const sourceTrackIndex = isMultiItemDrag
		? dragDirection === 'up'
			? Math.max(...draggedItems.map((item) => item.trackIndex)) // bottom-most item for upward drags
			: Math.min(...draggedItems.map((item) => item.trackIndex)) // top-most item for downward drags
		: clickedItem.trackIndex;

	const trackOffsetResult = getTrackOffset({
		tracks,
		offsetY,
		sourceTrackIndex,
		allItems: allItems,
		makesSenseToInsertTrackAtTop,
		makesSenseToInsertTrackAtBottom,
		draggedItems,
	});

	// 단일 item의 경우
	if (draggedItems.length === 1) {
		return calculateNewItemPositionForSingleItem({
			draggedItem: draggedItems[0],
			tracks,
			allItems,
			frameOffset,
			trackOffsetResult,
			snapPoint,
		});
	}

	// 여러 item의 경우
	return calculateNewItemPositionForMultipleItems({
		draggedItems,
		draggedItemIds,
		tracks,
		allItems,
		frameOffset,
		trackOffsetResult,
		snapPoint,
	});
};
