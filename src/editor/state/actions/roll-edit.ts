import {EditorStarterAsset} from '../../assets/assets';
import {ItemSide} from '../../items/trim-indicator';
import {TimelineItemAdjacency} from '../../timeline/timeline-track/timeline-track-rolling-edit';
import {clamp} from '../../utils/clamp';
import {EditorState} from '../types';
import {changeItem} from './change-item';
import {
	extendLeft,
	getMinimumFromWhenExtendingLeftBasedOnAsset,
} from './extend-left';
import {
	extendRight,
	getMaximumDurationWhenExtendingRightBasedOnAsset,
} from './extend-right';

// 두 item을 동시에 이동

export const rollEdit = ({
	state,
	adjacency,
	firstItemInitialFrom,
	firstItemInitialDurationInFrames,
	firstItemIndex,
	trackItemsSorted,
	offsetInFrames,
	firstItemAsset,
	secondItemIndex,
	secondItemInitialDurationInFrames,
	secondItemInitialFrom,
	draggingDirection,
	timelineWidth,
	visibleFrames,
}: {
	state: EditorState;
	adjacency: TimelineItemAdjacency;
	firstItemInitialFrom: number;
	firstItemInitialDurationInFrames: number;
	firstItemIndex: number;
	secondItemInitialFrom: number;
	secondItemInitialDurationInFrames: number;
	secondItemIndex: number;
	firstItemAsset: EditorStarterAsset | null;
	trackItemsSorted: string[];
	offsetInFrames: number;
	draggingDirection: ItemSide;
	timelineWidth: number;
	visibleFrames: number;
}) => {
	const minimumFrom = getMinimumFromWhenExtendingLeftBasedOnAsset({
		fps: state.undoableState.fps,
		prevItem: state.undoableState.items[adjacency.next],
	});

	const maxDuration = getMaximumDurationWhenExtendingRightBasedOnAsset({
		asset: firstItemAsset,
		fps: state.undoableState.fps,
		prevItem: state.undoableState.items[adjacency.previous],
	});

	const pixelsPerFrame = timelineWidth / visibleFrames;

	const clampedOffsetInFrames = clamp({
		value: offsetInFrames,
		min: (minimumFrom ?? 0) - secondItemInitialFrom,
		max: maxDuration - firstItemInitialDurationInFrames,
	});

	// timeline에서 item들이 서로를 차단하기 때문에 처음에는 이동이 불가능할 수 있음
	// 따라서 두 편집을 차례로 적용
	// 1. 왼쪽으로 드래그하는 경우, 먼저 첫 번째 item을 축소한 다음 두 번째 item을 확장
	// 2. 오른쪽으로 드래그하는 경우, 먼저 두 번째 item을 축소한 다음 첫 번째 item을 확장
	if (draggingDirection === 'left') {
		const firstEdit = changeItem(state, adjacency.previous, (prevItem) => {
			return extendRight({
				prevItem,
				fps: state.undoableState.fps,
				initialFrom: firstItemInitialFrom,
				initialDurationInFrames: firstItemInitialDurationInFrames,
				itemIndex: firstItemIndex,
				trackItemsSorted,
				items: state.undoableState.items,
				offsetInFrames: clampedOffsetInFrames,
				asset: firstItemAsset,
				pixelsPerFrame,
				visibleFrames,
			});
		});

		return changeItem(firstEdit, adjacency.next, (prevItem) => {
			return extendLeft({
				prevItem,
				fps: state.undoableState.fps,
				initialFrom: secondItemInitialFrom,
				initialDurationInFrames: secondItemInitialDurationInFrames,
				itemIndex: secondItemIndex,
				trackItemsSorted,
				items: firstEdit.undoableState.items,
				offsetInFrames: clampedOffsetInFrames,
				pixelsPerFrame,
			});
		});
	} else {
		const firstEdit = changeItem(state, adjacency.next, (prevItem) => {
			return extendLeft({
				prevItem,
				fps: state.undoableState.fps,
				initialFrom: secondItemInitialFrom,
				initialDurationInFrames: secondItemInitialDurationInFrames,
				itemIndex: secondItemIndex,
				items: state.undoableState.items,
				offsetInFrames: clampedOffsetInFrames,
				trackItemsSorted,
				pixelsPerFrame,
			});
		});

		return changeItem(firstEdit, adjacency.previous, (prevItem) => {
			return extendRight({
				prevItem,
				fps: state.undoableState.fps,
				initialFrom: firstItemInitialFrom,
				asset: firstItemAsset,
				offsetInFrames: clampedOffsetInFrames,
				trackItemsSorted,
				itemIndex: firstItemIndex,
				initialDurationInFrames: firstItemInitialDurationInFrames,
				items: firstEdit.undoableState.items,
				pixelsPerFrame,
				visibleFrames,
			});
		});
	}
};
