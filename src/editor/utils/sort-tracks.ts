import {TrackCategory, TrackType} from '../state/types';

/**
 * 트랙을 카테고리 순서대로 정렬합니다.
 * 순서: 자막(text) → 영상(video) → 오디오(audio)
 */
export const sortTracks = (tracks: TrackType[]): TrackType[] => {
	const order: Record<TrackCategory, number> = {text: 0, video: 1, audio: 2};
	return [...tracks].sort((a, b) => order[a.category] - order[b.category]);
};
