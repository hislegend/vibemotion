import React, {memo, useCallback} from 'react';
import {MAX_FADE_DURATION_SECONDS} from '../../constants';
import {AudioItem} from '../../items/audio/audio-item-type';
import {Slider} from '../../slider';
import {changeItem} from '../../state/actions/change-item';
import {useFps, useWriteContext} from '../../utils/use-context';
import {InspectorSubLabel} from '../components/inspector-label';

const AudioFadeControlsUnmemoized: React.FC<{
	fadeInDuration: number;
	fadeOutDuration: number;
	itemId: string;
	durationInFrames: number;
}> = ({fadeInDuration, fadeOutDuration, itemId, durationInFrames}) => {
	const {fps} = useFps();
	const {setState} = useWriteContext();

	const setFadeInDuration = useCallback(
		(newFadeInDuration: number, commitToUndoStack: boolean) => {
			setState({
				update: (state) => {
					return changeItem(state, itemId, (i) => {
						const prev = i as AudioItem;
						if (prev.audioFadeInDurationInSeconds === newFadeInDuration) {
							return prev;
						}
						return {
							...prev,
							audioFadeInDurationInSeconds: newFadeInDuration,
						};
					});
				},
				commitToUndoStack,
			});
		},
		[setState, itemId],
	);

	const setFadeOutDuration = useCallback(
		(newFadeOutDuration: number, commitToUndoStack: boolean) => {
			setState({
				update: (state) => {
					return changeItem(state, itemId, (i) => {
						const prev = i as AudioItem;
						if (prev.audioFadeOutDurationInSeconds === newFadeOutDuration) {
							return prev;
						}
						return {
							...prev,
							audioFadeOutDurationInSeconds: newFadeOutDuration,
						};
					});
				},
				commitToUndoStack,
			});
		},
		[setState, itemId],
	);

	const handleFadeInChange = useCallback(
		(value: number, commitToUndoStack: boolean) => {
			setFadeInDuration(value, commitToUndoStack);
		},
		[setFadeInDuration],
	);

	const handleFadeOutChange = useCallback(
		(value: number, commitToUndoStack: boolean) => {
			setFadeOutDuration(value, commitToUndoStack);
		},
		[setFadeOutDuration],
	);

	// item duration과 fade 제약을 기반으로 최대 fade duration 계산
	const clipDurationInSeconds = durationInFrames / fps;

	// 각 fade는 다른 fade와 겹칠 수 없으며 함께 clip duration을 초과할 수 없음
	// 시각적 중복을 방지하기 위해 최소 1 frame의 간격을 유지
	const minGap = 1 / fps;
	const maxFadeInDuration = Math.max(
		0,
		Math.min(
			MAX_FADE_DURATION_SECONDS,
			clipDurationInSeconds - fadeOutDuration - minGap,
		),
	);

	const maxFadeOutDuration = Math.max(
		0,
		Math.min(
			MAX_FADE_DURATION_SECONDS,
			clipDurationInSeconds - fadeInDuration - minGap,
		),
	);

	return (
		<div className="space-y-4">
			<div>
				<InspectorSubLabel>페이드 인</InspectorSubLabel>
				<div className="flex w-full items-center gap-3">
					<Slider
						value={fadeInDuration}
						onValueChange={handleFadeInChange}
						min={0}
						max={maxFadeInDuration}
						step={0.1}
						className="flex-1"
						title={`페이드 인: ${fadeInDuration.toFixed(1)}s`}
					/>
					<div className="min-w-[50px] text-right text-xs text-white/75">
						{fadeInDuration.toFixed(1)}s
					</div>
				</div>
			</div>
			<div>
				<InspectorSubLabel>페이드 아웃</InspectorSubLabel>
				<div className="flex w-full items-center gap-3">
					<Slider
						value={fadeOutDuration}
						onValueChange={handleFadeOutChange}
						min={0}
						max={maxFadeOutDuration}
						step={0.1}
						className="flex-1"
						title={`페이드 아웃: ${fadeOutDuration.toFixed(1)}s`}
					/>
					<div className="min-w-[50px] text-right text-xs text-white/75">
						{fadeOutDuration.toFixed(1)}s
					</div>
				</div>
			</div>
		</div>
	);
};

export const AudioFadeControls = memo(AudioFadeControlsUnmemoized);
