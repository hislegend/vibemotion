import {TIMELINE_HORIZONTAL_PADDING} from '../../constants';

export const calculateFrame = ({
	container,
	xCoordinate,
	totalDurationInFrames,
	timelineWidth,
}: {
	container: HTMLDivElement;
	xCoordinate: number;
	totalDurationInFrames: number;
	timelineWidth: number;
}) => {
	const containerRect = container.getBoundingClientRect();
	if (!containerRect) {
		throw new Error('boundingRect is null');
	}

	const pixelsPerFrame = timelineWidth / totalDurationInFrames;

	// scroll과 예약된 공간을 고려하여 실제 click position 계산
	const scrollX = container.scrollLeft;
	const clickPositionX =
		xCoordinate - containerRect.x + scrollX - TIMELINE_HORIZONTAL_PADDING;

	// pixels per frame을 사용하여 click position을 frame 번호로 변환
	const frame = clickPositionX / pixelsPerFrame;

	const normalizedFrame = Math.max(
		0,
		Math.min(Math.round(frame), totalDurationInFrames - 1),
	);

	// frame이 유효한 범위 내에 있는지 확인
	return normalizedFrame;
};
