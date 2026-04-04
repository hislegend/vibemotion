import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {toast} from 'sonner';
import {FEATURE_VISUAL_FADE_CONTROL} from '../../flags';
import {AudioItem} from '../../items/audio/audio-item-type';
import {EditorStarterItem} from '../../items/item-type';
import {VideoItem} from '../../items/video/video-item-type';
import {VideoAsset} from '../../assets/assets';
import {TRACK_PADDING} from '../../state/items';
import {getCanFadeVisual} from '../../utils/fade';
import {
	getItemLeftOffset,
	getItemRoundedPosition,
	getItemWidth,
} from '../../utils/position-utils';
import {useAssets, useSelectedItems, useWriteContext} from '../../utils/use-context';
import {useFadeControlHoverState} from '../../utils/use-fade-control-hover-state';
import {useTimelineSize} from '../utils/use-timeline-size';
import {TimelineItemContent} from './timeline-item-content';
import {ItemContextMenuTrigger} from './timeline-item-context-menu-trigger';
import {TimelineItemExtendHandles} from './timeline-item-extend-handles/timeline-item-extend-handles';
import {ItemFadeHandles} from './timeline-item-fade-control/item-fade-handles';
import {shouldShowAudioFadeControl} from './timeline-item-fade-control/should-show-audio-fade-control';
import {TimelineItemIsBeingTrimmedIndicator} from './timeline-item-is-being-trimmed-indicator';
import {TimelineItemContainer} from './timeline-item-layout';
import {getWaveformHeight} from './timeline-item-waveform';
import {ContinueVideoMask} from './continue-video-mask';
import {addItem} from '../../state/actions/add-item';
import {addAssetToState} from '../../state/actions/add-asset-to-state';
import {generateRandomId} from '../../utils/generate-random-id';
import {getVideoMetadata} from '@/utils/videoFrameExtractor';
import {setLocalUrl} from '../../caching/load-to-blob-url';
import {cacheAssetLocally} from '../../caching/indexeddb';

type TimelineItemProps = {
	item: EditorStarterItem;
	visibleFrames: number;
	top: number;
	height: number;
	trackMuted: boolean;
};

