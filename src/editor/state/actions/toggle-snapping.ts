import {EditorState} from '../types';

export const setSnappingEnabled = (
	state: EditorState,
	enabled: boolean,
): EditorState => {
	if (state.isSnappingEnabled === enabled) {
		return state;
	}
	return {
		...state,
		isSnappingEnabled: enabled,
		// 비활성화할 때 오래된 indicator를 피하기 위해 활성 snap point를 지움
		activeSnapPoint: enabled ? state.activeSnapPoint : null,
	};
};

export const toggleSnapping = (state: EditorState): EditorState => {
	return setSnappingEnabled(state, !state.isSnappingEnabled);
};
