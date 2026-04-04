export type PeakLevel = {
	samplesPerPeak: number;
	peaks: Float32Array;
};

export type PeakData = {
	levels: PeakLevel[];
	originalSampleCount: number;
};

export type AudioDataWithPeaks = {
	channelWaveforms: Float32Array[];
	sampleRate: number;
	durationInSeconds: number;
	numberOfChannels: number;
	resultId: string;
	isRemote: boolean;
	peakData: PeakData;
};

/**
 * 효율적인 waveform rendering을 위해 여러 해상도 레벨에서 peak data를 생성합니다
 */
export function generateDownsampledPeakData(rawPeaks: Float32Array): PeakData {
	const originalSampleCount = rawPeaks.length;

	// downsampling level을 정의 - 각 level은 data를 10배씩 감소시킵니다
	const downsampleFactors = [10, 100, 1000, 10000];
	const levels: PeakLevel[] = [];

	for (const factor of downsampleFactors) {
		const samplesPerPeak = factor;
		const numPeaks = Math.ceil(originalSampleCount / samplesPerPeak);
		const peaks = new Float32Array(numPeaks);

		for (let i = 0; i < numPeaks; i++) {
			const startSample = i * samplesPerPeak;
			const endSample = Math.min(
				startSample + samplesPerPeak,
				originalSampleCount,
			);

			let peak = 0;
			for (let s = startSample; s < endSample; s++) {
				const value = Math.abs(rawPeaks[s]);
				if (value > peak) {
					peak = value;
				}
			}

			peaks[i] = peak;
		}

		levels.push({
			samplesPerPeak,
			peaks,
		});
	}

	return {
		levels,
		originalSampleCount,
	};
}

/**
 * waveform 그리기를 위한 최적의 peak level을 선택합니다
 *
 * 목표: 시각적 품질과 성능 사이의 적절한 균형을 찾습니다
 * - peak가 너무 적으면 = 각지고 네모난 waveform (품질 저하)
 * - peak가 너무 많으면 = 느린 rendering (성능 저하)
 *
 * 최적 지점: 화면 pixel당 0.5~4개의 peak
 */
export function selectPeakLevel(
	peakData: PeakData,
	visualWidth: number,
): PeakLevel {
	const minAcceptableRatio = 0.5;
	const maxAcceptableRatio = 4.0;

	let bestLevel = peakData.levels[0]; // 첫 번째 level로 시작
	let bestScore = -Infinity;

	for (const level of peakData.levels) {
		const ratio = level.peaks.length / visualWidth;

		// score 계산: 허용 범위 내의 level을 선호하고, 그 다음으로 효율성을 고려
		let score: number;

		if (ratio >= minAcceptableRatio && ratio <= maxAcceptableRatio) {
			// 허용 범위 내: 더 적은 peak를 선호 (더 높은 효율성)
			score = 1000 - ratio; // 낮은 ratio일수록 높은 score
		} else if (ratio > maxAcceptableRatio) {
			// 너무 밀집됨: 여전히 사용 가능하지만 패널티 적용
			score = 500 - ratio;
		} else {
			// 너무 희박함: 큰 패널티 적용, 더 높은 ratio를 선호
			score = ratio;
		}

		if (score > bestScore) {
			bestLevel = level;
			bestScore = score;
		}
	}

	return bestLevel;
}
