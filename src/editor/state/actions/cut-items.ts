import {removeEmptyTracks} from '../../utils/remove-empty-tracks';
import {EditorState, UndoableState} from '../types';
import {setSelectedItems} from './set-selected-items';

// deleteItems와 비슷하지만 잠재적인 paste 작업을 위해 asset을 제거하지 않음
export const cutItems = (state: EditorState, idsToCut: string[]) => {
	const newTracks = state.undoableState.tracks.map((track) => {
		const items = track.items.filter((itemId) => {
			if (idsToCut.includes(itemId)) {
				return false;
			}

			return true;
		});

		// item이 삭제되지 않았으면 새 object를 생성하지 않음
		if (items.length === track.items.length) {
			return track;
		}

		return {
			...track,
			items: items,
		};
	});

	const newState: UndoableState = {
		...state.undoableState,
		tracks: removeEmptyTracks(newTracks),
		items: {
			...state.undoableState.items,
		},
	};

	for (const id of idsToCut) {
		delete newState.items[id];
	}

	const newSelectedItems = state.selectedItems.filter(
		(id) => !idsToCut.includes(id),
	);

	return setSelectedItems(
		{
			...state,
			undoableState: newState,
		},
		newSelectedItems,
	);
};
