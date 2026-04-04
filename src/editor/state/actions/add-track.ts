import {generateRandomId} from '../../utils/generate-random-id';
import {sortTracks} from '../../utils/sort-tracks';
import {EditorState, TrackType, TrackCategory} from '../types';

export const addTrack = (
	state: EditorState,
	category: TrackCategory,
): EditorState => {
	const newTrack: TrackType = {
		id: generateRandomId(),
		items: [],
		hidden: false,
		muted: false,
		category,
	};

	const newTracks = sortTracks([...state.undoableState.tracks, newTrack]);

	return {
		...state,
		undoableState: {
			...state.undoableState,
			tracks: newTracks,
		},
	};
};

export type {TrackCategory};
