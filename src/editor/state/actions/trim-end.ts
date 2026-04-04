import {EditorState} from '../types';

/**
 * 아이템의 끝 부분을 현재 프레임 위치까지 트림 (W키 - 뒤 날리기)
 * 리플 편집: 뒤 클립들이 앞으로 당겨짐
 */
export const trimEnd = ({
	state,
	itemId,
	framePosition,
}: {
	state: EditorState;
	itemId: string;
	framePosition: number;
}): EditorState => {
	const item = state.undoableState.items[itemId];
	if (!item) {
		return state;
	}

	const itemStart = item.from;
	const itemEnd = itemStart + item.durationInFrames;

	// 플레이헤드가 아이템 내부에 있어야 함
	if (framePosition <= itemStart || framePosition >= itemEnd) {
		return state;
	}

	// 잘라낼 프레임 수
	const framesToTrim = itemEnd - framePosition;
	const newDuration = framePosition - itemStart;

	// 이 아이템이 속한 트랙 찾기
	const track = Object.values(state.undoableState.tracks).find((t) =>
		t.items.includes(itemId)
	);

	// 새 아이템 생성
	const updatedItem = {
		...item,
		durationInFrames: newDuration,
	};

	// 업데이트된 아이템들 객체 생성
	const updatedItems = {
		...state.undoableState.items,
		[itemId]: updatedItem,
	};

	// 리플 편집: 같은 트랙에서 원래 끝점 이후에 있는 클립들 앞으로 당기기
	if (track) {
		for (const otherItemId of track.items) {
			if (otherItemId === itemId) continue;

			const otherItem = state.undoableState.items[otherItemId];
			if (!otherItem) continue;

			// 원래 아이템의 끝점 이후에 시작하는 클립들만 이동
			if (otherItem.from >= itemEnd) {
				updatedItems[otherItemId] = {
					...otherItem,
					from: otherItem.from - framesToTrim,
				};
			}
		}
	}

	return {
		...state,
		undoableState: {
			...state.undoableState,
			items: updatedItems,
		},
	};
};
