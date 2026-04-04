import {memo, useMemo} from 'react';
import {EditorStarterItem} from '../../items/item-type';
import {
	getItemLeftOffset,
	getItemRoundedPosition,
	getItemWidth,
} from '../../utils/position-utils';
import {TimelineItemContent} from './timeline-item-content';
import {TimelineItemPreviewContainer} from './timeline-item-preview-container';

interface TimelineItemDragOverlayProps {
	item: EditorStarterItem;
	timelineWidth: number;
	visibleFrames: number;
	height: number;
	trackMuted: boolean;
}

// 별도의 overlay가 필요한 이유는
// 대부분의 경우 preview만을 위해 모든 event listener를 바인딩하고 싶지 않기 때문
// 이것은 "presentational" component임
const TimelineItemDragOverlay = memo(
	({
		item,
		timelineWidth,
		visibleFrames,
		height,
		trackMuted,
	}: TimelineItemDragOverlayProps) => {
		const itemLeft = getItemLeftOffset({
			timelineWidth,
			totalDurationInFrames: visibleFrames,
			from: item.from,
		});

		const timelineItemWidth = getItemWidth({
			itemDurationInFrames: item.durationInFrames,
			timelineWidth,
			totalDurationInFrames: visibleFrames,
		});

		const {width, roundedDifference} = getItemRoundedPosition(
			itemLeft,
			timelineItemWidth,
		);

		const style = useMemo(() => {
			return {
				width,
				height,
			};
		}, [width, height]);

		return (
			<TimelineItemPreviewContainer isSelected style={style}>
				<TimelineItemContent
					item={item}
					height={height}
					width={width}
					roundedDifference={roundedDifference}
					trackMuted={trackMuted}
				/>
			</TimelineItemPreviewContainer>
		);
	},
);

TimelineItemDragOverlay.displayName = 'TimelineItemDragOverlay';

export {TimelineItemDragOverlay};
