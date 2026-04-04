import React, {memo, useCallback} from 'react';
import {Slider} from '../../slider';
import {changeItem} from '../../state/actions/change-item';
import {useAssetFromAssetId, useWriteContext} from '../../utils/use-context';
import {InspectorSubLabel} from '../components/inspector-label';

const MIN_PLAYBACK_RATE = 0.25;
const MAX_PLAYBACK_RATE = 5;

const PlaybackRateControlsUnmemoized: React.FC<{
	playbackRate: number;
	itemId: string;
	assetId: string;
}> = ({playbackRate, itemId, assetId}) => {
	const {setState} = useWriteContext();
	const asset = useAssetFromAssetId(assetId);

	const setPlaybackRate = useCallback(
		(newPlaybackRate: number, commitToUndoStack: boolean) => {
			setState({
				update: (state) => {
					return changeItem(state, itemId, (i) => {
						if (i.type === 'video' && asset.type === 'video') {
							const maxDuration = Math.floor(
								((asset.durationInSeconds - i.videoStartFromInSeconds) /
									i.playbackRate) *
									state.undoableState.fps,
							);

							if (i.playbackRate === newPlaybackRate) {
								return i;
							}

							return {
								...i,
								playbackRate: newPlaybackRate,
								durationInFrames: Math.min(i.durationInFrames, maxDuration),
							};
						}
						if (i.type === 'audio' && asset.type === 'audio') {
							const maxDuration = Math.floor(
								((asset.durationInSeconds - i.audioStartFromInSeconds) /
									i.playbackRate) *
									state.undoableState.fps,
							);

							if (i.playbackRate === newPlaybackRate) {
								return i;
							}

							return {
								...i,
								playbackRate: newPlaybackRate,
								durationInFrames: Math.min(i.durationInFrames, maxDuration),
							};
						}

						if (i.type === 'gif' && asset.type === 'gif') {
							const maxDuration = Math.floor(
								((asset.durationInSeconds - i.gifStartFromInSeconds) /
									i.playbackRate) *
									state.undoableState.fps,
							);

							if (i.playbackRate === newPlaybackRate) {
								return i;
							}

							return {
								...i,
								playbackRate: newPlaybackRate,
								durationInFrames: Math.min(i.durationInFrames, maxDuration),
							};
						}

						throw new Error(
							`Playback rate control not implemented for this item type: ${i.type}`,
						);
					});
				},
				commitToUndoStack,
			});
		},
		[setState, itemId, asset],
	);

	const handleSliderChange = useCallback(
		(value: number, commitToUndoStack: boolean) => {
			const newPlaybackRate = value / 100;
			setPlaybackRate(newPlaybackRate, commitToUndoStack);
		},
		[setPlaybackRate],
	);

	const playbackRatePercent = Math.round(playbackRate * 100);

	return (
		<div>
			<InspectorSubLabel>재생 속도</InspectorSubLabel>
			<div className="flex w-full items-center gap-3">
				<Slider
					value={playbackRatePercent}
					onValueChange={handleSliderChange}
					min={MIN_PLAYBACK_RATE * 100}
					max={MAX_PLAYBACK_RATE * 100}
					step={5}
					className="flex-1"
					title={`재생 속도: ${playbackRate.toFixed(2)}x`}
				/>
				<div className="min-w-[40px] text-right text-xs text-white/75">
					{playbackRate.toFixed(2)}x
				</div>
			</div>
		</div>
	);
};

export const PlaybackRateControls = memo(PlaybackRateControlsUnmemoized);
