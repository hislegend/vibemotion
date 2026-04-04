import {getObject} from '../caching/indexeddb';
import {SetState} from '../context-provider';
import {performAssetUpload} from '../utils/asset-upload-utils';
import {getUploadUrls} from '../utils/use-uploader';
import {EditorStarterAsset} from './assets';

export const retryAssetUpload = async ({
	asset,
	setState,
}: {
	asset: EditorStarterAsset;
	setState: SetState;
}) => {
	// IndexedDB에서 캐시된 파일 검색
	const file = await getObject({key: asset.id});
	if (!file) {
		throw new Error('Cached file not found');
	}

	// 먼저 상태를 pending으로 설정
	setState({
		update: (state) => {
			return {
				...state,
				assetStatus: {
					...state.assetStatus,
					[asset.id]: {
						type: 'pending-upload',
					},
				},
			};
		},
		commitToUndoStack: false,
	});

	// upload URL 가져오기 시도
	const presignResultPromise = getUploadUrls(file);

	await performAssetUpload({setState, asset, presignResultPromise, file});
};
