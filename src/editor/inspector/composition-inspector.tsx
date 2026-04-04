import React, {useCallback} from 'react';
import {PlayerRef} from '@remotion/player';
import {Plus} from 'lucide-react';
import {
	FEATURE_RENDERING,
	FEATURE_SWAP_COMPOSITION_DIMENSIONS_BUTTON,
} from '../flags';
import {RotateRight} from '../icons/rotate-right';
import {RenderControls} from '../rendering/render-controls';
import {renderFrame} from '../utils/render-frame';
import {
	useDimensions,
	useFps,
	useTimelineContext,
	useWriteContext,
} from '../utils/use-context';
import {InspectorIconButton} from './components/inspector-icon-button';
import {InspectorLabel} from './components/inspector-label';
import {
	InspectorDivider,
	InspectorSection,
} from './components/inspector-section';
import {
	NumberControl,
	NumberControlUpdateHandler,
} from './controls/number-controls';
import {createTextItem} from '../items/text/create-text-item';
import {addItem} from '../state/actions/add-item';

export const CompositionInspector: React.FC<{
	playerRef?: React.RefObject<PlayerRef | null>;
}> = ({playerRef}) => {
	const {durationInFrames} = useTimelineContext();
	const {fps} = useFps();
	const {compositionWidth, compositionHeight} = useDimensions();
	const {setState} = useWriteContext();

	const swapDimensions = React.useCallback(() => {
		setState({
			update: (state) => {
				if (
					state.undoableState.compositionWidth ===
					state.undoableState.compositionHeight
				) {
					return state;
				}

				return {
					...state,
					undoableState: {
						...state.undoableState,
						compositionWidth: state.undoableState.compositionHeight,
						compositionHeight: state.undoableState.compositionWidth,
					},
				};
			},
			commitToUndoStack: true,
		});
	}, [setState]);

	const setCompositionHeight: NumberControlUpdateHandler = React.useCallback(
		({num, commitToUndoStack}) => {
			setState({
				update: (state) => {
					if (num === state.undoableState.compositionHeight) {
						return state;
					}

					return {
						...state,
						undoableState: {
							...state.undoableState,
							compositionHeight: num,
						},
					};
				},
				commitToUndoStack,
			});
		},
		[setState],
	);

	const setCompositionWidth: NumberControlUpdateHandler = React.useCallback(
		({num, commitToUndoStack}) => {
			setState({
				update: (state) => {
					if (num === state.undoableState.compositionWidth) {
						return state;
					}

					return {
						...state,
						undoableState: {
							...state.undoableState,
							compositionWidth: num,
						},
					};
				},
				commitToUndoStack,
			});
		},
		[setState],
	);

	const handleAddSubtitle = useCallback(async () => {
		const currentFrame = playerRef?.current?.getCurrentFrame() ?? 0;
		const textItem = await createTextItem({
			xOnCanvas: compositionWidth / 2,
			yOnCanvas: compositionHeight * 0.85, // 화면 하단 85% 위치
			from: currentFrame,
			text: '자막을 입력하세요',
			align: 'center',
		});
		setState({
			update: (state) => addItem({state, item: textItem, select: true, position: {type: 'back'}}),
			commitToUndoStack: true,
		});
	}, [playerRef, compositionWidth, compositionHeight, setState]);

	return (
		<div>
			<InspectorSection>
				<InspectorLabel>캔버스</InspectorLabel>
				<div className="flex flex-row gap-2">
					<div className="flex flex-1">
						<NumberControl
							label="W"
							setValue={setCompositionWidth}
							value={compositionWidth}
							min={2}
							max={null}
							step={2}
							accessibilityLabel="너비"
						/>
					</div>
					<div className="flex flex-1">
						<NumberControl
							label="H"
							setValue={setCompositionHeight}
							value={compositionHeight}
							min={2}
							max={null}
							step={2}
							accessibilityLabel="높이"
						/>
					</div>
					{FEATURE_SWAP_COMPOSITION_DIMENSIONS_BUTTON && (
						<div className="editor-starter-field hover:border-transparent">
							<InspectorIconButton
								className="flex h-full w-8 flex-1 items-center justify-center"
								onClick={swapDimensions}
								aria-label="가로세로 전환"
							>
								<RotateRight height={12} width={12}></RotateRight>
							</InspectorIconButton>
						</div>
					)}
				</div>
			</InspectorSection>
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>길이</InspectorLabel>
				<div className="h-1"></div>
				<div className="text-xs text-neutral-300">
					{renderFrame(durationInFrames, fps)}
				</div>
			</InspectorSection>
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>자막</InspectorLabel>
				<button
					onClick={handleAddSubtitle}
					className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
				>
					<Plus className="h-4 w-4" />
					자막 추가
				</button>
			</InspectorSection>
			<InspectorDivider />
			{FEATURE_RENDERING ? <RenderControls /> : null}
		</div>
	);
};