const TimelineItemInner = memo(
	({item, visibleFrames, top, height, trackMuted}: TimelineItemProps) => {
		const {timelineWidth} = useTimelineSize();
		const {setState} = useWriteContext();
		const {assets} = useAssets();
		
		if (timelineWidth === null) {
			throw new Error('Timeline width is null');
		}

		const {selectedItems} = useSelectedItems();

		const timelineItemWidth = getItemWidth({
			itemDurationInFrames: item.durationInFrames,
			timelineWidth,
			totalDurationInFrames: visibleFrames,
		});

		const timelineItemLeft = getItemLeftOffset({
			timelineWidth,
			totalDurationInFrames: visibleFrames,
			from: item.from,
		});

		const pixelsPerFrame = timelineWidth / visibleFrames;

		const {roundedLeft, width, roundedDifference} = getItemRoundedPosition(
			timelineItemLeft,
			timelineItemWidth,
		);

		const style: React.CSSProperties = useMemo(() => {
			return {
				width,
				left: roundedLeft,
				top: top + TRACK_PADDING / 2,
				height: height - TRACK_PADDING,
				position: 'absolute',
			};
		}, [width, roundedLeft, top, height]);

		const isSelected = selectedItems.includes(item.id);
		const hoverRef = useRef<HTMLDivElement | null>(null);
		const hover = useFadeControlHoverState(
			hoverRef,
			getWaveformHeight({item, trackHeight: height}),
		);

		const itemWidthPx = item.durationInFrames * pixelsPerFrame;

		// 비디오 아이템용: 이어서 만들기 핸들러
		const isVideoItem = item.type === 'video';
		const videoItem = isVideoItem ? (item as VideoItem) : null;
		const videoAsset = videoItem ? (assets[videoItem.assetId] as VideoAsset | undefined) : null;
		
		const handleContinueVideoGenerated = useCallback(async (
			videoUrl: string,
			sourceAssetId: string,
			placeAfterFrame: number
		) => {
			try {
				// 영상 메타데이터 가져오기
				const metadata = await getVideoMetadata(videoUrl);
				const fps = 30;
				const durationInFrames = Math.round(metadata.duration * fps);
				
				const newAssetId = generateRandomId(8);
				
				// Blob으로 캐싱 시도
				try {
					const response = await fetch(videoUrl);
					if (response.ok) {
						const blob = await response.blob();
						await cacheAssetLocally({ assetId: newAssetId, value: blob });
						const blobUrl = URL.createObjectURL(blob);
						setLocalUrl(newAssetId, blobUrl);
					}
				} catch (cacheError) {
					console.warn('Failed to cache video locally:', cacheError);
				}
				
				const newVideoAsset: VideoAsset = {
					id: newAssetId,
					type: 'video',
					durationInSeconds: metadata.duration,
					hasAudioTrack: true,
					width: metadata.width,
					height: metadata.height,
					filename: `continued_video_${Date.now()}.mp4`,
					remoteUrl: videoUrl,
					remoteFileKey: null,
					size: 0,
					mimeType: 'video/mp4',
				};

				// 원본 비디오 아이템의 크기와 위치 참조
				const sourceVideoItem = videoItem;
				
				const newVideoItem: VideoItem = {
					id: generateRandomId(8),
					type: 'video',
					from: placeAfterFrame,
					durationInFrames,
					videoStartFromInSeconds: 0,
					// 원본 아이템의 크기와 위치 사용
					top: sourceVideoItem ? sourceVideoItem.top : 0,
					left: sourceVideoItem ? sourceVideoItem.left : 0,
					width: sourceVideoItem ? sourceVideoItem.width : metadata.width,
					height: sourceVideoItem ? sourceVideoItem.height : metadata.height,
					opacity: 1,
					decibelAdjustment: 0,
					playbackRate: 1,
					audioFadeInDurationInSeconds: 0,
					audioFadeOutDurationInSeconds: 0,
					fadeInDurationInSeconds: 0,
					fadeOutDurationInSeconds: 0,
					assetId: newAssetId,
					isDraggingInTimeline: false,
					keepAspectRatio: true,
					borderRadius: 0,
					rotation: 0,
				};

				setState({
					update: (state) => {
						const newState = addAssetToState({state, asset: newVideoAsset});
						return addItem({
							state: newState,
							item: newVideoItem,
							select: true,
							position: {type: 'back'},
						});
					},
					commitToUndoStack: true,
				});

				toast.success('이어서 만든 영상이 트랙에 추가되었습니다');
			} catch (error) {
				console.error('Failed to add continued video:', error);
				toast.error('영상 추가 실패');
			}
		}, [setState]);

		return (
			<ItemContextMenuTrigger item={item}>
				<div ref={hoverRef} style={style}>
					<TimelineItemContainer isSelected={isSelected} item={item}>
						<TimelineItemContent
							item={item}
							height={height}
							width={width}
							roundedDifference={roundedDifference}
							trackMuted={trackMuted}
						/>
						<TimelineItemIsBeingTrimmedIndicator item={item} side="left" />
						<TimelineItemIsBeingTrimmedIndicator item={item} side="right" />
					</TimelineItemContainer>
					<TimelineItemExtendHandles
						item={item}
						width={width}
						timelineWidth={timelineWidth}
						height={height}
					/>
					{shouldShowAudioFadeControl({item}) ? (
						<ItemFadeHandles
							item={item as AudioItem | VideoItem}
							width={itemWidthPx}
							itemHeight={height}
							hovered={hover === 'audio-section'}
							fadeType="audio"
						/>
					) : null}
					{getCanFadeVisual(item) && FEATURE_VISUAL_FADE_CONTROL ? (
						<ItemFadeHandles
							item={item}
							width={itemWidthPx}
							itemHeight={height}
							hovered={hover === 'video-section'}
							fadeType="visual"
						/>
					) : null}
					{/* 비디오 아이템용 이어서 만들기 마스크 */}
					{isVideoItem && videoItem && videoAsset && (
						<ContinueVideoMask
							item={videoItem}
							asset={videoAsset}
							itemHeight={height - TRACK_PADDING}
							onVideoGenerated={handleContinueVideoGenerated}
						/>
					)}
				</div>
			</ItemContextMenuTrigger>
		);
	},
);

export const TimelineItem = memo(
	({
		item,
		visibleFrames,
		top,
		height,
		trackMuted,
	}: {
		item: EditorStarterItem;
		visibleFrames: number;
		top: number;
		height: number;
		trackMuted: boolean;
	}) => {
		// drag 중인 item은 숨기기
		if (item.isDraggingInTimeline) {
			return null;
		}

		return (
			<TimelineItemInner
				item={item}
				visibleFrames={visibleFrames}
				top={top}
				height={height}
				trackMuted={trackMuted}
			/>
		);
	},
);
