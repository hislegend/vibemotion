import React, {memo, useCallback} from 'react';
import {MAX_FADE_DURATION_SECONDS} from '../../constants';
import {EditorStarterItem} from '../../items/item-type';
import {Slider} from '../../slider';
import {changeItem} from '../../state/actions/change-item';
import {useFps, useWriteContext} from '../../utils/use-context';
import {InspectorSubLabel} from '../components/inspector-label';

const FadeControlsUnmemoized: React.FC<{
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
						const prev = i as EditorStarterItem & {
							fadeInDurationInSeconds: number;
						};
						if (prev.fadeInDurationInSeconds === newFadeInDuration) {
							return prev;
						}
						return {
							...prev,
							fadeInDurationInSeconds: newFadeInDuration,
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
						const prev = i as EditorStarterItem & {
							fadeOutDurationInSeconds: number;
						};
						if (prev.fadeOutDurationInSeconds === newFadeOutDuration) {
							return prev;
						}
						return {
							...prev,
							fadeOutDurationInSeconds: newFadeOutDuration,
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

	// item 지속 시간과 fade 제약 사항에 기반하여 최대 fade 지속 시간 계산
	const clipDurationInSeconds = durationInFrames / fps;

	// 시각적 겹침을 방지하기 위해 최소 한 프레임 간격 유지
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

export const FadeControls = memo(FadeControlsUnmemoized);
