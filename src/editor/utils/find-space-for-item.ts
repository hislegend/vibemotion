import {EditorStarterItem} from '../items/item-type';
import {TrackCategory, TrackType} from '../state/types';
import {isTrackPositionBusy} from './is-track-position-busy';

export interface Space {
	trackIndex: number;
	forceCreateNewTrack: boolean;
	/** 새 트랙 생성 시 사용할 카테고리 */
	newCategory?: TrackCategory;
}

export type FindSpaceStartPosition =
	| {
			type: 'front';
	  }
	| {
			type: 'back';
	  }
	| {
			type: 'directly-above';
			trackIndex: number;
	  };

/**
 * 해당 카테고리의 트랙만 필터링하여 인덱스 매핑과 함께 반환
 */
const filterTracksByCategory = (
	tracks: TrackType[],
	category: TrackCategory,
): {track: TrackType; originalIndex: number}[] => {
	return tracks
		.map((track, idx) => ({track, originalIndex: idx}))
		.filter(({track}) => track.category === category);
};

const findSpaceForItemAbove = ({
	durationInFrames,
	startAt,
	tracks,
	above,
	items,
	itemCategory,
}: {
	durationInFrames: number;
	startAt: number;
	tracks: TrackType[];
	above: number;
	items: Record<string, EditorStarterItem>;
	itemCategory: TrackCategory;
}): Space => {
	// 해당 카테고리 트랙만 필터링
	const matchingTracks = filterTracksByCategory(tracks, itemCategory);

	if (matchingTracks.length === 0) {
		// 해당 카테고리 트랙이 없으면 새로 생성
		return {trackIndex: -1, forceCreateNewTrack: false, newCategory: itemCategory};
	}

	// above 위치 기준으로 같은 카테고리 트랙 중 위쪽 트랙 찾기
	const matchingAboveIdx = matchingTracks.findIndex(
		({originalIndex}) => originalIndex >= above,
	);

	if (matchingAboveIdx === 0 || matchingAboveIdx === -1) {
		// 해당 카테고리의 첫 번째 트랙이거나 못 찾음 → 새 트랙 생성
		const firstMatchingTrack = matchingTracks[0];
		if (
			!isTrackPositionBusy({
				track: firstMatchingTrack.track,
				startAt,
				durationInFrames,
				items,
			})
		) {
			return {trackIndex: firstMatchingTrack.originalIndex, forceCreateNewTrack: false};
		}
		return {
			trackIndex: firstMatchingTrack.originalIndex,
			forceCreateNewTrack: true,
			newCategory: itemCategory,
		};
	}

	const trackAbove = matchingTracks[matchingAboveIdx - 1];

	if (
		isTrackPositionBusy({
			track: trackAbove.track,
			startAt,
			durationInFrames,
			items,
		})
	) {
		return {
			trackIndex: matchingTracks[matchingAboveIdx].originalIndex,
			forceCreateNewTrack: true,
			newCategory: itemCategory,
		};
	}

	return {trackIndex: trackAbove.originalIndex, forceCreateNewTrack: false};
};

const findSpaceForItemInFront = ({
	durationInFrames,
	startAt,
	tracks,
	items,
	stopOnFirstFound,
	itemCategory,
}: {
	durationInFrames: number;
	startAt: number;
	tracks: TrackType[];
	items: Record<string, EditorStarterItem>;
	stopOnFirstFound: boolean;
	itemCategory: TrackCategory;
}): Space => {
	// 해당 카테고리 트랙만 필터링
	const matchingTracks = filterTracksByCategory(tracks, itemCategory);

	if (matchingTracks.length === 0) {
		// 해당 카테고리 트랙이 없으면 새로 생성
		return {trackIndex: -1, forceCreateNewTrack: false, newCategory: itemCategory};
	}

	// 더 나은 곳을 찾지 못하면 새 track을 생성합니다
	let bestTrackPosition: Space = {
		trackIndex: -1,
		forceCreateNewTrack: false,
		newCategory: itemCategory,
	};

	for (const {track, originalIndex} of matchingTracks) {
		const isBusy = isTrackPositionBusy({
			track,
			startAt,
			durationInFrames,
			items,
		});

		// track이 사용 중이면 다른 item 아래에 배치하게 됩니다.
		// 여기서 중단하고 지금까지 찾은 최적의 track 위치를 반환합니다.
		if (isBusy) {
			return bestTrackPosition;
		}
		bestTrackPosition = {trackIndex: originalIndex, forceCreateNewTrack: false};
		if (stopOnFirstFound) {
			break;
		}
	}

	return bestTrackPosition;
};

const findSpaceForItemInBack = ({
	durationInFrames,
	startAt,
	tracks,
	items,
	stopOnFirstFound,
	itemCategory,
}: {
	durationInFrames: number;
	startAt: number;
	tracks: TrackType[];
	items: Record<string, EditorStarterItem>;
	stopOnFirstFound: boolean;
	itemCategory: TrackCategory;
}): Space => {
	// 해당 카테고리 트랙만 필터링
	const matchingTracks = filterTracksByCategory(tracks, itemCategory);

	if (matchingTracks.length === 0) {
		// 해당 카테고리 트랙이 없으면 새로 생성
		return {
			trackIndex: tracks.length,
			forceCreateNewTrack: false,
			newCategory: itemCategory,
		};
	}

	// 더 나은 곳을 찾지 못하면 새 track을 생성합니다
	let bestTrackPosition: Space = {
		trackIndex: tracks.length,
		forceCreateNewTrack: false,
		newCategory: itemCategory,
	};

	// 뒤에서부터 순회
	for (let i = matchingTracks.length - 1; i >= 0; i--) {
		const {track, originalIndex} = matchingTracks[i];
		const isBusy = isTrackPositionBusy({
			track,
			startAt,
			durationInFrames,
			items,
		});

		// track이 사용 중이면 다른 item 아래에 배치하게 됩니다.
		// 여기서 중단하고 지금까지 찾은 최적의 track 위치를 반환합니다.
		if (isBusy) {
			return bestTrackPosition;
		}
		bestTrackPosition = {trackIndex: originalIndex, forceCreateNewTrack: false};
		if (stopOnFirstFound) {
			break;
		}
	}

	return bestTrackPosition;
};

export const findSpaceForItem = ({
	durationInFrames,
	startAt,
	tracks,
	startPosition,
	stopOnFirstFound,
	items,
	itemCategory,
}: {
	durationInFrames: number;
	startAt: number;
	tracks: TrackType[];
	startPosition: FindSpaceStartPosition;
	stopOnFirstFound: boolean;
	items: Record<string, EditorStarterItem>;
	itemCategory: TrackCategory;
}): Space => {
	if (startPosition.type === 'directly-above') {
		return findSpaceForItemAbove({
			durationInFrames,
			startAt,
			tracks,
			above: startPosition.trackIndex,
			items,
			itemCategory,
		});
	}

	if (startPosition.type === 'front') {
		return findSpaceForItemInFront({
			durationInFrames,
			startAt,
			tracks,
			items,
			stopOnFirstFound,
			itemCategory,
		});
	}

	if (startPosition.type === 'back') {
		return findSpaceForItemInBack({
			durationInFrames,
			startAt,
			tracks,
			items,
			stopOnFirstFound,
			itemCategory,
		});
	}

	throw new Error(
		'Invalid start position: ' + JSON.stringify(startPosition satisfies never),
	);
};
