import {EditorState} from '../types';

// 삭제된 asset이 정리되었을 때 이 state 업데이트를 수행합니다.
// https://remotion.dev/docs/editor-starter/asset-cleanup
export const clearDeletedAsset = ({
	state,
	assetId,
}: {
	state: EditorState;
	assetId: string;
}) => {
	const newDeletedAssets = state.undoableState.deletedAssets.filter(
		(asset) => asset.assetId !== assetId,
	);

	if (newDeletedAssets.length === state.undoableState.deletedAssets.length) {
		return state;
	}

	const newState = {
		...state,
		undoableState: {
			...state.undoableState,
			deletedAssets: newDeletedAssets,
		},
	};

	return newState;
};
