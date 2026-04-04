import {TrackType} from '../../../../state/types';
import {TrackInsertions} from '../types';

type TrackInsertionInfo = {
	targetTrack: number;
	trackInsertions: TrackInsertions | null;
};

// Helper – raw track offset이 주어졌을 때 (< 0 / > tracks.length-1일 수 있음),
// 새로운 track을 삽입해야 하는지 결정하고 잠재적 삽입 *이후의* 최종 target
// track index를 반환
export const computeTrackInsertionInfoforSingleItem = ({
	allTracks,
	startTrack,
	rawTrackOffset,
}: {
	allTracks: TrackType[];
	startTrack: number;
	rawTrackOffset: number;
}): TrackInsertionInfo => {
	const tentativeTrack = startTrack + rawTrackOffset;

	if (tentativeTrack < 0) {
		const count = Math.abs(tentativeTrack);
		return {
			targetTrack: 0,
			trackInsertions: {type: 'top', count},
		};
	}

	if (tentativeTrack >= allTracks.length) {
		const count = tentativeTrack - allTracks.length + 1;
		return {
			targetTrack: tentativeTrack,
			trackInsertions: {type: 'bottom', count},
		};
	}

	return {targetTrack: tentativeTrack, trackInsertions: null};
};
