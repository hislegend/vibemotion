import {
	getAssetFromItem,
	getAssetMaxDurationInFramesFromItem,
} from '../../../assets/utils';
import {DEFAULT_TIMELINE_SNAPPING_THRESHOLD_PIXELS} from '../../../constants';
import {SetState} from '../../../context-provider';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../../../force-specific-cursor';
import {getItemPlaybackRate} from '../../../items/get-item-playback-rate';
import {applySnapPoint} from '../../../state/actions/apply-snap-point';
import {changeItem} from '../../../state/actions/change-item';
import {
	extendLeft,
	getMinimumFromWhenExtendingLeftBasedOnAsset,
} from '../../../state/actions/extend-left';
import {extendRight} from '../../../state/actions/extend-right';
import {
	markItemAsBeingTrimmed,
	unmarkItemAsBeingTrimmed,
} from '../../../state/actions/mark-item-as-being-trimmed';
import {setSelectedItems} from '../../../state/actions/set-selected-items';
import {EditorState} from '../../../state/types';
import {getCompositionDuration} from '../../../utils/get-composition-duration';
import {getVisibleFrames} from '../../../utils/get-visible-frames';
import {getOffsetOfTrack} from '../../../utils/position-utils';
import {timelineScrollContainerRef} from '../../../utils/restore-scroll-after-zoom';
import {
	calculateSelectionAndDragState,
	hasExceededMoveThreshold,
} from '../../../utils/selection-utils';
import {getTrackIndexOfItem} from '../../utils/get-track-index-of-item';
import {
	applySnapping,
	collectSnapPoints,
	SnapPoint,
} from '../../utils/snap-points';

type ExtendType =
	| {
			type: 'left';
			clickedItemId: string;
	  }
	| {
			type: 'right';
			clickedItemId: string;
	  };

