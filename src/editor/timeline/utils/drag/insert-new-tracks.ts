import {TrackCategory, TrackType} from '../../../state/types';
import {generateRandomId} from '../../../utils/generate-random-id';
import {TrackInsertions} from './types';

export const insertNewTracks = ({
	tracks,
	trackInsertions,
	category = 'video',
}: {
	tracks: TrackType[];
	trackInsertions: TrackInsertions | null;
	category?: TrackCategory;
}): TrackType[] => {
	if (trackInsertions === null) {
		return tracks;
	}

	const newTracks = Array(trackInsertions.count)
		.fill(null)
		.map(
			(): TrackType => ({
				id: generateRandomId(),
				items: [],
				hidden: false,
				muted: false,
				category,
			}),
		);

	if (trackInsertions.type === 'top') {
		return [...newTracks, ...tracks];
	}

	if (trackInsertions.type === 'bottom') {
		return [...tracks, ...newTracks];
	}

	if (trackInsertions.type === 'between') {
		// 숫자 position 처리 (track 사이 삽입)
		const insertIndex = Math.max(
			0,
			Math.min(trackInsertions.trackIndex, tracks.length),
		);
		return [
			...tracks.slice(0, insertIndex),
			...newTracks,
			...tracks.slice(insertIndex),
		];
	}

	throw new Error(
		`Unexpected trackInsertions: ${JSON.stringify(trackInsertions satisfies never)}`,
	);
};
