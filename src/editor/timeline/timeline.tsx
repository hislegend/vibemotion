import {PlayerRef} from '@remotion/player';

import React, {useMemo} from 'react';
import {PlayerRefContext} from '../contexts/player-ref-context';
import {MAX_AUTOSCROLL_SPEED, scrollbarStyle} from '../constants';
import {DraggingTimelineItems} from '../drag-overlay';
import {DropHandler} from '../drop-handler';
import {
	FEATURE_BACKSPACE_TO_DELETE,
	FEATURE_CUT_SHORTCUT,
	FEATURE_DUPLICATE_LAYERS,
	FEATURE_FOLLOW_PLAYHEAD_WHILE_PLAYING,
	FEATURE_MAX_TRIM_INDICATORS,
	FEATURE_SAVE_BUTTON,
	FEATURE_SELECT_ALL_SHORTCUT,
	FEATURE_SNAPPING_SHORTCUT,
	FEATURE_TIMELINE_SKIMMING,
	FEATURE_TIMELINE_SNAPPING,
	FEATURE_TRIM_END_SHORTCUT,
	FEATURE_TRIM_START_SHORTCUT,
} from '../flags';
import {BackspaceToDelete} from '../keyboard-shortcuts/backspace-to-delete';
import {CopyPasteLayers} from '../keyboard-shortcuts/copy-paste-layers';
import {CutEditShortcuts} from '../keyboard-shortcuts/cut-edit-shortcuts';
import {DuplicateLayers} from '../keyboard-shortcuts/duplicate-layers';
import {SaveShortcut} from '../keyboard-shortcuts/save-shortcut';
import {SelectAllShortcut} from '../keyboard-shortcuts/select-all-shortcut';
import {SnappingShortcut} from '../keyboard-shortcuts/snapping-shortcut';
import {SpaceToPlayPause} from '../keyboard-shortcuts/space-to-play-pause';
import {UndoRedo} from '../keyboard-shortcuts/undo-redo';
import {MarqueeSelection} from '../marquee-selection';
import {getVisibleFrames} from '../utils/get-visible-frames';
import {useTimelineMarqueeSelectionAndSeek} from '../utils/marquee-selection/use-timeline-marquee-selection-and-seek';
import {
	timelineRightSide,
	timelineScrollContainerRef,
} from '../utils/restore-scroll-after-zoom';
import {
	useActiveTimelineSnap,
	useAllItems,
	useDimensions,
	useFps,
	useFullState,
	useTimelineContext,
	useTimelineHeight,
	useTracks,
	useWriteContext,
} from '../utils/use-context';
import {useTimelineContainerAutoScroll} from '../utils/use-timeline-container-auto-scroll';
import {useDragPreview} from './drag-preview-provider';
import {Playhead} from './playhead';
import {SkimmingLine} from './skimming-line/skimming-line';
import {useSkimming} from './skimming-line/use-skimming';
import {TimelineSnapIndicators} from './snap-indicator/timeline-snap-indicators';
import {TICKS_HEIGHT} from './ticks/constants';
import {TimelineTicks} from './ticks/ticks';
import {TimelineBackground} from './timeline-background/timeline-background';
import {TimelineMaxTrimIndicators} from './timeline-item/timeline-max-trim-indicators/timeline-max-trim-indicators';
import {TimelineFollowPlayheadWhilePlaying} from './timeline-scroll-while-playing';
import {TimelineScrollableContainer} from './timeline-scrollable-container';
import {SidePanel} from './timeline-side-panel/timeline-side-panel';
import {TimelineTracks} from './timeline-tracks';
import {TimelineUnderlayPreviews} from './timeline-underlay-previews';
import {applyNewPositionsToState} from './utils/drag/apply-new-positions-to-state';
import {getTracksHeight} from './utils/drag/calculate-track-heights';
import {remainOriginalTrackHeights} from './utils/drag/remain-original-track-heights';
import {useTimelineSize} from './utils/use-timeline-size';

