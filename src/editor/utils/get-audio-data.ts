import {pLimit} from './p-limit';

const fetchWithCorsCatch = async (src: string, init?: RequestInit) => {
	try {
		const response = await fetch(src, {
			mode: 'cors',
			referrerPolicy: 'no-referrer-when-downgrade',
			...init,
		});
		return response;
	} catch (err) {
		const error = err as Error;
		if (
			// Chrome 브라우저
			error.message.includes('Failed to fetch') ||
			// Safari 브라우저
			error.message.includes('Load failed') ||
			// Firefox 브라우저
			error.message.includes('NetworkError when attempting to fetch resource')
		) {
			throw new TypeError(
				`Failed to read from ${src}: ${error.message}. Does the resource support CORS?`,
			);
		}

		throw err;
	}
};
const isRemoteAsset = (asset: string) =>
	!asset.startsWith(window.origin) && !asset.startsWith('data');

type MediaUtilsAudioData = {
	channelWaveforms: Float32Array[];
	sampleRate: number;
	durationInSeconds: number;
	numberOfChannels: number;
	resultId: string;
	isRemote: boolean;
};

export type ImageDimensions = {width: number; height: number};

const metadataCache: {[key: string]: MediaUtilsAudioData} = {};

const limit = pLimit(3);

const fn = async (src: string): Promise<MediaUtilsAudioData> => {
	if (metadataCache[src]) {
		return metadataCache[src];
	}

	if (typeof document === 'undefined') {
		throw new Error('getAudioData() is only available in the browser.');
	}

	const audioContext = new AudioContext({
		sampleRate: 48000,
	});

	const response = await fetchWithCorsCatch(src);
	const arrayBuffer = await response.arrayBuffer();

	const wave = await audioContext.decodeAudioData(arrayBuffer);

	const channelWaveforms = new Array(wave.numberOfChannels)
		.fill(true)
		.map((_, channel) => {
			return wave.getChannelData(channel);
		});

	const metadata: MediaUtilsAudioData = {
		channelWaveforms,
		sampleRate: wave.sampleRate,
		durationInSeconds: wave.duration,
		numberOfChannels: wave.numberOfChannels,
		resultId: String(Math.random()),
		isRemote: isRemoteAsset(src),
	};
	metadataCache[src] = metadata;
	return metadata;
};

/*
 * @description audio 또는 video src를 받아서 로드하고 지정된 source의 data와 metadata를 반환합니다.
 * @see [Documentation](https://remotion.dev/docs/get-audio-data)
 */
export const getAudioData = (src: string) => {
	return limit(fn, src);
};
