const SNAP_THRESHOLD = 10; // 스냅 임계값 (픽셀)

export interface CenterSnapResult {
	snappedLeft: number;
	snappedTop: number;
	isHorizontallyCentered: boolean; // 좌우 중앙 정렬됨 (세로선 표시)
	isVerticallyCentered: boolean; // 상하 중앙 정렬됨 (가로선 표시)
}

export const calculateCenterSnap = ({
	itemLeft,
	itemTop,
	itemWidth,
	itemHeight,
	compositionWidth,
	compositionHeight,
	threshold = SNAP_THRESHOLD,
}: {
	itemLeft: number;
	itemTop: number;
	itemWidth: number;
	itemHeight: number;
	compositionWidth: number;
	compositionHeight: number;
	threshold?: number;
}): CenterSnapResult => {
	// 아이템 중앙 좌표
	const itemCenterX = itemLeft + itemWidth / 2;
	const itemCenterY = itemTop + itemHeight / 2;

	// 컴포지션 중앙 좌표
	const compositionCenterX = compositionWidth / 2;
	const compositionCenterY = compositionHeight / 2;

	// 중앙과의 거리 계산
	const distanceX = Math.abs(itemCenterX - compositionCenterX);
	const distanceY = Math.abs(itemCenterY - compositionCenterY);

	// 스냅 여부 결정
	const isHorizontallyCentered = distanceX <= threshold;
	const isVerticallyCentered = distanceY <= threshold;

	// 스냅된 좌표 계산
	const snappedLeft = isHorizontallyCentered
		? compositionCenterX - itemWidth / 2
		: itemLeft;
	const snappedTop = isVerticallyCentered
		? compositionCenterY - itemHeight / 2
		: itemTop;

	return {
		snappedLeft,
		snappedTop,
		isHorizontallyCentered,
		isVerticallyCentered,
	};
};
