import {EditorStarterItem} from '../../items/item-type';
import {generateRandomId} from '../../utils/generate-random-id';
import {EditorState} from '../types';
import {addItem} from './add-item';
import {setSelectedItems} from './set-selected-items';

export const pasteItems = ({
	state,
	copiedItems,
	from,
	position,
}: {
	state: EditorState;
	copiedItems: EditorStarterItem[];
	from: number;
	position: null | {x: number; y: number};
}): EditorState => {
	let newState = state;
	const idsToSelect = [];

	// 여러 item을 추가할 때, copy될 때와 동일한 horizontal offset을 유지해야 합니다.
	// 가장 왼쪽 item을 기준으로 합니다.
	// 하지만 playhead 위치에 삽입하므로 offset을 다시 계산해야 합니다
	const minFrom = Math.min(...copiedItems.map((item) => item.from));
	const offsetFrames = from - minFrom;

	// timeline의 맨 위에 item들을 추가하므로 (position: { type: 'front' })
	// 올바른 layer 순서를 유지하기 위해
	// copy된 item들의 순서를 뒤집어야 합니다
	for (const copiedItem of [...copiedItems].reverse()) {
		// 원본 from 값을 유지하되 offset 추가
		const finalItem: EditorStarterItem = {
			...copiedItem,
			id: generateRandomId(),
			from: copiedItem.from + offsetFrames,
		};

		// position이 제공된 경우 left와 top 좌표 업데이트
		// 클릭된 위치에 item을 중앙에 배치하기 위해 width/height의 절반을 빼기
		if (position) {
			finalItem.left = position.x - finalItem.width / 2;
			finalItem.top = position.y - finalItem.height / 2;
		}

		newState = addItem({
			state: newState,
			item: finalItem,
			select: false,
			position: {type: 'front'},
		});

		idsToSelect.push(finalItem.id);
	}

	return setSelectedItems(newState, idsToSelect);
};
