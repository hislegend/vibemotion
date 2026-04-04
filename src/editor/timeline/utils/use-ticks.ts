import {useMemo} from 'react';
import {renderFrame} from '../../utils/render-frame';
import {useFps} from '../../utils/use-context';

export type TimelineTickMark = {
	width: number;
	label: string;
};

// 다양한 zoom level에서 표시하고자 하는 기본 간격들 (초 단위)
const BASE_INTERVALS = [
	0.01, 0.025, 0.05, 0.1, 0.5, 1, 5, 10, 30, 60, 300,
] as const;

// zoom level 1에서 timeline 전체에 걸쳐 보고 싶은 시간 구분의 수
// 예시: DESIRED_TIMELINE_DIVISIONS = 20이고 video가 60초인 경우:
// - zoom=1일 때: 3초마다 tick 표시 (60/20)
// - zoom=2일 때: 1.5초마다 tick 표시 (60/(20*2))
// - zoom=4일 때: 0.75초마다 tick 표시 (60/(20*4))
const DESIRED_TIMELINE_DIVISIONS = 15;

const findBestTimeInterval = ({
	totalDurationInFrames,
	fps,
	timelineWidth,
	containerWidth,
}: {
	totalDurationInFrames: number;
	fps: number;
	timelineWidth: number;
	containerWidth: number;
}) => {
	const durationInSeconds = totalDurationInFrames / fps;
	// 실제 timeline width로부터 유효한 zoom multiplier를 계산
	const effectiveZoomMultiplier = timelineWidth / containerWidth;
	const baseInterval =
		durationInSeconds / (DESIRED_TIMELINE_DIVISIONS * effectiveZoomMultiplier);

	const interval =
		BASE_INTERVALS.find((int) => int >= baseInterval) ??
		BASE_INTERVALS[BASE_INTERVALS.length - 1];

	return interval;
};

const formatTimecode = (frame: number, fps: number, interval: number) => {
	const totalSeconds = frame / fps;
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = Math.floor(totalSeconds % 60);

	// 형식: HH:MM:SS (시간 포함) 또는 MM:SS
	if (hours > 0) {
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	const base = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

	// 작은 간격(≤ 0.1초)에 대해 frame 표시
	if (interval <= 0.1) {
		return renderFrame(frame, fps);
	}

	// 0.5초 간격에 대해 frame 표시 (legacy 동작)
	if (interval === 0.5) {
		return renderFrame(frame, fps);
	}

	return base;
};

export const useTicks = ({
	visibleFrames,
	timelineWidth,
	containerWidth,
}: {
	visibleFrames: number;
	timelineWidth: number;
	containerWidth: number;
}) => {
	const {fps} = useFps();

	if (timelineWidth === null) {
		throw new Error('Timeline width is null');
	}

	const tickMarks = useMemo(() => {
		const interval = findBestTimeInterval({
			totalDurationInFrames: visibleFrames,
			fps,
			timelineWidth,
			containerWidth,
		});

		const marks: TimelineTickMark[] = [];
		const pxPerSecond = timelineWidth / (visibleFrames / fps);
		const pixelsBetweenTicks = interval * pxPerSecond;

		for (
			let xPosition = 0;
			xPosition <= timelineWidth;
			xPosition += pixelsBetweenTicks
		) {
			const seconds = xPosition / pxPerSecond;
			const frame = Math.round(seconds * fps);
			marks.push({
				width: pixelsBetweenTicks,
				label: formatTimecode(frame, fps, interval),
			});
		}
		return marks;
	}, [fps, timelineWidth, visibleFrames, containerWidth]);

	return {tickMarks, timelineWidth};
};
