import {PlayerRef} from '@remotion/player';
import React, {useCallback, useContext, useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {addAsset, DropPosition} from './assets/add-asset';
import {CANVAS_PADDING} from './canvas/canvas';
import {CanvasSizeContext} from './canvas/canvas-size';
import {
	FEATURE_DROP_ASSETS_ON_CANVAS,
	FEATURE_DROP_ASSETS_ON_TIMELINE,
} from './flags';
import {PreviewSizeContext} from './preview-size';
import {calculateScale} from './utils/calculate-canvas-transformation';
import {useCurrentStateAsRef, useWriteContext} from './utils/use-context';

export const DropHandler: React.FC<{
	children: React.ReactNode;
	playerRef: React.RefObject<PlayerRef | null>;
	compositionHeight: number;
	compositionWidth: number;
	context: 'canvas' | 'timeline';
}> = ({children, playerRef, compositionHeight, compositionWidth, context}) => {
	const size = useContext(CanvasSizeContext);
	const {size: previewSize} = useContext(PreviewSizeContext);
	const timelineWriteContext = useWriteContext();
	const stateAsRef = useCurrentStateAsRef();

	const onDragOver: React.DragEventHandler = useCallback(
		(e) => {
			if (!FEATURE_DROP_ASSETS_ON_TIMELINE && context === 'timeline') {
				return;
			}

			if (!FEATURE_DROP_ASSETS_ON_CANVAS && context === 'canvas') {
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			e.dataTransfer.dropEffect = 'copy';
		},
		[context],
	);

	const onDrop: React.DragEventHandler = useCallback(
		async (e) => {
			if (!FEATURE_DROP_ASSETS_ON_TIMELINE && context === 'timeline') {
				return;
			}

			if (!FEATURE_DROP_ASSETS_ON_CANVAS && context === 'canvas') {
				return;
			}
			e.preventDefault();

			// 에셋 패널에서 드래그된 에셋 처리
			const assetId = e.dataTransfer.getData('application/x-asset-id');
			if (assetId && context === 'timeline') {
				const state = stateAsRef.current;
				const asset = state.undoableState.assets[assetId];
				if (asset) {
					const currentFrame = playerRef.current?.getCurrentFrame() ?? 0;
					const fps = state.undoableState.fps;
					const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

					let newItem: any = null;

					if (asset.type === 'video') {
						const durationInFrames = Math.floor(asset.durationInSeconds * fps);
						newItem = {
							id: itemId,
							type: 'video' as const,
							assetId: asset.id,
							from: currentFrame,
							durationInFrames,
							videoStartFromInSeconds: 0,
							top: 0,
							left: 0,
							width: compositionWidth,
							height: compositionHeight,
							opacity: 1,
							borderRadius: 0,
							rotation: 0,
							decibelAdjustment: 0,
							playbackRate: 1,
							audioFadeInDurationInSeconds: 0,
							audioFadeOutDurationInSeconds: 0,
							fadeInDurationInSeconds: 0,
							fadeOutDurationInSeconds: 0,
							isDraggingInTimeline: false,
							keepAspectRatio: true,
						};
					} else if (asset.type === 'audio') {
						const durationInFrames = Math.floor(asset.durationInSeconds * fps);
						newItem = {
							id: itemId,
							type: 'audio' as const,
							assetId: asset.id,
							from: currentFrame,
							durationInFrames,
							audioStartFromInSeconds: 0,
							decibelAdjustment: 0,
							playbackRate: 1,
							audioFadeInDurationInSeconds: 0,
							audioFadeOutDurationInSeconds: 0,
							isDraggingInTimeline: false,
						};
					} else if (asset.type === 'image') {
						const durationInFrames = fps * 2; // 이미지 기본 2초
						newItem = {
							id: itemId,
							type: 'image' as const,
							assetId: asset.id,
							from: currentFrame,
							durationInFrames,
							top: 0,
							left: 0,
							width: compositionWidth,
							height: compositionHeight,
							opacity: 1,
							borderRadius: 0,
							rotation: 0,
							isDraggingInTimeline: false,
							keepAspectRatio: true,
							fadeInDurationInSeconds: 0,
							fadeOutDurationInSeconds: 0,
						};
					}

					if (newItem) {
						const {addItem} = await import('./state/actions/add-item');
						timelineWriteContext.setState({
							update: (state) => addItem({state, item: newItem, select: true, position: {type: 'back'}}),
							commitToUndoStack: true,
						});
					}
				}
				e.dataTransfer.clearData();
				return;
			}

			const {current} = playerRef;
			if (!current) {
				throw new Error('playerRef is null');
			}

			let dropPosition: DropPosition | null = null;
			if (context === 'canvas') {
				const containerNode = current.getContainerNode();
				if (!containerNode) {
					throw new Error('containerNode is null');
				}

				const playerRect = containerNode.getBoundingClientRect();
				if (!size) {
					throw new Error('size is null');
				}

				const scale = calculateScale({
					canvasSize: size,
					compositionHeight,
					compositionWidth,
					previewSize: previewSize.size,
				});
				const dropPositionX = Math.round((e.clientX - playerRect.left) / scale);
				const dropPositionY = Math.round((e.clientY - playerRect.top) / scale);
				dropPosition = {x: dropPositionX, y: dropPositionY};
			} else {
				dropPosition = null;
			}

			const state = stateAsRef.current;
			const tracks = state.undoableState.tracks;
			const fps = state.undoableState.fps;

			const uploadPromises = [];
			for (const file of e.dataTransfer.files) {
				uploadPromises.push(
					addAsset({
						file,
						compositionHeight,
						compositionWidth,
						tracks: tracks,
						fps,
						timelineWriteContext: timelineWriteContext,
						playerRef,
						dropPosition,
						filename: file.name,
					}),
				);
			}
			await Promise.all(uploadPromises);

			e.dataTransfer.clearData();
		},
		[
			compositionHeight,
			compositionWidth,
			context,
			playerRef,
			previewSize.size,
			size,
			timelineWriteContext,
			stateAsRef,
		],
	);

	const style = useMemo(() => {
		if (context === 'canvas') {
			return {
				padding: CANVAS_PADDING,
			};
		}

		return {};
	}, [context]);

	return (
		<AbsoluteFill onDragOver={onDragOver} onDrop={onDrop} style={style}>
			{children}
		</AbsoluteFill>
	);
};
