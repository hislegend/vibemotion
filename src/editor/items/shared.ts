export type BaseItem = {
	id: string;
	durationInFrames: number;
	from: number;
	top: number;
	left: number;
	width: number;
	height: number;
	opacity: number;
	isDraggingInTimeline: boolean;
};

export type CanHaveBorderRadius = BaseItem & {
	borderRadius: number;
};

export type CanHaveRotation = BaseItem & {
	rotation: number;
};

// 크롭 가능한 아이템 (4방향 비율 방식)
export type CanHaveCrop = {
	cropLeft?: number;   // 0~1 (왼쪽에서 잘라낼 비율)
	cropTop?: number;    // 0~1 (위에서 잘라낼 비율)
	cropRight?: number;  // 0~1 (오른쪽에서 잘라낼 비율)
	cropBottom?: number; // 0~1 (아래에서 잘라낼 비율)
};