export const onExtendHandler = ({
	pointerDownEvent,
	setState,
	timelineWidth,
	stateAsRef,
	extend,
	height,
	onDragEnd,
}: {
	pointerDownEvent: React.PointerEvent<HTMLDivElement>;
	setState: SetState;
	timelineWidth: number;
	stateAsRef: React.RefObject<EditorState>;
	extend: ExtendType;
	height: number;
	onDragEnd: () => void;
}) => {
	// multi-select 지원으로 selection 처리
	const multiSelect = pointerDownEvent.metaKey || pointerDownEvent.shiftKey;

	const {undoableState, selectedItems} = stateAsRef.current;
	const {tracks, items, fps, assets} = undoableState;

	const {newSelectedItems} = calculateSelectionAndDragState({
		clickedItem: items[extend.clickedItemId],
		currentSelectedItemIds: selectedItems,
		isMultiSelectMode: multiSelect,
	});

	setState({
		update: (state) => {
			let newState = setSelectedItems(state, newSelectedItems);

			for (const itemId of newSelectedItems) {
				const item = items[itemId];

				const playbackRate = getItemPlaybackRate(item);

				const maxDuration = getAssetMaxDurationInFramesFromItem({
					item,
					assets,
					fps: state.undoableState.fps,
					playbackRate,
				});
				const minimumFrom = getMinimumFromWhenExtendingLeftBasedOnAsset({
					prevItem: item,
					fps: state.undoableState.fps,
				});

				const trackIndex = getTrackIndexOfItem({
					itemId,
					tracks,
				});

				const top = getOffsetOfTrack({
					trackIndex,
					tracks,
					items,
				});

				newState = markItemAsBeingTrimmed({
					state: newState,
					itemId,
					side: extend.type === 'left' ? 'left' : 'right',
					maxDurationInFrames: maxDuration,
					minFrom: minimumFrom,
					trackIndex,
					top,
					height,
				});
			}

			return newState;
		},
		commitToUndoStack: false,
	});

	forceSpecificCursor(extend.type === 'left' ? 'e-resize' : 'w-resize');

	const startX = pointerDownEvent.clientX;

	const initialScrollLeft = timelineScrollContainerRef.current?.scrollLeft ?? 0;

	const compositionDurationInFrames = getCompositionDuration(
		Object.values(items),
	);

	const visibleFrames = getVisibleFrames({
		fps: fps,
		totalDurationInFrames: compositionDurationInFrames,
	});

	let lastOffsetInFrames = 0;

	// 이 trim gesture를 위해 snap point들을 미리 계산
	const snapPoints = collectSnapPoints({
		tracks,
		items,
		excludeItemIds: newSelectedItems,
	});

	const fromPointerEvent = (
		pointerEvent: PointerEvent,
		commitToUndoStack: boolean,
	) => {
		// dragging 중 timeline container scroll 변경 사항 고려
		const currentScrollLeft =
			timelineScrollContainerRef.current?.scrollLeft ?? 0;
		const scrollDelta = currentScrollLeft - initialScrollLeft;

		const offsetX = pointerEvent.clientX - startX + scrollDelta;
		let offsetInFrames = Math.round((offsetX / timelineWidth) * visibleFrames);
		const pixelsPerFrame = timelineWidth / visibleFrames;

		// snapping이 활성화된 경우 적용
		const currentState = stateAsRef.current;
		let snapPointToApply: SnapPoint | null = null;

		if (
			currentState &&
			currentState.isSnappingEnabled === true &&
			newSelectedItems.length > 0
		) {
			// trim되는 item 가져오기
			const trimmedItem = items[extend.clickedItemId];
			if (trimmedItem) {
				// 이 offset 이후 새로운 duration이 어떻게 될지 계산
				let wouldBeValidTrim = true;
				let newDurationAfterOffset: number;
				let newFromAfterOffset: number;

				if (extend.type === 'left') {
					// left trim의 경우, duration은 offset과 반비례하여 변경
					newDurationAfterOffset =
						trimmedItem.durationInFrames - offsetInFrames;
					newFromAfterOffset = trimmedItem.from + offsetInFrames;

					// 이전 item과의 충돌 확인
					const trackIndex = getTrackIndexOfItem({
						itemId: extend.clickedItemId,
						tracks,
					});
					if (trackIndex >= 0) {
						const trackItemsSorted = tracks[trackIndex].items
							.slice()
							.sort((a, b) => items[a].from - items[b].from);
						const itemIndex = trackItemsSorted.findIndex(
							(id) => id === extend.clickedItemId,
						);
						const previousItem =
							itemIndex > 0 ? trackItemsSorted[itemIndex - 1] : null;

						if (previousItem) {
							const previousItemEnd =
								items[previousItem].from + items[previousItem].durationInFrames;
							if (newFromAfterOffset < previousItemEnd) {
								wouldBeValidTrim = false;
							}
						}
					}

					// 새로운 from이 음수가 될지 확인
					if (newFromAfterOffset < 0) {
						wouldBeValidTrim = false;
					}
				} else {
					// right trim의 경우, duration은 offset과 직접적으로 변경
					newDurationAfterOffset =
						trimmedItem.durationInFrames + offsetInFrames;

					// 다음 item과의 충돌 확인
					const trackIndex = getTrackIndexOfItem({
						itemId: extend.clickedItemId,
						tracks,
					});
					if (trackIndex >= 0) {
						const trackItemsSorted = tracks[trackIndex].items
							.slice()
							.sort((a, b) => items[a].from - items[b].from);
						const itemIndex = trackItemsSorted.findIndex(
							(id) => id === extend.clickedItemId,
						);
						const nextItem =
							itemIndex < trackItemsSorted.length - 1
								? trackItemsSorted[itemIndex + 1]
								: null;

						if (nextItem) {
							const nextItemStart = items[nextItem].from;
							const newEnd = trimmedItem.from + newDurationAfterOffset;
							if (newEnd > nextItemStart) {
								wouldBeValidTrim = false;
							}
						}
					}
				}

				// trim이 유효한 duration을 만들어낼지 확인 (최소 1 frame)
				if (newDurationAfterOffset < 1) {
					wouldBeValidTrim = false;
				}

				// trim 작업이 유효할 때만 snapping 적용
				if (wouldBeValidTrim) {
					// trim side를 기반으로 target position 계산
					let targetFrame: number;
					if (extend.type === 'left') {
						// left trim의 경우, 시작 position을 조정
						targetFrame = trimmedItem.from + offsetInFrames;
					} else {
						// right trim의 경우, 끝 position을 조정
						targetFrame =
							trimmedItem.from + trimmedItem.durationInFrames + offsetInFrames;
					}

					// snapping 적용
					const {snappedFrame, activeSnapPoint} = applySnapping({
						targetFrame,
						snapPoints: snapPoints,
						pixelThreshold: DEFAULT_TIMELINE_SNAPPING_THRESHOLD_PIXELS,
						timelineWidth,
						visibleFrames,
						isSnappingEnabled: currentState.isSnappingEnabled,
					});
					if (!commitToUndoStack) {
						snapPointToApply = activeSnapPoint;
					}

					// snapping을 기반으로 offset 조정
					if (extend.type === 'left') {
						offsetInFrames = snappedFrame - trimmedItem.from;
					} else {
						offsetInFrames =
							snappedFrame - (trimmedItem.from + trimmedItem.durationInFrames);
					}
				}
			}
		}
		if (offsetInFrames === lastOffsetInFrames && !commitToUndoStack) {
			return;
		}

		lastOffsetInFrames = offsetInFrames;

		setState({
			update: (state) => {
				let newState = state;
				for (const itemId of newSelectedItems) {
					const item = items[itemId];
					const trackIndex = getTrackIndexOfItem({
						itemId,
						tracks,
					});
					// track items array의 순서에 의존하지 않고
					// `from` property로 정렬하여 이전 item을 올바르게 가져오도록 보장
					// state의 일부이므로 원본 array를 변조하지 않도록 함
					const trackItemsSorted = tracks[trackIndex].items
						.slice()
						.sort((a, b) => items[a].from - items[b].from);
					if (extend.type === 'left') {
						newState = changeItem(newState, item.id, (prevItem) => {
							return extendLeft({
								prevItem,
								trackItemsSorted,
								itemIndex: trackItemsSorted.findIndex(
									(trackItem) => trackItem === item.id,
								),
								initialFrom: item.from,
								fps,
								items,
								initialDurationInFrames: item.durationInFrames,
								offsetInFrames,
								pixelsPerFrame,
							});
						});
					}
					if (extend.type === 'right') {
						newState = changeItem(newState, item.id, (prevItem) => {
							return extendRight({
								initialDurationInFrames: item.durationInFrames,
								initialFrom: item.from,
								prevItem,
								trackItemsSorted,
								itemIndex: trackItemsSorted.findIndex(
									(trackItem) => trackItem === item.id,
								),
								asset: getAssetFromItem({item, assets}),
								items,
								fps,
								offsetInFrames,
								pixelsPerFrame,
								visibleFrames,
							});
						});
					}

					newState = applySnapPoint({
						state: newState,
						snapPoint: snapPointToApply,
					});
				}

				return newState;
			},
			commitToUndoStack,
		});
	};

	let hasStartedExtend = false;
	let lastPointerEvent: PointerEvent | null = null;

	const onPointerMove = (pointerMoveEvent: PointerEvent) => {
		lastPointerEvent = pointerMoveEvent;
		if (!hasStartedExtend) {
			if (!hasExceededMoveThreshold(startX, 0, pointerMoveEvent.clientX, 0)) {
				return; // threshold를 초과할 때까지 대기
			}
			hasStartedExtend = true;
		}
		fromPointerEvent(pointerMoveEvent, false);
	};

	// `useTimelineContainerAutoScroll`을 고려
	const onScroll = () => {
		if (hasStartedExtend && lastPointerEvent) {
			fromPointerEvent(lastPointerEvent, false);
		}
	};

	const onPointerUp = (pointerUpEvent: PointerEvent) => {
		stopForcingSpecificCursor();
		if (hasStartedExtend) {
			fromPointerEvent(pointerUpEvent, true);
		}

		setState({
			update: (state) => {
				let newState = state;

				for (const itemId of newSelectedItems) {
					newState = unmarkItemAsBeingTrimmed({
						state: newState,
						itemId,
					});
				}

				newState = applySnapPoint({
					state: newState,
					snapPoint: null,
				});

				return newState;
			},
			commitToUndoStack: false,
		});

		onDragEnd?.();

		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerUp);
		timelineScrollContainerRef.current?.removeEventListener('scroll', onScroll);
	};

	window.addEventListener('pointermove', onPointerMove);
	window.addEventListener('pointerup', onPointerUp);
	timelineScrollContainerRef.current?.addEventListener('scroll', onScroll);
};
