import {MarqueeSelection} from '../../marquee-selection';

export function isItemInMarquee({
	marquee,
	itemX,
	itemY,
	itemEndX,
	itemEndY,
}: {
	marquee: MarqueeSelection;
	itemX: number;
	itemY: number;
	itemEndX: number;
	itemEndY: number;
}): boolean {
	// marquee 좌표를 정규화
	const marqueeLeft = Math.min(marquee.start.x, marquee.end.x);
	const marqueeRight = Math.max(marquee.start.x, marquee.end.x);
	const marqueeTop = Math.min(marquee.start.y, marquee.end.y);
	const marqueeBottom = Math.max(marquee.start.y, marquee.end.y);

	// item 좌표를 정규화
	const itemLeft = Math.min(itemX, itemEndX);
	const itemRight = Math.max(itemX, itemEndX);
	const itemTop = Math.min(itemY, itemEndY);
	const itemBottom = Math.max(itemY, itemEndY);

	// 교차점 확인
	const isIntersecting =
		marqueeLeft <= itemRight &&
		marqueeRight >= itemLeft &&
		marqueeTop <= itemBottom &&
		marqueeBottom >= itemTop;

	return isIntersecting;
}
