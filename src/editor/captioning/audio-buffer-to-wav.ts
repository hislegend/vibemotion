function floatTo16BitPCM(
	output: DataView,
	offset: number,
	input: Float32Array,
) {
	for (let i = 0; i < input.length; i++, offset += 2) {
		const s = Math.max(-1, Math.min(1, input[i]));
		output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}
}

function writeString(view: DataView, offset: number, string: string) {
	for (let i = 0; i < string.length; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}

const AUDIO_EXTRACTION_BIT_DEPTH = 16;
const AUDIO_EXTRACTION_CHANNELS = 1;

// Whisper는 16kHz audio만 처리
const SAMPLE_RATE = 16_000;

// OpenAI의 whisper API는 25MB 파일 크기 제한이 있음
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const BYTES_PER_SECOND =
	(SAMPLE_RATE * AUDIO_EXTRACTION_CHANNELS * AUDIO_EXTRACTION_BIT_DEPTH) / 8;
const SAFETY_MARGIN_IN_SECONDS = 10;

// 기본 매개변수로는 약 13.4분
export const MAX_DURATION_ALLOWING_CAPTIONING_IN_SEC = Math.floor(
	MAX_FILE_SIZE / BYTES_PER_SECOND - SAFETY_MARGIN_IN_SECONDS,
);

function encodeWAV({
	samples,
	sampleRate,
	numChannels,
}: {
	samples: Float32Array;
	sampleRate: number;
	numChannels: number;
}) {
	const bytesPerSample = AUDIO_EXTRACTION_BIT_DEPTH / 8;
	const blockAlign = numChannels * bytesPerSample;

	const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
	const view = new DataView(buffer);

	/* RIFF 식별자 */
	writeString(view, 0, 'RIFF');
	/* RIFF chunk 길이 */
	view.setUint32(4, 36 + samples.length * bytesPerSample, true);
	/* RIFF 타입 */
	writeString(view, 8, 'WAVE');
	/* format chunk 식별자 */
	writeString(view, 12, 'fmt ');
	/* format chunk 길이 */
	view.setUint32(16, 16, true);
	/* sample format (raw) */
	view.setUint16(20, 1, true);
	/* 채널 수 */
	view.setUint16(22, numChannels, true);
	/* sample rate */
	view.setUint32(24, sampleRate, true);
	/* byte rate (sample rate * block align) */
	view.setUint32(28, sampleRate * blockAlign, true);
	/* block align (채널 수 * sample당 byte) */
	view.setUint16(32, blockAlign, true);
	/* sample당 bit */
	view.setUint16(34, AUDIO_EXTRACTION_BIT_DEPTH, true);
	/* data chunk 식별자 */
	writeString(view, 36, 'data');
	/* data chunk 길이 */
	view.setUint32(40, samples.length * bytesPerSample, true);

	floatTo16BitPCM(view, 44, samples);

	return buffer;
}

function audioBufferToWav(buffer: AudioBuffer) {
	const {sampleRate} = buffer;

	// 첫 번째 채널만 처리, Vercel이 4.5MB payload 제한이 있기 때문
	const result = buffer.getChannelData(0);

	return encodeWAV({
		samples: result,
		sampleRate,
		numChannels: AUDIO_EXTRACTION_CHANNELS,
	});
}

export const extractAudio = async (src: string) => {
	const data = await fetch(src);
	const context = new AudioContext({
		sampleRate: SAMPLE_RATE,
	});
	const arrayBuffer = await data.arrayBuffer();
	const wave = await context.decodeAudioData(arrayBuffer);

	return audioBufferToWav(wave);
};
