import React, {useMemo} from 'react';
import {TIMELINE_HORIZONTAL_PADDING} from '../../constants';
import {getItemLeftOffset} from '../../utils/position-utils';
import {Z_INDEX_PLAYHEAD} from '../../z-indices';
import {TICKS_HEIGHT} from '../ticks/constants';

export const SkimmingLine: React.FC<{
	frame: number;
	visibleFrames: number;
	height: number;
	timelineWidth: number;
}> = ({frame, visibleFrames, height, timelineWidth}) => {
	const left =
		getItemLeftOffset({
			from: frame,
			totalDurationInFrames: visibleFrames,
			timelineWidth,
		}) + TIMELINE_HORIZONTAL_PADDING;

	const style = useMemo<React.CSSProperties>(
		() => ({
			left,
			top: TICKS_HEIGHT,
			height: Math.max(height, 0),
			zIndex: Z_INDEX_PLAYHEAD - 1, // Playhead보다 뒤에
		}),
		[left, height],
	);

	return (
		<div
			className="pointer-events-none absolute w-[2px] bg-yellow-400"
			style={style}
		/>
	);
};
