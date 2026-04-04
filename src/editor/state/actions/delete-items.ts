import {removeEmptyTracks} from '../../utils/remove-empty-tracks';
import {getOrphanedAssetIds} from '../get-orphaned-asset';
import {EditorState, UndoableState} from '../types';
import {setSelectedItems} from './set-selected-items';

export const deleteItems = (state: EditorState, idsToDelete: string[]) => {
	const newTracks = state.undoableState.tracks.map((track) => {
		const items = track.items.filter((itemId) => {
			if (idsToDelete.includes(itemId)) {
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
		assets: {
			...state.undoableState.assets,
		},
	};

	// 아이템만 삭제, 에셋은 패널에 보존
	// (에셋은 에셋 패널에서 직접 삭제할 때만 제거됨)
	for (const id of idsToDelete) {
		delete newState.items[id];
	}

	const newSelectedItems = state.selectedItems.filter(
		(id) => !idsToDelete.includes(id),
	);

	return setSelectedItems(
		{
			...state,
			undoableState: newState,
		},
		newSelectedItems,
	);
};