export const Timeline = ({
	playerRef,
}: {
	playerRef: React.RefObject<PlayerRef | null>;
}) => {
	const {durationInFrames} = useTimelineContext();
	const {tracks: tracksInState} = useTracks();
	const {compositionHeight, compositionWidth} = useDimensions();
	const {fps} = useFps();
	const {items: itemsInState} = useAllItems();
	const {activeSnapPoint} = useActiveTimelineSnap();
	const {isSkimmingEnabled} = useFullState();
	const {setState} = useWriteContext();

	const visibleFrames = getVisibleFrames({
		fps,
		totalDurationInFrames: durationInFrames,
	});

	const previewState = useDragPreview();

	const timelineHeight = useTimelineHeight();

	const style = useMemo<React.CSSProperties>(
		() => ({
			height: timelineHeight + TICKS_HEIGHT,
		}),
		[timelineHeight],
	);

	const containerStyles = useMemo<React.CSSProperties>(
		() => ({
			...scrollbarStyle,
			height: timelineHeight + TICKS_HEIGHT,
		}),
		[timelineHeight],
	);

	// 사용자 drag로 인해 두 track 사이에 새 track이 생성되는 경우,
	// 깜빡임이 발생할 수 있으므로 새 track이 아닌 line으로만 preview합니다.
	const previewsTrackInsertionInbetween = useMemo(() => {
		if (!previewState) {
			return false;
		}

		return previewState.trackInsertions?.type === 'between';
	}, [previewState]);

	const {tracks, items} = useMemo(() => {
		if (!previewState) {
			return {tracks: tracksInState, items: itemsInState};
		}

		if (previewsTrackInsertionInbetween) {
			return {
				tracks: tracksInState,
				items: itemsInState,
			};
		}

		return applyNewPositionsToState({
			prevTracks: tracksInState,
			dragPreview: previewState,
			prevItems: itemsInState,
			shouldRemoveEmptyTracks: false,
		});
	}, [
		tracksInState,
		previewState,
		itemsInState,
		previewsTrackInsertionInbetween,
	]);

	const tracksAndLayout = useMemo(() => {
		return remainOriginalTrackHeights({
			originalTracks: tracksInState,
			originalItems: itemsInState,
			newTracks: tracks,
			newItems: items,
		});
	}, [tracks, items, tracksInState, itemsInState]);

	const tracksHeight = useMemo(() => {
		return getTracksHeight({tracks: tracksAndLayout});
	}, [tracksAndLayout]);

	const styles = useMemo(
		() => ({
			minHeight: timelineHeight + TICKS_HEIGHT,
			height: tracksHeight + TICKS_HEIGHT,
		}),
		[tracksHeight, timelineHeight],
	);

	const {timelineWidth} = useTimelineSize();

	// 스키밍 훅
	const {
		skimmingFrame,
		onMouseMove: onSkimmingMouseMove,
		onMouseEnter: onSkimmingMouseEnter,
		onMouseLeave: onSkimmingMouseLeave,
		onSkimmingClick,
		containerRef: skimmingContainerRef,
	} = useSkimming({
		playerRef,
		timelineWidth,
		visibleFrames,
		isEnabled: isSkimmingEnabled,
		items: itemsInState,
		setState,
	});

	const {
		onPointerDown: onPointerDownEmptySpace,
		rect,
		isDragging: isDraggingMarqueeSelection,
	} = useTimelineMarqueeSelectionAndSeek({
		playerRef,
		timelineWidth,
		timelineScrollableHeight: tracksHeight + TICKS_HEIGHT,
		visibleFrames,
	});

	useTimelineContainerAutoScroll({
		isDragging: isDraggingMarqueeSelection,
		edgeThreshold: 10,
		maxScrollSpeed: MAX_AUTOSCROLL_SPEED,
		xAxis: true,
		yAxis: true,
	});

	const inbetweenTrackIndicators = useMemo(() => {
		if (!previewState) {
			return null;
		}

		if (previewState.trackInsertions?.type !== 'between') {
			return null;
		}

		return previewState.trackInsertions.trackIndex;
	}, [previewState]);

	const snapPoint = previewState?.snapPoint ?? activeSnapPoint;

	return (
		<PlayerRefContext.Provider value={playerRef}>
			<div
				className={'bg-editor-starter-bg relative h-full w-full select-none'}
				style={style}
			>
				<DropHandler
					playerRef={playerRef}
					compositionHeight={compositionHeight}
					compositionWidth={compositionWidth}
					context="timeline"
				>
					<div
						className="flex h-full w-full overflow-x-scroll overflow-y-scroll"
						style={containerStyles}
						ref={(el) => {
							// 두 ref 모두 설정
							(timelineScrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
							skimmingContainerRef.current = el;
						}}
						onPointerDown={onPointerDownEmptySpace}
						onMouseMove={isSkimmingEnabled ? onSkimmingMouseMove : undefined}
						onMouseEnter={isSkimmingEnabled ? onSkimmingMouseEnter : undefined}
						onMouseLeave={isSkimmingEnabled ? onSkimmingMouseLeave : undefined}
						onClick={isSkimmingEnabled && !isDraggingMarqueeSelection ? onSkimmingClick : undefined}
					>
						{timelineWidth !== null ? (
							<>
								<SidePanel
									tracks={tracksAndLayout}
									inbetweenTrackDropTrackIndex={inbetweenTrackIndicators}
								/>
								<div
									style={styles}
									ref={timelineRightSide}
									className="relative h-full"
								>
									<TimelineTicks
										visibleFrames={visibleFrames}
										timelineWidth={timelineWidth}
									/>
									<TimelineScrollableContainer timelineWidth={timelineWidth}>
										<TimelineBackground
											tracks={tracksAndLayout}
											timelineWidth={timelineWidth}
											inbetweenTrackDropTrackIndex={inbetweenTrackIndicators}
										/>
										<TimelineTracks
											tracks={tracksAndLayout}
											visibleFrames={visibleFrames}
										/>
										{previewState && !previewsTrackInsertionInbetween ? (
											<TimelineUnderlayPreviews
												timelineWidth={timelineWidth}
												simulatedTracks={tracksAndLayout}
												previewState={previewState}
											/>
										) : null}
										{FEATURE_MAX_TRIM_INDICATORS ? (
											<TimelineMaxTrimIndicators
												timelineWidth={timelineWidth}
											/>
										) : null}
										{FEATURE_TIMELINE_SNAPPING && snapPoint ? (
											<TimelineSnapIndicators
												timelineWidth={timelineWidth}
												activeSnapPoint={snapPoint}
											/>
										) : null}
									</TimelineScrollableContainer>
								<Playhead
										visibleFrames={visibleFrames}
										playerRef={playerRef}
										height={tracksHeight}
										timelineWidth={timelineWidth}
										durationInFrames={durationInFrames}
									/>
									{FEATURE_TIMELINE_SKIMMING && isSkimmingEnabled && skimmingFrame !== null && (
										<SkimmingLine
											frame={skimmingFrame}
											visibleFrames={visibleFrames}
											height={tracksHeight}
											timelineWidth={timelineWidth}
										/>
									)}
									{rect ? <MarqueeSelection selection={rect} /> : null}
								</div>
							</>
						) : null}
					</div>
				</DropHandler>
			</div>
		<SpaceToPlayPause playerRef={playerRef} />
			{FEATURE_BACKSPACE_TO_DELETE && <BackspaceToDelete />}
			{FEATURE_DUPLICATE_LAYERS && <DuplicateLayers />}
			<UndoRedo />
			{FEATURE_SAVE_BUTTON && <SaveShortcut />}
			<CopyPasteLayers playerRef={playerRef} />
			{FEATURE_SELECT_ALL_SHORTCUT && <SelectAllShortcut />}
			{FEATURE_TIMELINE_SNAPPING && FEATURE_SNAPPING_SHORTCUT && (
				<SnappingShortcut />
			)}
			{(FEATURE_CUT_SHORTCUT ||
				FEATURE_TRIM_START_SHORTCUT ||
				FEATURE_TRIM_END_SHORTCUT) && (
				<CutEditShortcuts playerRef={playerRef} />
			)}
			<DraggingTimelineItems />
			{FEATURE_FOLLOW_PLAYHEAD_WHILE_PLAYING ? (
				<TimelineFollowPlayheadWhilePlaying
					playerRef={playerRef}
					timelineWidth={timelineWidth}
					visibleFrames={visibleFrames}
				/>
			) : null}
		</PlayerRefContext.Provider>
	);
};
