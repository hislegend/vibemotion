import {useSyncExternalStore} from 'react';
import {AssetState, EditorStarterAsset} from '../assets/assets';
import {checkFileExists} from '../utils/assets';
import {cacheAssetLocally, deleteCachedAsset, getObject} from './indexeddb';

const opens: Record<string, Promise<string | null>> = {};
let localUrls: Record<string, string> = {};
let downloadProgress: Record<string, number | null> = {};

let subscribeToChangeCallbacks: (() => void)[] = [];
let subscribeToDownloadProgressCallbacks: (() => void)[] = [];

const lastCheckIfAssetUrlIsStillValid: Record<string, number> = {};
const pendingCheckIfAssetUrlIsStillValid: Record<
	string,
	Promise<void> | undefined
> = {};

const isBlobUrlStillValid = async (url: string) => {
	try {
		const res = await fetch(url);
		return res.ok;
	} catch {
		return false;
	}
};

const reloadBlobUrl = async (localUrl: string, asset: EditorStarterAsset) => {
	delete localUrls[asset.id];
	subscribeToChangeCallbacks.forEach((fn) => fn());
	URL.revokeObjectURL(localUrl);
	await loadToBlobUrlOnce(asset);
};

const checkIfLocalUrlIsStillValid = async (
	localUrl: string,
	asset: EditorStarterAsset,
) => {
	if (!(await isBlobUrlStillValid(localUrl))) {
		await reloadBlobUrl(localUrl, asset);
	}
};

// browser들은 시간이 지나면 blob URL을 제거하므로, 주기적으로 유효성을 확인해야 함
// https://github.com/remotion-dev/editor-starter/issues/398
export const periodicallyCheckIfLocalUrlIsStillValid = async (
	localUrl: string,
	asset: EditorStarterAsset,
) => {
	if (pendingCheckIfAssetUrlIsStillValid[asset.id]) {
		return;
	}

	// 20초마다만 확인
	if (lastCheckIfAssetUrlIsStillValid[asset.id] + 20 * 1000 >= Date.now()) {
		return;
	}

	pendingCheckIfAssetUrlIsStillValid[asset.id] = checkIfLocalUrlIsStillValid(
		localUrl,
		asset,
	);

	await pendingCheckIfAssetUrlIsStillValid[asset.id];
	pendingCheckIfAssetUrlIsStillValid[asset.id] = undefined;
	lastCheckIfAssetUrlIsStillValid[asset.id] = Date.now();
};

const loadFromAssetToLocalUrl = async (asset: EditorStarterAsset) => {
	const blob = await getObject({key: asset.id});
	const url = URL.createObjectURL(blob);

	if (!(await isBlobUrlStillValid(url))) {
		await deleteCachedAsset({assetId: asset.id});
		URL.revokeObjectURL(url);
		return null;
	}

	localUrls = {...localUrls, [asset.id]: url};
	subscribeToChangeCallbacks.forEach((fn) => fn());
	return url;
};

export const setLocalUrl = (assetId: string, url: string) => {
	localUrls = {...localUrls, [assetId]: url};
	subscribeToChangeCallbacks.forEach((fn) => fn());
};

export const loadToBlobUrlOnce = (asset: EditorStarterAsset) => {
	if (opens[asset.id] !== undefined) {
		return opens[asset.id];
	}

	if (localUrls[asset.id]) {
		return Promise.resolve();
	}

	if (!asset.remoteUrl && asset.type === 'caption') {
		return Promise.resolve();
	}

	opens[asset.id] = loadFromAssetToLocalUrl(asset);
	return opens[asset.id];
};

const getLocalUrls = () => {
	return localUrls;
};

export const useLocalUrls = () => {
	return useSyncExternalStore(
		(cb) => {
			subscribeToChangeCallbacks.push(cb);

			return () => {
				subscribeToChangeCallbacks = subscribeToChangeCallbacks.filter(
					(fn) => fn !== cb,
				);
			};
		},
		getLocalUrls,
		getLocalUrls,
	);
};

export const useDownloadProgress = (assetId: string) => {
	return useSyncExternalStore(
		(cb) => {
			subscribeToDownloadProgressCallbacks.push(cb);

			return () => {
				subscribeToDownloadProgressCallbacks =
					subscribeToDownloadProgressCallbacks.filter((fn) => fn !== cb);
			};
		},
		() => downloadProgress[assetId],
	);
};

const downloadProgressesOnServer: Record<string, number | null> = {};

const getDownloadProgressesOnServer = () => {
	return downloadProgressesOnServer;
};

export const useDownloadProgresses = () => {
	return useSyncExternalStore(
		(cb) => {
			subscribeToDownloadProgressCallbacks.push(cb);

			return () => {
				subscribeToDownloadProgressCallbacks =
					subscribeToDownloadProgressCallbacks.filter((fn) => fn !== cb);
			};
		},
		() => downloadProgress,
		getDownloadProgressesOnServer,
	);
};

const downloads: Record<string, Promise<void>> = {};

const downloadToCache = async (
	asset: EditorStarterAsset,
	assetStatus: AssetState | null,
): Promise<void> => {
	if (!asset.remoteUrl) {
		throw new Error('Asset has no remote URL');
	}

	// 다운로드 시도 전에 upload가 완료되었는지 확인
	if (assetStatus && assetStatus.type !== 'uploaded') {
		throw new Error('Cannot download asset: upload not complete');
	}

	// status가 제공되지 않았다면, remote URL에 파일이 존재하는지 확인
	if (!assetStatus) {
		const fileExists = await checkFileExists(asset.remoteUrl);
		if (!fileExists) {
			throw new Error('Cannot download asset: file not found at remote URL');
		}
	}

	const response = await fetch(asset.remoteUrl);

	if (!response.body) {
		// body를 사용할 수 없는 경우 기존 방법으로 폴백 (이전 browser)
		const blob = await response.blob();
		await cacheAssetLocally({assetId: asset.id, value: blob});
		return;
	}

	const reader = response.body.getReader();
	let loadedBytes = 0;
	const chunks: Uint8Array[] = [];

	while (true) {
		const {done, value} = await reader.read();
		if (done) {
			break;
		}
		if (value) {
			chunks.push(value);
			loadedBytes += value.length;
			downloadProgress = {...downloadProgress, [asset.id]: loadedBytes};

			subscribeToDownloadProgressCallbacks.forEach((fn) => fn());
		}
	}

	const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
	const uint8Array = new Uint8Array(totalLength);
	let offset = 0;
	for (const chunk of chunks) {
		uint8Array.set(chunk, offset);
		offset += chunk.length;
	}

	await cacheAssetLocally({
		assetId: asset.id,
		value: new Blob([uint8Array], {type: asset.mimeType}),
	});
	subscribeToDownloadProgressCallbacks.forEach((fn) => fn());
};

export const downloadToCacheOnce = (
	asset: EditorStarterAsset,
	assetStatus: AssetState | null,
): Promise<void> => {
	if (localUrls[asset.id]) {
		return Promise.resolve();
	}

	if (!asset.remoteUrl && asset.type === 'caption') {
		return Promise.resolve();
	}

	if (downloads[asset.id] !== undefined) {
		return downloads[asset.id];
	}

	downloads[asset.id] = downloadToCache(asset, assetStatus);
	return downloads[asset.id];
};
