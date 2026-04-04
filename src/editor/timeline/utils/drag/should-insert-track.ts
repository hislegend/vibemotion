import {TrackType} from '../../../state/types';

// 드래그되는 item들이 이미 최상위 track들의 전체를 구성하는 경우 track을 삽입하지 않음
export const getMakesSenseToInsertTrackAtTop = ({
	tracks,
	itemsBeingDragged,
}: {
	tracks: TrackType[];
	itemsBeingDragged: string[];
}) => {
	const itemsRemaining = [...itemsBeingDragged];
	for (const track of tracks) {
		const itemsRemainingInTrack = [...track.items];
		for (const itemId of track.items) {
			if (itemsRemaining.includes(itemId)) {
				itemsRemaining.splice(itemsRemaining.indexOf(itemId), 1);
				itemsRemainingInTrack.splice(itemsRemainingInTrack.indexOf(itemId), 1);
			} else {
				return true;
			}
		}
		if (itemsRemainingInTrack.length > 0) {
			return true;
		}

		if (itemsRemaining.length === 0) {
			return false;
		}
	}

	return true;
};

export const getMakesSenseToInsertTrackAtBottom = ({
	tracks,
	itemsBeingDragged,
}: {
	tracks: TrackType[];
	itemsBeingDragged: string[];
}) => {
	return getMakesSenseToInsertTrackAtTop({
		tracks: tracks.slice().reverse(),
		itemsBeingDragged,
	});
};
