import React, {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {AssetState, EditorStarterAsset} from './assets/assets';
import {getKeys} from './caching/indexeddb';
import {loadToBlobUrlOnce} from './caching/load-to-blob-url';
import {CaptioningTask} from './captioning/caption-state';
import {EditModeProvider} from './edit-mode';
import {FEATURE_SAVE_BUTTON} from './flags';
import {EditorStarterItem} from './items/item-type';
import {TextItemHoverPreview} from './items/text/override-text-item-with-hover-preview';
import {ItemBeingTrimmed} from './items/trim-indicator';
import {RenderingTask} from './rendering/render-state';
import {getInitialState} from './state/initial-state';
import {loadLoop} from './state/loop-persistance';
import {loadState} from './state/persistance';
import {loadSkimmingEnabled} from './state/skimming-persistance';
import {loadSnappingEnabled} from './state/snapping-persistance';
import {getStateFromUrl} from './state/state-from-url';
import {loadAndClearSupabaseInitialState} from './state/supabase-initial-state';
import {
	DEFAULT_TIMELINE_HEIGHT,
	loadTimelineHeight,
} from './state/timeline-height-persistance';
import {EditorState, TrackType} from './state/types';
import {DragPreviewProvider} from './timeline/drag-preview-provider';
import {SnapPoint} from './timeline/utils/snap-points';
import {updateAssetStatusAfterCleanup} from './utils/asset-cleanup-utils';
import {createAssetStatusFromUndoableState} from './utils/asset-status-utils';
import {getCompositionDuration} from './utils/get-composition-duration';
import {TimelineZoomProvider} from './utils/timeline-zoom-provider';
import {useUndoRedo} from './utils/undo-redo';

export type SetState = (options: {
	update: EditorState | ((state: EditorState) => EditorState);
	commitToUndoStack: boolean;
}) => void;

export type TimelineWriteOnlyContext = {
	setState: SetState;
	undo: () => void;
	redo: () => void;
};

export interface TimelineContext {
	durationInFrames: number;
}

export interface TracksContext {
	tracks: TrackType[];
}

export interface FpsContext {
	fps: number;
}

export interface DimensionsContext {
	compositionWidth: number;
	compositionHeight: number;
}

export interface SelectedItemsContext {
	selectedItems: string[];
}

export interface AssetsContext {
	assets: Record<string, EditorStarterAsset>;
}

export interface AssetStatusContext {
	assetStatus: Record<string, AssetState>;
}

export interface CanUseUndoStackContext {
	canUndo: boolean;
	canRedo: boolean;
}

export interface CurrentStateContext {
	state: React.RefObject<EditorState>;
}

export interface AllItemsContext {
	items: Record<string, EditorStarterItem>;
}

export interface ActiveTimelineSnap {
	activeSnapPoint: SnapPoint | null;
}

export interface CenterSnapGuides {
	showHorizontalGuide: boolean;
	showVerticalGuide: boolean;
	setShowHorizontalGuide: (show: boolean) => void;
	setShowVerticalGuide: (show: boolean) => void;
}

export const TimelineContext = createContext<TimelineContext | null>(null);
export const TimelineWriteOnlyContext =
	createContext<TimelineWriteOnlyContext | null>(null);
export const RenderingContext = createContext<RenderingTask[] | null>(null);
export const FpsContext = createContext<FpsContext | null>(null);
export const DimensionsContext = createContext<DimensionsContext | null>(null);
export const SelectedItemsContext = createContext<SelectedItemsContext | null>(
	null,
);
export const AssetsContext = createContext<AssetsContext | null>(null);
export const AssetStatusContext = createContext<AssetStatusContext | null>(
	null,
);
export const TracksContext = createContext<TracksContext | null>(null);
export const AllItemsContext = createContext<AllItemsContext | null>(null);
export const FullStateContext = createContext<EditorState | null>(null);
export const CanUseUndoStackContext =
	createContext<CanUseUndoStackContext | null>(null);
export const CurrentStateContext = createContext<CurrentStateContext | null>(
	null,
);
export const TextItemEditingContext = createContext<string | null>(null);
export const TextItemHoverPreviewContext =
	createContext<TextItemHoverPreview | null>(null);
export const StateInitializedContext = createContext<boolean>(false);
export const CaptionStateContext = createContext<CaptioningTask[]>([]);
export const ItemsBeingTrimmedContext = createContext<ItemBeingTrimmed[]>([]);
export const LoopContext = createContext<boolean>(true);
export const TimelineHeightContext = createContext<number>(
	DEFAULT_TIMELINE_HEIGHT,
);
export const ActiveTimelineSnapContext =
	createContext<ActiveTimelineSnap | null>(null);
export const CenterSnapContext = createContext<CenterSnapGuides | null>(null);
export const ItemSelectedForCropContext = createContext<string | null>(null);

type ContextProviderProps = {
	children: React.ReactNode;
};

export const ContextProvider = ({children}: ContextProviderProps) => {
	const [state, setStateWithoutHistory] = useState<EditorState>(() =>
		getInitialState(),
	);

	const imperativeState = useRef(state);
	imperativeState.current = state;

	const loadAssetsFromCache = useCallback(
		async (assets: Record<string, EditorStarterAsset>) => {
			const keys = await getKeys();
			const assetIds = Object.keys(assets);

			for (const assetId of assetIds) {
				const isDownloaded = keys.includes(assetId);
				if (isDownloaded) {
					await loadToBlobUrlOnce(assets[assetId]);
				}
			}
		},
		[],
	);

	const initialize = useCallback(async () => {
		// 1. Supabase 초기 상태 확인 (EditorNew 페이지에서 설정)
		const supabaseInitialState = loadAndClearSupabaseInitialState();
		if (supabaseInitialState) {
			await loadAssetsFromCache(supabaseInitialState.assets);
			const assetStatus = await createAssetStatusFromUndoableState(supabaseInitialState);
			const updatedAssetStatus = updateAssetStatusAfterCleanup(
				assetStatus,
				supabaseInitialState,
			);
		setStateWithoutHistory((prev) => ({
			...prev,
			undoableState: supabaseInitialState,
			assetStatus: updatedAssetStatus,
			initialized: true,
			loop: loadLoop(),
			timelineHeight: loadTimelineHeight(),
			isSnappingEnabled: loadSnappingEnabled(),
			isSkimmingEnabled: loadSkimmingEnabled(),
		}));
		return;
	}

	if (!FEATURE_SAVE_BUTTON) {
		setStateWithoutHistory((prev) => ({
			...prev,
			initialized: true,
			loop: loadLoop(),
			timelineHeight: loadTimelineHeight(),
			isSnappingEnabled: loadSnappingEnabled(),
			isSkimmingEnabled: loadSkimmingEnabled(),
		}));
		return;
	}

		const loadedStateFromUrl = getStateFromUrl();

		const loadedState = loadedStateFromUrl ?? loadState();
	if (!loadedState) {
		setStateWithoutHistory((prev) => ({
			...prev,
			initialized: true,
			loop: loadLoop(),
			timelineHeight: loadTimelineHeight(),
			isSnappingEnabled: loadSnappingEnabled(),
			isSkimmingEnabled: loadSkimmingEnabled(),
		}));
		return;
	}

	if (loadedStateFromUrl) {
			window.history.replaceState({}, '', window.location.pathname);
		}

		await loadAssetsFromCache(loadedState.assets);

		const assetStatus = await createAssetStatusFromUndoableState(loadedState);

		// cleanup 후 asset status 업데이트 (삭제된 asset의 status 제거)
		const updatedAssetStatus = updateAssetStatusAfterCleanup(
			assetStatus,
			loadedState,
		);

		setStateWithoutHistory((prev) => ({
			...prev,
			undoableState: loadedState,
			assetStatus: updatedAssetStatus,
			initialized: true,
			loop: loadLoop(),
			timelineHeight: loadTimelineHeight(),
		}));
	}, [loadAssetsFromCache]);

	useEffect(() => {
		// eslint-disable-next-line no-console
		initialize().catch(console.error);
	}, [initialize]);

	const {undo, redo, pushHistory, canUndo, canRedo} = useUndoRedo(
		setStateWithoutHistory,
	);

	const isItemBeingTrimmed = state.itemsBeingTrimmed.length > 0;

	const durationInFrames = useMemo(() => {
		return getCompositionDuration(Object.values(state.undoableState.items));
	}, [state.undoableState.items]);

	const lastDurationWhileNotTrimming = useRef(durationInFrames);
	if (!isItemBeingTrimmed) {
		lastDurationWhileNotTrimming.current = durationInFrames;
	}

	const setStateWithPossibleStrictModeDoubleTrigger: SetState = useCallback(
		({update, commitToUndoStack}) => {
			setStateWithoutHistory((prev) => {
				const newState = typeof update === 'function' ? update(prev) : update;

				if (commitToUndoStack) {
					pushHistory(newState.undoableState);
				}

				if (newState === prev) {
					return prev;
				}

				return newState;
			});
		},
		[pushHistory],
	);

	const setState: SetState = useCallback(
		({update, commitToUndoStack}) => {
			// undo stack은 state가 reference로 변경되었는지 확인합니다.
			// state를 변경하고 undo stack에 commit하는 action이 있으면,
			// strict mode double trigger로 인해 state가 두 번 변경될 수 있습니다.

			// 이를 방지하기 위해 먼저 state를 변경합니다 (가능하면 두 번).
			// 그 다음 state를 변경하지 않고 undo stack에 commit합니다.

			setStateWithPossibleStrictModeDoubleTrigger({
				update,
				commitToUndoStack: false,
			});
			if (commitToUndoStack) {
				setStateWithPossibleStrictModeDoubleTrigger({
					update: (s) => s,
					commitToUndoStack: true,
				});
			}
		},
		[setStateWithPossibleStrictModeDoubleTrigger],
	);

	const readContext = useMemo(
		(): TimelineContext => ({
			// trimming이 완료된 후에만 timeline을 다시 그립니다.
			durationInFrames: lastDurationWhileNotTrimming.current,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[lastDurationWhileNotTrimming.current],
	);

	const fpsContext = useMemo(
		(): FpsContext => ({
			fps: state.undoableState.fps,
		}),
		[state.undoableState.fps],
	);

	const dimensionsContext = useMemo(
		(): DimensionsContext => ({
			compositionWidth: state.undoableState.compositionWidth,
			compositionHeight: state.undoableState.compositionHeight,
		}),
		[
			state.undoableState.compositionWidth,
			state.undoableState.compositionHeight,
		],
	);

	const selectedItemsContext = useMemo(
		(): SelectedItemsContext => ({
			selectedItems: state.selectedItems,
		}),
		[state.selectedItems],
	);

	const assetsContext = useMemo(
		(): AssetsContext => ({
			assets: state.undoableState.assets,
		}),
		[state.undoableState.assets],
	);

	const assetStatusContext = useMemo(
		(): AssetStatusContext => ({
			assetStatus: state.assetStatus,
		}),
		[state.assetStatus],
	);

	const tracksContext = useMemo(
		(): TracksContext => ({
			tracks: state.undoableState.tracks,
		}),
		[state.undoableState.tracks],
	);

	const writeContext = useMemo(
		(): TimelineWriteOnlyContext => ({
			setState,
			undo,
			redo,
		}),
		[setState, undo, redo],
	);

	const canUseUndoStackContext = useMemo(
		(): CanUseUndoStackContext => ({
			canUndo,
			canRedo,
		}),
		[canUndo, canRedo],
	);

	const currentStateContext = useMemo(
		(): CurrentStateContext => ({
			state: imperativeState,
		}),
		[imperativeState],
	);

	const allItemsContext = useMemo(
		(): AllItemsContext => ({
			items: state.undoableState.items,
		}),
		[state.undoableState.items],
	);

	const textItemHoverPreviewContext = useMemo(
		(): TextItemHoverPreview | null => state.textItemHoverPreview,
		[state.textItemHoverPreview],
	);

	const renderingContext = useMemo(
		(): RenderingTask[] => state.renderingTasks,
		[state.renderingTasks],
	);

	const captionStateContext = useMemo(
		(): CaptioningTask[] => state.captioningTasks,
		[state.captioningTasks],
	);

	const itemsBeingTrimmedContext = useMemo(
		(): ItemBeingTrimmed[] => state.itemsBeingTrimmed,
		[state.itemsBeingTrimmed],
	);

	const activeTimelineSnapContext = useMemo(
		(): ActiveTimelineSnap => ({
			activeSnapPoint: state.activeSnapPoint,
		}),
		[state.activeSnapPoint],
	);

	const [showHorizontalGuide, setShowHorizontalGuide] = useState(false);
	const [showVerticalGuide, setShowVerticalGuide] = useState(false);

	const centerSnapContext = useMemo(
		(): CenterSnapGuides => ({
			showHorizontalGuide,
			showVerticalGuide,
			setShowHorizontalGuide,
			setShowVerticalGuide,
		}),
		[showHorizontalGuide, showVerticalGuide],
	);

	// 이렇게 깊게 중첩된 context provider가 있는 이유:
	// https://remotion.dev/docs/editor-starter/state-management#contexts
	return (
		<TimelineContext.Provider value={readContext}>
			<TimelineWriteOnlyContext.Provider value={writeContext}>
				<FpsContext.Provider value={fpsContext}>
					<DimensionsContext.Provider value={dimensionsContext}>
						<SelectedItemsContext.Provider value={selectedItemsContext}>
							<AssetsContext.Provider value={assetsContext}>
								<AssetStatusContext.Provider value={assetStatusContext}>
									<TracksContext.Provider value={tracksContext}>
										<FullStateContext.Provider value={state}>
											<CanUseUndoStackContext.Provider
												value={canUseUndoStackContext}
											>
												<CurrentStateContext.Provider
													value={currentStateContext}
												>
													<AllItemsContext.Provider value={allItemsContext}>
														<TextItemEditingContext.Provider
															value={state.textItemEditing}
														>
															<TextItemHoverPreviewContext.Provider
																value={textItemHoverPreviewContext}
															>
																<RenderingContext.Provider
																	value={renderingContext}
																>
																	<CaptionStateContext.Provider
																		value={captionStateContext}
																	>
																		<StateInitializedContext.Provider
																			value={state.initialized}
																		>
																			<ItemsBeingTrimmedContext.Provider
																				value={itemsBeingTrimmedContext}
																			>
																				<LoopContext.Provider
																					value={state.loop}
																				>
																					<TimelineHeightContext.Provider
																						value={state.timelineHeight}
																					>
																						<ActiveTimelineSnapContext.Provider
																							value={activeTimelineSnapContext}
																						>
																							<CenterSnapContext.Provider
																								value={centerSnapContext}
																							>
																								<EditModeProvider>
																									<DragPreviewProvider>
																										<TimelineZoomProvider>
																											<ItemSelectedForCropContext.Provider
																												value={state.itemSelectedForCrop}
																											>
																												{children}
																											</ItemSelectedForCropContext.Provider>
																										</TimelineZoomProvider>
																									</DragPreviewProvider>
																								</EditModeProvider>
																							</CenterSnapContext.Provider>
																						</ActiveTimelineSnapContext.Provider>
																					</TimelineHeightContext.Provider>
																				</LoopContext.Provider>
																			</ItemsBeingTrimmedContext.Provider>
																		</StateInitializedContext.Provider>
																	</CaptionStateContext.Provider>
																</RenderingContext.Provider>
															</TextItemHoverPreviewContext.Provider>
														</TextItemEditingContext.Provider>
													</AllItemsContext.Provider>
												</CurrentStateContext.Provider>
											</CanUseUndoStackContext.Provider>
										</FullStateContext.Provider>
									</TracksContext.Provider>
								</AssetStatusContext.Provider>
							</AssetsContext.Provider>
						</SelectedItemsContext.Provider>
					</DimensionsContext.Provider>
				</FpsContext.Provider>
			</TimelineWriteOnlyContext.Provider>
		</TimelineContext.Provider>
	);
};
