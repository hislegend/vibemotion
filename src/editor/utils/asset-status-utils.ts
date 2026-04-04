import {AssetState, EditorStarterAsset} from '../assets/assets';
import {getKeys} from '../caching/indexeddb';
import {EditorState, UndoableState} from '../state/types';
import {checkFileExists} from '../utils/assets';

export type AssetWithStatus = EditorStarterAsset & {
	status: AssetState;
};

/**
 * asset의 status가 병합된 asset을 가져오기
 */
export const getAssetWithStatus = (
	state: EditorState,
	assetId: string,
): AssetWithStatus | null => {
	const asset = state.undoableState.assets[assetId];
	const status = state.assetStatus[assetId];

	if (!asset || !status) {
		return null;
	}

	return {
		...asset,
		status,
	};
};

/**
 * 모든 asset의 status가 병합된 asset들을 가져오기
 */
export const getAllAssetsWithStatus = (
	state: EditorState,
): Record<string, AssetWithStatus> => {
	const result: Record<string, AssetWithStatus> = {};

	for (const [assetId, asset] of Object.entries(state.undoableState.assets)) {
		const status = state.assetStatus[assetId];
		if (status) {
			result[assetId] = {
				...asset,
				status,
			};
		}
	}

	return result;
};

/**
 * asset의 status를 가져오기
 */
export const getAssetStatus = (
	state: EditorState,
	assetId: string,
): AssetState | null => {
	return state.assetStatus[assetId] || null;
};

export const createAssetStatusFromUndoableState = async (
	state: UndoableState,
): Promise<Record<string, AssetState>> => {
	const result: Record<string, AssetState> = {};

	// IndexedDB에 존재하는 모든 asset들을 가져오기
	let indexedDBKeys: IDBValidKey[] = [];
	try {
		indexedDBKeys = await getKeys();
	} catch {
		// IndexedDB가 사용 불가능한 경우, local storage 검사 없이 계속
		// remoteUrl이 없는 asset들은 error로 표시됨
	}

	for (const [assetId, asset] of Object.entries(state.assets)) {
		if (asset.remoteUrl) {
			const checkIfFileExists = await checkFileExists(asset.remoteUrl);
			if (checkIfFileExists) {
				result[assetId] = {
					type: 'uploaded',
				};
			}
		} else if (asset.type === 'caption') {
			result[assetId] = {
				type: 'uploaded',
			};
		} else {
			// asset이 remote URL을 가지지 않음 - IndexedDB에 존재하는지 확인
			const existsInIndexedDB = indexedDBKeys.includes(assetId);

			if (existsInIndexedDB) {
				result[assetId] = {
					type: 'error',
					error: new Error('No credentials to upload'),
					canRetry: true,
				};
			} else {
				// asset이 local 또는 remote에 존재하지 않음
				result[assetId] = {
					type: 'error',
					error: new Error('Asset not found'),
					canRetry: false,
				};
			}
		}
	}

	return result;
};

export const hasAssetsWithErrors = (
	assetStatus: Record<string, AssetState>,
): boolean => {
	return Object.values(assetStatus).some((status) => status.type === 'error');
};
