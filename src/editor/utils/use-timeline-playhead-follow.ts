import {PlayerRef} from '@remotion/player';
import {useEffect, useRef} from 'react';
import {SCROLL_EDGE_THRESHOLD, TIMELINE_HORIZONTAL_PADDING} from '../constants';
import {useIsPlaying} from '../playback-controls/use-is-playing';
import {SIDE_PANEL_WIDTH} from '../timeline/timeline-side-panel/timeline-side-panel';
import {getItemLeftOffset} from './position-utils';
import {timelineScrollContainerRef} from './restore-scroll-after-zoom';
import {useTimelinePosition} from './use-timeline-position';

export const useFollowPlayheadWhilePlaying = ({
	playerRef,
	timelineWidth,
	visibleFrames,
}: {
	playerRef: React.RefObject<PlayerRef | null>;
	timelineWidth: number | null;
	visibleFrames: number;
}) => {
	const timelinePosition = useTimelinePosition({playerRef});
	const isScrollingRef = useRef(false);
	const isPlaying = useIsPlaying(playerRef);

	useEffect(() => {
		if (!isPlaying) {
			return;
		}

		if (isScrollingRef.current) {
			return;
		}

		const scrollContainer = timelineScrollContainerRef.current;
		if (!scrollContainer) {
			throw new Error('Scroll container not found');
		}

		if (timelineWidth === null) {
			return;
		}

		// timeline에서 playhead의 절대 위치를 계산
		const playheadLeft =
			getItemLeftOffset({
				from: timelinePosition,
				totalDurationInFrames: visibleFrames,
				timelineWidth,
			}) + TIMELINE_HORIZONTAL_PADDING;

		// scroll container의 크기와 위치를 가져옴
		const containerScrollLeft = scrollContainer.scrollLeft;
		const containerWidth = scrollContainer.clientWidth;

		// 가시 영역에 상대적인 playhead 위치를 계산
		const playheadRelativeToViewport =
			playheadLeft - containerScrollLeft + SIDE_PANEL_WIDTH;

		// playhead가 오른쪽 가장자리에서 followThreshold pixel 내에 있는지 확인
		if (playheadRelativeToViewport > containerWidth - SCROLL_EDGE_THRESHOLD) {
			const targetScrollLeft = playheadLeft - containerWidth / 2;
			const maxScrollLeft = scrollContainer.scrollWidth - containerWidth;
			const clampedScrollLeft = Math.max(
				0,
				Math.min(maxScrollLeft, targetScrollLeft),
			);

			if (clampedScrollLeft !== containerScrollLeft) {
				isScrollingRef.current = true;
				scrollContainer.scrollTo({
					left: clampedScrollLeft,
					behavior: 'smooth',
				});

				// animation 완료 후 scrolling flag를 재설정
				setTimeout(() => {
					isScrollingRef.current = false;
				}, 300);
			}
		}
	}, [timelinePosition, timelineWidth, visibleFrames, isPlaying]);
};
