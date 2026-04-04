import {getRemotionEnvironment} from 'remotion';
import {EditorStarterAsset} from '../assets/assets';
import {useRequireLocalUrl} from '../utils/find-asset-by-id';

// preview에서는 remote asset을 한 번만 로드하고 cache하여 모든 작업을 로컬에서 수행
// (waveform, thumbnail, preview)
// 단, localUrl이 없어도 remoteUrl이 있으면 렌더링을 허용 (폴백)
export const RequireCachedAsset = ({
	asset,
	children,
}: {
	asset: EditorStarterAsset;
	children: React.ReactNode;
}) => {
	if (getRemotionEnvironment().isRendering) {
		return children;
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const localUrl = useRequireLocalUrl(asset);

	// localUrl이 있으면 캐시된 상태, 없어도 remoteUrl이 있으면 폴백으로 렌더 허용
	const hasValidSource = localUrl || asset.remoteUrl;

	if (!hasValidSource) {
		return null;
	}

	return children;
};
