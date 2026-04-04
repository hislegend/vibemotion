import React, {createContext, useMemo} from 'react';
import {interpolate} from 'remotion';
import {MAX_TIMELINE_WIDTH} from '../constants';
import {getVisibleFrames} from '../utils/get-visible-frames';
import {useFps, useTimelineContext} from '../utils/use-context';
import {useTimelineZoom} from './utils/use-timeline-zoom';

interface TimelineSizeState {
	timelineWidth: number | null;
	containerWidth: number | null;
	maxZoom: number;
	zoomStep: number;
}

export const TimelineSizeContext = createContext<TimelineSizeState>({
	timelineWidth: null,
	containerWidth: null,
	maxZoom: 1,
	zoomStep: 0.1,
});

type TimelineSizeProviderProps = {
	children: React.ReactNode;
	containerWidth: number | null;
};

// timeline width를 MAX_TIMELINE_WIDTH 아래로 유지하는 최대 안전 zoom multiplier 계산
const getMaxSafeZoomMultiplier = ({
	containerWidth,
	durationInFrames,
	fps,
}: {
	containerWidth: number;
	durationInFrames: number;
	fps: number;
}) => {
	const maxMultiplierFromWidth = MAX_TIMELINE_WIDTH / containerWidth;

	const originalMaxMultiplier = Math.max(
		4,
		interpolate(durationInFrames, [0, 60 * fps], [1, 6]),
	);

	// width 제약과 원래 로직을 모두 준수하기 위해 둘 중 작은 값 사용
	return Math.min(maxMultiplierFromWidth, originalMaxMultiplier);
};

export const getZoomMultiplier = ({
	durationInFrames,
	fps,
	zoom,
	containerWidth,
}: {
	durationInFrames: number;
	fps: number;
	zoom: number;
	containerWidth: number;
}) => {
	const maxMultiplier = getMaxSafeZoomMultiplier({
		containerWidth,
		durationInFrames,
		fps,
	});

	return interpolate(zoom, [0, 1], [1, maxMultiplier]);
};

const BASE_ZOOM_STEP = 0.1;
const ZOOM_STEP_THRESHOLD_SECONDS = 300; // 이 임계값보다 긴 timeline content는 점진적으로 작은 zoom step을 얻음

// content 지속 시간을 기반으로 동적 zoom step 계산 - 긴 content일수록 작은 step
const getDynamicZoomStep = ({
	durationInFrames,
	fps,
	containerWidth,
}: {
	durationInFrames: number;
	fps: number;
	containerWidth: number;
}) => {
	const visibleFrames = getVisibleFrames({
		fps,
		totalDurationInFrames: durationInFrames,
	});
	const maxMultiplier = getMaxSafeZoomMultiplier({
		containerWidth,
		durationInFrames,
		fps,
	});

	// 긴 content이거나 max multiplier가 작을 때 작은 step 사용
	// 이는 timeline width의 큰 점프를 방지함
	const thresholdInFrames = ZOOM_STEP_THRESHOLD_SECONDS * fps;
	const durationFactor = Math.min(1, thresholdInFrames / visibleFrames); // content > threshold일 때 작아짐
	const multiplierFactor = Math.min(1, maxMultiplier / 4); // max multiplier가 낮을 때 작아짐

	return Math.max(0.01, BASE_ZOOM_STEP * durationFactor * multiplierFactor);
};

// 제약 조건에 따른 효과적인 최대 zoom 값(0-1 범위) 계산
const getDynamicMaxZoom = ({
	containerWidth,
	durationInFrames,
	fps,
}: {
	containerWidth: number;
	durationInFrames: number;
	fps: number;
}) => {
	const maxMultiplier = getMaxSafeZoomMultiplier({
		containerWidth,
		durationInFrames,
		fps,
	});

	// zoom 범위는 [0, 1]이고 multiplier 범위는 [1, maxMultiplier]이므로,
	// maxMultiplier가 원래 최댓값(6)보다 작으면 max zoom을 축소해야 함
	const originalMaxMultiplier = Math.max(
		4,
		interpolate(durationInFrames, [0, 60 * fps], [1, 6]),
	);

	if (maxMultiplier < originalMaxMultiplier) {
		return maxMultiplier / originalMaxMultiplier;
	}

	return 1; // fallback: 전체 zoom 범위 사용 가능
};

const calculateTimelineWidth = ({
	timelineContainerWidth,
	zoom,
	durationInFrames,
	fps,
}: {
	timelineContainerWidth: number;
	zoom: number;
	durationInFrames: number;
	fps: number;
}) => {
	return (
		timelineContainerWidth *
		getZoomMultiplier({
			durationInFrames,
			fps,
			zoom,
			containerWidth: timelineContainerWidth,
		})
	);
};

export const TimelineSizeProvider = ({
	children,
	containerWidth,
}: TimelineSizeProviderProps) => {
	const {zoom} = useTimelineZoom();
	const {durationInFrames} = useTimelineContext();
	const {fps} = useFps();

	const value = useMemo(() => {
		if (containerWidth === null) {
			return {
				timelineWidth: null,
				containerWidth: null,
				maxZoom: 1,
				zoomStep: 0.1,
			};
		}

		const timelineWidth = calculateTimelineWidth({
			timelineContainerWidth: containerWidth,
			zoom,
			durationInFrames,
			fps,
		});

		const maxZoom = getDynamicMaxZoom({
			containerWidth,
			durationInFrames,
			fps,
		});

		const zoomStep = getDynamicZoomStep({
			durationInFrames,
			fps,
			containerWidth,
		});

		return {
			timelineWidth,
			containerWidth,
			maxZoom,
			zoomStep,
		};
	}, [containerWidth, zoom, durationInFrames, fps]);

	return (
		<TimelineSizeContext.Provider value={value}>
			{children}
		</TimelineSizeContext.Provider>
	);
};
