import {EditorStarterItem} from '../items/item-type';
import {CanHaveCrop} from '../items/shared';

// Map of item types that can be cropped
const canCropMap = {
	video: true,
	image: true,
	gif: true,
	text: false,
	solid: false,
	captions: false,
	audio: false,
} satisfies Record<EditorStarterItem['type'], boolean>;

export type CroppableItem = {
	[K in keyof typeof canCropMap]: (typeof canCropMap)[K] extends true
		? Extract<EditorStarterItem, {type: K}>
		: never;
}[keyof typeof canCropMap];

export const getCanCrop = (item: EditorStarterItem): item is CroppableItem => {
	return canCropMap[item.type];
};

export const getCropFromItem = (
	item: EditorStarterItem,
): CanHaveCrop | null => {
	if (!getCanCrop(item)) {
		return null;
	}

	const cropItem = item as CroppableItem;
	const cropLeft = cropItem.cropLeft ?? 0;
	const cropTop = cropItem.cropTop ?? 0;
	const cropRight = cropItem.cropRight ?? 0;
	const cropBottom = cropItem.cropBottom ?? 0;

	return {
		cropLeft,
		cropTop,
		// Total crop per direction must leave at least 1px of the original item visible
		cropRight: Math.min(cropRight, 1 - cropLeft - 1 / item.width),
		cropBottom: Math.min(cropBottom, 1 - cropTop - 1 / item.height),
	};
};

// 크롭이 적용되어 있는지 확인
export const hasCrop = (item: EditorStarterItem): boolean => {
	if (!getCanCrop(item)) {
		return false;
	}
	
	const cropItem = item as CroppableItem;
	return Boolean(
		cropItem.cropLeft ||
		cropItem.cropTop ||
		cropItem.cropRight ||
		cropItem.cropBottom
	);
};
