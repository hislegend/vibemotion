import {AudioItem} from '../../items/audio/audio-item-type';
import {CaptionsItem} from '../../items/captions/captions-item-type';
import {GifItem} from '../../items/gif/gif-item-type';
import {VideoItem} from '../../items/video/video-item-type';
import {EditorState} from '../types';

/**
 * 아이템의 시작 부분을 현재 프레임 위치까지 트림 (Q키 - 앞 날리기)
 * 리플 편집: 트림된 아이템이 앞으로 당겨지고, 뒤 클립들도 따라서 앞으로 이동
 */
export const trimStart = ({
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
	const framesToTrim = framePosition - itemStart;
	const newDuration = item.durationInFrames - framesToTrim;

	// 이 아이템이 속한 트랙 찾기
	const track = Object.values(state.undoableState.tracks).find((t) =>
		t.items.includes(itemId)
	);

	// 미디어 오프셋 조정을 위한 초 단위 변환
	const trimDurationInSeconds = framesToTrim / state.undoableState.fps;

	// 새 아이템 생성 (시작점은 유지, duration만 줄임 - 리플 편집으로 앞으로 당겨짐)
	const updatedItem = {
		...item,
		from: itemStart, // 시작점 유지 (리플로 인해 뒤 클립들이 당겨짐)
		durationInFrames: newDuration,
	};

	// 미디어 오프셋 조정
	if (item.type === 'video') {
		(updatedItem as VideoItem).videoStartFromInSeconds =
			(item.videoStartFromInSeconds || 0) + trimDurationInSeconds;
	}

	if (item.type === 'audio') {
		(updatedItem as AudioItem).audioStartFromInSeconds =
			(item.audioStartFromInSeconds || 0) + trimDurationInSeconds;
	}

	if (item.type === 'gif') {
		(updatedItem as GifItem).gifStartFromInSeconds =
			(item.gifStartFromInSeconds || 0) + trimDurationInSeconds;
	}

	if (item.type === 'captions') {
		(updatedItem as CaptionsItem).captionStartInSeconds =
			(item.captionStartInSeconds || 0) + trimDurationInSeconds;
	}

	// 업데이트된 아이템들 객체 생성
	const updatedItems = {
		...state.undoableState.items,
		[itemId]: updatedItem,
	};

	// 리플 편집: 같은 트랙에서 이 아이템 뒤에 있는 클립들 앞으로 당기기
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
