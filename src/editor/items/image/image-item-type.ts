import {BaseItem, CanHaveBorderRadius, CanHaveCrop, CanHaveRotation} from '../shared';

export type KenBurnsEffect = 'none' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';

// 크롭 영역 (영역 선택 방식 - 하위 호환성)
export type CropArea = {
	x: number;      // 0~1 (왼쪽 비율)
	y: number;      // 0~1 (위쪽 비율)
	width: number;  // 0~1 (너비 비율)
	height: number; // 0~1 (높이 비율)
};

export type ImageItem = BaseItem &
	CanHaveBorderRadius &
	CanHaveRotation &
	CanHaveCrop & {
		type: 'image';
		assetId: string;
		keepAspectRatio: boolean;
		fadeInDurationInSeconds: number;
		fadeOutDurationInSeconds: number;
		kenBurnsEffect?: KenBurnsEffect;
		kenBurnsIntensity?: number; // 0.1 ~ 0.3 (10% ~ 30%)
		// 크롭 영역 (legacy - 하위 호환성)
		cropArea?: CropArea;
		// legacy fields (deprecated, 하위 호환성)
		cropZoom?: number;
		cropOffsetX?: number;
		cropOffsetY?: number;
		// 시작/종료 이미지 기반 영상 생성용
		endImageUrl?: string;
	};
