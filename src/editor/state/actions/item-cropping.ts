import {EditorState} from '../types';
import {changeItem} from './change-item';
import {getCanCrop, CroppableItem} from '../../utils/get-crop-from-item';

/**
 * 크롭 모드로 진입 - 특정 아이템을 크롭 편집 대상으로 선택
 */
export const selectItemForCrop = ({
	state,
	itemId,
}: {
	state: EditorState;
	itemId: string;
}): EditorState => {
	return {
		...state,
		itemSelectedForCrop: itemId,
	};
};

/**
 * 크롭 값이 음수인 경우 0으로 리셋
 */
export const resetItemCropToNonNegative = (state: EditorState): EditorState => {
	const itemId = state.itemSelectedForCrop;
	if (!itemId) {
		return state;
	}

	const item = state.undoableState.items[itemId];
	if (!item || !getCanCrop(item)) {
		return state;
	}

	const croppableItem = item as CroppableItem;

	return changeItem(state, itemId, (i) => {
		const updated = {...i} as CroppableItem;
		updated.cropLeft = Math.max(0, croppableItem.cropLeft ?? 0);
		updated.cropTop = Math.max(0, croppableItem.cropTop ?? 0);
		updated.cropRight = Math.max(0, croppableItem.cropRight ?? 0);
		updated.cropBottom = Math.max(0, croppableItem.cropBottom ?? 0);
		return updated;
	});
};

/**
 * 크롭 모드 종료 - 크롭 값을 정규화하고 선택 해제
 */
export const unselectItemForCrop = (state: EditorState): EditorState => {
	const normalizedState = resetItemCropToNonNegative(state);
	return {
		...normalizedState,
		itemSelectedForCrop: null,
	};
};

/**
 * 크롭 값 업데이트 함수들
 */
export const updateCropLeft = ({
	state,
	itemId,
	cropLeft,
}: {
	state: EditorState;
	itemId: string;
	cropLeft: number;
}): EditorState => {
	const item = state.undoableState.items[itemId];
	if (!item || !getCanCrop(item)) {
		return state;
	}

	return changeItem(state, itemId, (i) => {
		const updated = {...i} as CroppableItem;
		updated.cropLeft = cropLeft;
		return updated;
	});
};

export const updateCropTop = ({
	state,
	itemId,
	cropTop,
}: {
	state: EditorState;
	itemId: string;
	cropTop: number;
}): EditorState => {
	const item = state.undoableState.items[itemId];
	if (!item || !getCanCrop(item)) {
		return state;
	}

	return changeItem(state, itemId, (i) => {
		const updated = {...i} as CroppableItem;
		updated.cropTop = cropTop;
		return updated;
	});
};

export const updateCropRight = ({
	state,
	itemId,
	cropRight,
}: {
	state: EditorState;
	itemId: string;
	cropRight: number;
}): EditorState => {
	const item = state.undoableState.items[itemId];
	if (!item || !getCanCrop(item)) {
		return state;
	}

	return changeItem(state, itemId, (i) => {
		const updated = {...i} as CroppableItem;
		updated.cropRight = cropRight;
		return updated;
	});
};

export const updateCropBottom = ({
	state,
	itemId,
	cropBottom,
}: {
	state: EditorState;
	itemId: string;
	cropBottom: number;
}): EditorState => {
	const item = state.undoableState.items[itemId];
	if (!item || !getCanCrop(item)) {
		return state;
	}

	return changeItem(state, itemId, (i) => {
		const updated = {...i} as CroppableItem;
		updated.cropBottom = cropBottom;
		return updated;
	});
};

/**
 * 모든 크롭 값을 한번에 업데이트
 */
export const updateAllCropValues = ({
	state,
	itemId,
	cropLeft,
	cropTop,
	cropRight,
	cropBottom,
}: {
	state: EditorState;
	itemId: string;
	cropLeft: number;
	cropTop: number;
	cropRight: number;
	cropBottom: number;
}): EditorState => {
	const item = state.undoableState.items[itemId];
	if (!item || !getCanCrop(item)) {
		return state;
	}

	return changeItem(state, itemId, (i) => {
		const updated = {...i} as CroppableItem;
		updated.cropLeft = cropLeft;
		updated.cropTop = cropTop;
		updated.cropRight = cropRight;
		updated.cropBottom = cropBottom;
		return updated;
	});
};

/**
 * 크롭 리셋 (모든 값을 0으로)
 */
export const resetCrop = ({
	state,
	itemId,
}: {
	state: EditorState;
	itemId: string;
}): EditorState => {
	const item = state.undoableState.items[itemId];
	if (!item || !getCanCrop(item)) {
		return state;
	}

	return changeItem(state, itemId, (i) => {
		const updated = {...i} as CroppableItem;
		updated.cropLeft = 0;
		updated.cropTop = 0;
		updated.cropRight = 0;
		updated.cropBottom = 0;
		return updated;
	});
};
