import {EditorStarterAsset} from '../assets/assets';
import {
	periodicallyCheckIfLocalUrlIsStillValid,
	useLocalUrls,
} from '../caching/load-to-blob-url';

export const findAssetById = (
	assets: Record<string, EditorStarterAsset>,
	id: string,
): EditorStarterAsset | undefined => {
	return assets[id];
};

export const usePreferredLocalUrl = (asset: EditorStarterAsset) => {
	const localUrls = useLocalUrls();

	// 사용 가능하면 항상 local URL을 선호
	if (localUrls[asset.id]) {
		// blob: URL일 때만 유효성 체크 (https URL은 체크하면 CORS 문제로 잘못된 리로드 발생)
		if (localUrls[asset.id].startsWith('blob:')) {
			periodicallyCheckIfLocalUrlIsStillValid(localUrls[asset.id], asset);
		}
		return localUrls[asset.id];
	}

	// upload가 완료된 경우에만 remote URL 사용
	if (asset.remoteUrl) {
		return asset.remoteUrl;
	}

	// local URL이 없고 upload가 완료되지 않은 경우 error 발생
	throw new Error(`Asset ${asset.id} has neither remote nor local URL`);
};

export const useRequireLocalUrl = (asset: EditorStarterAsset) => {
	const localUrls = useLocalUrls();

	// 사용 가능하면 항상 local URL을 선호
	if (localUrls[asset.id]) {
		// blob: URL일 때만 유효성 체크 (https URL은 체크하면 CORS 문제로 잘못된 리로드 발생)
		if (localUrls[asset.id].startsWith('blob:')) {
			periodicallyCheckIfLocalUrlIsStillValid(localUrls[asset.id], asset);
		}
		return localUrls[asset.id];
	}

	// localUrl이 없으면 remoteUrl을 폴백으로 반환
	if (asset.remoteUrl) {
		return asset.remoteUrl;
	}

	return null;
};
