import {AudioItem} from '../../items/audio/audio-item-type';
import {CaptionsItem} from '../../items/captions/captions-item-type';
import {GifItem} from '../../items/gif/gif-item-type';
import {EditorStarterItem} from '../../items/item-type';
import {VideoItem} from '../../items/video/video-item-type';
import {
	AudioFadableItem,
	getCanFadeAudio,
	getCanFadeVisual,
	VisuallyFadableItem,
} from '../../utils/fade';
import {generateRandomId} from '../../utils/generate-random-id';
import {EditorState, TrackType} from '../types';

export const splitItem = ({
	state,
	idToSplit,
	framePosition,
}: {
	state: EditorState;
	idToSplit: string;
	framePosition: number;
}): EditorState => {
	// 분할할 track과 item 찾기
	let targetTrack: TrackType | undefined;
	const targetItem: EditorStarterItem = state.undoableState.items[idToSplit];
	let targetTrackIndex = -1;

	for (let i = 0; i < state.undoableState.tracks.length; i++) {
		const track = state.undoableState.tracks[i];
		if (track.items.includes(idToSplit)) {
			targetTrack = track;
			targetTrackIndex = i;
			break;
		}
	}

	if (!targetTrack || !targetItem || targetTrackIndex === -1) {
		return state;
	}

	// item 내에서 상대적 분할 위치 계산
	const itemStart = targetItem.from;
	const itemEnd = itemStart + targetItem.durationInFrames;

	// frame 위치가 item 범위 내에 있고 가장자리가 아니면 분할
	if (framePosition <= itemStart || framePosition >= itemEnd) {
		return state;
	}

	// 두 개의 새로운 item 생성
	const firstItemDuration = framePosition - itemStart;
	const secondItemDuration = itemEnd - framePosition;

	const firstItem: EditorStarterItem = {
		...targetItem,
		id: generateRandomId(),
		durationInFrames: firstItemDuration,
	};

	const secondItem: EditorStarterItem = {
		...targetItem,
		id: generateRandomId(),
		from: framePosition,
		durationInFrames: secondItemDuration,
	};

	// video의 특별한 경우 처리 - 두 번째 item의 videoStartFromInSeconds 조정
	if (targetItem.type === 'video') {
		const firstItemDurationInSeconds =
			firstItemDuration / state.undoableState.fps;
		(secondItem as VideoItem).videoStartFromInSeconds =
			(targetItem.videoStartFromInSeconds || 0) + firstItemDurationInSeconds;
	}

	// audio의 특별한 경우 처리 - 두 번째 item의 audioStartFromInSeconds 조정
	if (targetItem.type === 'audio') {
		const firstItemDurationInSeconds =
			firstItemDuration / state.undoableState.fps;
		(secondItem as AudioItem).audioStartFromInSeconds =
			(targetItem.audioStartFromInSeconds || 0) + firstItemDurationInSeconds;
	}

	// gif의 특별한 경우 처리 - 두 번째 item의 gifStartFromInSeconds 조정
	if (targetItem.type === 'gif') {
		const firstItemDurationInSeconds =
			firstItemDuration / state.undoableState.fps;
		(secondItem as GifItem).gifStartFromInSeconds =
			(targetItem.gifStartFromInSeconds || 0) + firstItemDurationInSeconds;
	}

	// audio의 특별한 경우 처리 - 두 번째 item의 audioStartFromInSeconds 조정
	if (targetItem.type === 'audio') {
		const audioItem = targetItem as AudioItem;
		const firstItemDurationInSeconds =
			firstItemDuration / state.undoableState.fps;
		(secondItem as AudioItem).audioStartFromInSeconds =
			(audioItem.audioStartFromInSeconds || 0) + firstItemDurationInSeconds;
	}

	// captions의 특별한 경우 처리 - 두 번째 item의 captionStartInSeconds 조정
	if (targetItem.type === 'captions') {
		const firstItemDurationInSeconds =
			firstItemDuration / state.undoableState.fps;
		(secondItem as CaptionsItem).captionStartInSeconds =
			(targetItem.captionStartInSeconds || 0) + firstItemDurationInSeconds;
	}

	// fadable item의 특별한 경우 - 첫 번째 item은 fadein 유지, 두 번째 item은 fade out 유지
	if (getCanFadeVisual(targetItem)) {
		(firstItem as VisuallyFadableItem).fadeOutDurationInSeconds = 0;
		(secondItem as VisuallyFadableItem).fadeInDurationInSeconds = 0;
		(firstItem as VisuallyFadableItem).fadeOutDurationInSeconds = Math.min(
			(firstItem as VisuallyFadableItem).fadeOutDurationInSeconds,
			firstItemDuration / state.undoableState.fps,
		);
		(secondItem as VisuallyFadableItem).fadeOutDurationInSeconds = Math.min(
			(secondItem as VisuallyFadableItem).fadeOutDurationInSeconds,
			secondItemDuration / state.undoableState.fps,
		);
	}

	// audio와 video의 특별한 경우 - 첫 번째 item은 volume fade in 유지, 두 번째 item은 fade out 유지
	if (getCanFadeAudio(targetItem)) {
		(firstItem as AudioFadableItem).audioFadeOutDurationInSeconds = 0;
		(secondItem as AudioFadableItem).audioFadeInDurationInSeconds = 0;
		(firstItem as AudioFadableItem).audioFadeOutDurationInSeconds = Math.min(
			(firstItem as AudioFadableItem).audioFadeOutDurationInSeconds,
			firstItemDuration / state.undoableState.fps,
		);
		(secondItem as AudioFadableItem).audioFadeOutDurationInSeconds = Math.min(
			(secondItem as AudioFadableItem).audioFadeOutDurationInSeconds,
			secondItemDuration / state.undoableState.fps,
		);
	}

	// 분할된 item들이 있는 업데이트된 track들 반환
	const newTracks = state.undoableState.tracks.map(
		(track, index): TrackType => {
			if (index !== targetTrackIndex) {
				return track;
			}

			return {
				...track,
				items: [
					...track.items.filter((item) => item !== idToSplit),
					firstItem.id,
					secondItem.id,
				],
			};
		},
	);

	const newItems = {
		...state.undoableState.items,
		[firstItem.id]: firstItem,
		[secondItem.id]: secondItem,
	};

	delete newItems[idToSplit];

	return {
		...state,
		undoableState: {
			...state.undoableState,
			tracks: newTracks,
			items: newItems,
		},
		selectedItems: [secondItem.id],
	};
};
