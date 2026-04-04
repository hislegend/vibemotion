import {decibelToGain} from './decibels';
import {getAudioFadeMultiplier} from './get-audio-fade-multiplier';

export const volumeFn =
	({
		fps,
		audioFadeInDurationInSeconds,
		audioFadeOutDurationInSeconds,
		durationInFrames,
		decibelAdjustment,
	}: {
		fps: number;
		audioFadeInDurationInSeconds: number;
		audioFadeOutDurationInSeconds: number;
		durationInFrames: number;
		decibelAdjustment: number;
	}) =>
	(frame: number) => {
		const fadeMultiplier = getAudioFadeMultiplier({
			frame,
			fadeInFrames: audioFadeInDurationInSeconds * fps,
			fadeOutFrames: audioFadeOutDurationInSeconds * fps,
			durationInFrames: durationInFrames,
		});

		// fade 효과와 volume 조정을 결합
		const baseVolume = decibelToGain(decibelAdjustment);
		const finalVolume = baseVolume * fadeMultiplier;
		return finalVolume;
	};
