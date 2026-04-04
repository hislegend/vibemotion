import {EditorStarterItem} from '../items/item-type';
import {getCropFromItem} from './get-crop-from-item';

export type Rect = {
	left: number;
	top: number;
	width: number;
	height: number;
};

/**
 * 크롭 적용 후의 보이는 영역을 계산합니다.
 * 크롭되지 않은 아이템은 원본 rect를 반환합니다.
 */
export const getRectAfterCrop = (item: EditorStarterItem): Rect => {
	const crop = getCropFromItem(item);

	if (!crop) {
		return {
			left: item.left,
			top: item.top,
			width: item.width,
			height: item.height,
		};
	}

	// 크롭 비율을 적용하여 보이는 영역 계산
	const cropLeftPx = crop.cropLeft * item.width;
	const cropTopPx = crop.cropTop * item.height;
	const cropRightPx = crop.cropRight * item.width;
	const cropBottomPx = crop.cropBottom * item.height;

	return {
		left: item.left + cropLeftPx,
		top: item.top + cropTopPx,
		width: item.width - cropLeftPx - cropRightPx,
		height: item.height - cropTopPx - cropBottomPx,
	};
};

/**
 * 크롭된 영역의 원본 대비 스케일을 계산합니다.
 * 내보내기 시 Shotstack offset 계산에 사용됩니다.
 */
export const getCropScale = (item: EditorStarterItem): {scaleX: number; scaleY: number} => {
	const crop = getCropFromItem(item);
	
	if (!crop) {
		return {scaleX: 1, scaleY: 1};
	}

	const visibleWidth = 1 - crop.cropLeft - crop.cropRight;
	const visibleHeight = 1 - crop.cropTop - crop.cropBottom;

	return {
		scaleX: visibleWidth,
		scaleY: visibleHeight,
	};
};
