import React, {useEffect, useSyncExternalStore} from 'react';
import {FEATURE_CACHE_ASSETS_LOCALLY} from '../flags';
import {useAssets} from '../utils/use-context';
import {getKeysCache, onKeysChanged} from './indexeddb';
import {loadToBlobUrlOnce} from './load-to-blob-url';

const onServer = () => null;

export const UseLocalCachedAssets: React.FC = () => {
	const keys = useSyncExternalStore(onKeysChanged, getKeysCache, onServer);
	const {assets} = useAssets();

	useEffect(() => {
		if (!keys) {
			// IDB가 아직 로드되지 않음
			return;
		}

		if (!FEATURE_CACHE_ASSETS_LOCALLY) {
			return;
		}

		for (const assetId of Object.keys(assets)) {
			const isDownloaded = keys.includes(assetId);
			if (isDownloaded) {
				loadToBlobUrlOnce(assets[assetId]);
			}
		}
	}, [assets, keys]);

	return null;
};
