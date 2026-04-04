import {ItemSide} from '../../items/trim-indicator';
import {EditorState} from '../types';

export const markItemAsBeingTrimmed = ({
	state,
	itemId,
	side,
	maxDurationInFrames,
	minFrom,
	trackIndex,
	top,
	height,
}: {
	state: EditorState;
	itemId: string;
	side: ItemSide;
	maxDurationInFrames: number | null;
	minFrom: number | null;
	trackIndex: number;
	top: number;
	height: number;
}): EditorState => {
	let currentItemsBeingTrimmed = state.itemsBeingTrimmed;

	for (const item of currentItemsBeingTrimmed) {
		if (item.itemId === itemId) {
			if (
				item.maxDurationInFrames === maxDurationInFrames &&
				item.minFrom === minFrom &&
				item.side === side
			) {
				// 이미 이 상태에 있다면 이전 state 반환
				return state;
			} else {
				// item이 이미 다른 설정으로 trim 중이었다면 array에서 제거
				// 아래에서 다시 추가할 수 있도록
				currentItemsBeingTrimmed = currentItemsBeingTrimmed.filter(
					(i) => i.itemId !== itemId,
				);
			}
		}
	}

	return {
		...state,
		itemsBeingTrimmed: [
			...currentItemsBeingTrimmed,
			{itemId, side, maxDurationInFrames, minFrom, trackIndex, top, height},
		],
	};
};

export const unmarkItemAsBeingTrimmed = ({
	state,
	itemId,
}: {
	state: EditorState;
	itemId: string;
}): EditorState => {
	const currentItemsBeingTrimmed = state.itemsBeingTrimmed.find(
		(item) => item.itemId === itemId,
	);

	if (!currentItemsBeingTrimmed) {
		return state;
	}

	return {
		...state,
		itemsBeingTrimmed: state.itemsBeingTrimmed.filter(
			(item) => item.itemId !== itemId,
		),
	};
};
