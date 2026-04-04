import {useCallback, useMemo, useState} from 'react';
import {toast} from 'sonner';
import {copyToClipboard} from '../../clipboard/copy-to-clipboard';
import {ContextMenuItem, ContextMenuSeparator} from '../../context-menu';
import {
	FEATURE_BRING_TO_FRONT,
	FEATURE_COPY_LAYERS,
	FEATURE_CUT_LAYERS,
	FEATURE_DUPLICATE_LAYERS,
	FEATURE_SEND_TO_BACK,
} from '../../flags';
import {EditorStarterItem} from '../../items/item-type';
import {VideoItem} from '../../items/video/video-item-type';
import {ImageItem} from '../../items/image/image-item-type';
import {bringToFrontOrBack} from '../../state/actions/bring-item-to-front-or-back';
import {cutItems} from '../../state/actions/cut-items';
import {duplicateItems} from '../../state/actions/duplicate-items';
import {addItem} from '../../state/actions/add-item';
import {changeItem} from '../../state/actions/change-item';
import {AudioAsset, ImageAsset, VideoAsset} from '../../assets/assets';
import {AudioItem} from '../../items/audio/audio-item-type';
import {generateRandomId} from '../../utils/generate-random-id';
import {extractAudioFromVideo} from '@/utils/audioExtractor';
import {extractFrameAtTime, getVideoMetadata} from '@/utils/videoFrameExtractor';
import {usePreferredLocalUrl} from '../../utils/find-asset-by-id';
import {setLocalUrl} from '../../caching/load-to-blob-url';
import {cacheAssetLocally} from '../../caching/indexeddb';
import {MIN_VOLUME_DB} from '../../utils/decibels';
import {
	useAllItems,
	useAssets,
	useDimensions,
	useFps,
	useSelectedItems,
	useWriteContext,
} from '../../utils/use-context';
import {usePlayerRef} from '../../contexts/player-ref-context';
import {EditorImageEditDialog} from '../../dialogs/image-edit-dialog';
import {EditorVideoGenerateDialog} from '../../dialogs/video-generate-dialog';
import {addAssetToState} from '../../state/actions/add-asset-to-state';

export const TimelineItemContextMenu: React.FC<{
	item: EditorStarterItem;
}> = ({item}) => {
	const {setState} = useWriteContext();
	const {selectedItems} = useSelectedItems();
	const {items: allItems} = useAllItems();
	const {assets} = useAssets();
	const {fps} = useFps();
	const playerRef = usePlayerRef();
	const currentFrame = playerRef.current?.getCurrentFrame() ?? 0;
	const [isExtractingAudio, setIsExtractingAudio] = useState(false);
	const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
	const [videoDialogImageUrl, setVideoDialogImageUrl] = useState<string | null>(null);
	const [videoDialogAssetId, setVideoDialogAssetId] = useState<string | null>(null);
	const [videoDialogEndImageUrl, setVideoDialogEndImageUrl] = useState<string | undefined>(undefined);

	// 비디오 아이템인지 확인
	const isVideoItem = item.type === 'video';
	const videoItem = isVideoItem ? (item as VideoItem) : null;
	const videoAsset = videoItem ? assets[videoItem.assetId] : null;
	
	// 이미지 아이템인지 확인
	const isImageItem = item.type === 'image';
	const imageItem = isImageItem ? (item as ImageItem) : null;
	const imageAsset = imageItem ? assets[imageItem.assetId] : null;

	// 여러 item에 대해 작업할지 결정:
	// - 여러 item이 선택되어 있고
	// - 우클릭한 item이 해당 선택에 포함되어 있는 경우
	const isMultiSelection = useMemo(
		() => selectedItems.length > 1 && selectedItems.includes(item.id),
		[selectedItems, item.id],
	);

	// copy/cut/duplicate의 경우: 조건이 충족되면 선택된 모든 item에 대해 작업,
	// 그렇지 않으면 우클릭한 item에만 작업
	const targetItems = useMemo(() => {
		return isMultiSelection ? selectedItems.map((id) => allItems[id]) : [item];
	}, [isMultiSelection, selectedItems, item, allItems]);

	// layer 순서 변경 작업은 항상 개별
	// 우클릭한 item에만 작동하며, 선택된 것들에는 적용되지 않음
	const handleBringToFront = useCallback(
		(e: Event) => {
			e.stopPropagation();
			setState({
				update: (state) =>
					bringToFrontOrBack({
						state,
						itemId: item.id, // 항상 우클릭한 item
						position: 'front',
					}),
				commitToUndoStack: true,
			});
		},
		[item.id, setState],
	);

	const handleSendToBack = useCallback(
		(e: Event) => {
			e.stopPropagation();
			setState({
				update: (state) =>
					bringToFrontOrBack({
						state,
						itemId: item.id, // 항상 우클릭한 item
						position: 'back',
					}),
				commitToUndoStack: true,
			});
		},
		[item.id, setState],
	);

	const handleCopy = useCallback(
		(e: Event) => {
			e.stopPropagation();
			copyToClipboard(targetItems);
		},
		[targetItems],
	);

	const handleCut = useCallback(
		(e: Event) => {
			e.stopPropagation();
			copyToClipboard(targetItems);
			setState({
				update: (state) =>
					cutItems(
						state,
						targetItems.map((targetItem) => targetItem.id),
					),
				commitToUndoStack: true,
			});
		},
		[targetItems, setState],
	);
	const handleDuplicate = useCallback(
		(e: Event) => {
			e.stopPropagation();
			setState({
				update: (state) =>
					duplicateItems(
						state,
						targetItems.map((targetItem) => targetItem.id),
					),
				commitToUndoStack: true,
			});
		},
		[targetItems, setState],
	);

	const handleContextMenuPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			e.stopPropagation();
		},
		[],
	);

	// 오디오 추출을 위한 비디오 URL 가져오기
	const VideoAssetUrlComponent: React.FC<{
		onExtract: (url: string) => void;
	}> = ({onExtract}) => {
		const url = usePreferredLocalUrl(videoAsset!);
		return (
			<ContextMenuItem
				className="flex items-center gap-3"
				onSelect={(e) => {
					e.preventDefault();
					onExtract(url);
				}}
				onPointerDown={handleContextMenuPointerDown}
				disabled={isExtractingAudio}
			>
				{isExtractingAudio ? '🔄 추출 중...' : '🔊 오디오 추출'}
			</ContextMenuItem>
		);
	};

	const handleExtractAudio = useCallback(
		async (videoUrl: string) => {
			if (!videoItem || !videoAsset || videoAsset.type !== 'video') return;

			setIsExtractingAudio(true);
			try {
				// 트림 정보 계산: 비디오의 트림된 구간만 오디오로 추출
				const trimStartSeconds = videoItem.videoStartFromInSeconds || 0;
				const trimmedDurationInSeconds = videoItem.durationInFrames / fps;
				const trimEndSeconds = trimStartSeconds + trimmedDurationInSeconds;
				
				// 1. 비디오에서 트림된 구간의 오디오만 추출 (WAV Blob)
				const wavBlob = await extractAudioFromVideo(videoUrl, trimStartSeconds, trimEndSeconds);

				// 2. Blob URL 생성
				const blobUrl = URL.createObjectURL(wavBlob);

				// 3. AudioAsset 생성
				const assetId = generateRandomId(8);
				
			// 4. 로컬 캐시에 URL 등록 (핵심! 이게 없으면 오디오가 재생되지 않음)
			setLocalUrl(assetId, blobUrl);
			
			// 5. IndexedDB에 Blob 저장 (내보내기용 - 이게 없으면 업로드 실패)
			await cacheAssetLocally({ assetId, value: wavBlob });
			
			// AudioAsset: 이미 트림된 오디오이므로 트림된 길이를 사용
			const audioAsset: AudioAsset = {
				id: assetId,
				type: 'audio',
				durationInSeconds: trimmedDurationInSeconds,
				filename: `${videoAsset.filename.replace(/\.[^/.]+$/, '')}_audio.wav`,
				remoteUrl: null,
				remoteFileKey: null,
				size: wavBlob.size,
				mimeType: 'audio/wav',
			};

				// 6. AudioItem 생성 (비디오와 같은 위치에서 시작)
				// audioStartFromInSeconds는 0: 이미 트림된 오디오이므로 처음부터 재생
				const audioItemId = generateRandomId(8);
				const audioItem: AudioItem = {
					id: audioItemId,
					type: 'audio',
					from: videoItem.from,
					durationInFrames: videoItem.durationInFrames,
					audioStartFromInSeconds: 0,
					top: 0,
					left: 0,
					width: 100,
					height: 100,
					opacity: 1,
					decibelAdjustment: 0,
					playbackRate: 1,
					audioFadeInDurationInSeconds: 0,
					audioFadeOutDurationInSeconds: 0,
					assetId: assetId,
					isDraggingInTimeline: false,
				};

				// 6. 상태에 추가 + 원본 비디오 음소거
				setState({
					update: (state) => {
						// asset 추가
						let newState = {
							...state,
							undoableState: {
								...state.undoableState,
								assets: {
									...state.undoableState.assets,
									[audioAsset.id]: audioAsset,
								},
							},
						};
						
						// 원본 비디오에서 오디오 완전 제거 (볼륨 조절이 아닌 오디오 제거 상태로 표시)
						newState = changeItem(newState, videoItem.id, (i) => ({
							...i,
							audioRemoved: true,
						}));
						
						// item 추가
						return addItem({
							state: newState,
							item: audioItem,
							select: true,
							position: {type: 'back'},
						});
					},
					commitToUndoStack: true,
				});

				toast.success('오디오가 추출되어 트랙에 추가되었습니다.');
			} catch (error) {
				console.error('오디오 추출 실패:', error);
				toast.error('오디오 추출에 실패했습니다.');
			} finally {
				setIsExtractingAudio(false);
			}
		},
		[videoItem, videoAsset, setState, fps],
	);

	// 오디오 복구 핸들러 (영상에서 오디오 다시 활성화)
	const handleRestoreAudio = useCallback(() => {
		if (!videoItem) return;
		
		setState({
			update: (state) => 
				changeItem(state, videoItem.id, (i) => ({
					...i,
					audioRemoved: false,
				})),
			commitToUndoStack: true,
		});
		
		toast.success('비디오 오디오가 복구되었습니다.');
	}, [videoItem, setState]);

	// 영상 생성 완료 후 트랙에 추가
	const handleVideoGenerated = useCallback(
		async (videoUrl: string, sourceAssetId: string) => {
			try {
				const metadata = await getVideoMetadata(videoUrl);
				const durationInFrames = Math.round(metadata.duration * fps);
				
				const newAssetId = generateRandomId(8);
				
				// Blob으로 캐싱 시도
				try {
					const response = await fetch(videoUrl);
					if (response.ok) {
						const blob = await response.blob();
						await cacheAssetLocally({assetId: newAssetId, value: blob});
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
					filename: `generated_video_${Date.now()}.mp4`,
					remoteUrl: videoUrl,
					remoteFileKey: null,
					size: 0,
					mimeType: 'video/mp4',
				};

				// 원본 아이템의 바로 위 트랙에, 원본 위치에 배치
				const newVideoItem: VideoItem = {
					id: generateRandomId(8),
					type: 'video',
					from: item.from,
					durationInFrames,
					videoStartFromInSeconds: 0,
					top: 0,
					left: 0,
					width: 100,
					height: 100,
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
							position: {type: 'front'},
						});
					},
					commitToUndoStack: true,
				});

				toast.success('생성된 영상이 트랙에 추가되었습니다');
				setIsVideoDialogOpen(false);
			} catch (error) {
				console.error('Failed to add generated video:', error);
				toast.error('영상 추가 실패');
			}
		},
		[item.from, fps, setState],
	);

	// 이미지 아이템에서 영상 생성을 위한 컴포넌트
	const ImageVideoGenerateComponent: React.FC<{
		onGenerate: (url: string) => void;
	}> = ({onGenerate}) => {
		const url = usePreferredLocalUrl(imageAsset!);
		return (
			<ContextMenuItem
				className="flex items-center gap-3"
				onSelect={(e) => {
					e.preventDefault();
					onGenerate(url);
				}}
				onPointerDown={handleContextMenuPointerDown}
			>
				🎬 영상 생성하기
			</ContextMenuItem>
		);
	};

	// 비디오 아이템에서 현재 프레임(플레이헤드) 기반 영상 생성을 위한 컴포넌트
	const VideoFrameGenerateComponent: React.FC<{
		onGenerate: (url: string) => void;
		currentFrame: number;
	}> = ({onGenerate, currentFrame}) => {
		const url = usePreferredLocalUrl(videoAsset!);
		const [isExtracting, setIsExtracting] = useState(false);
		
		const handleClick = async () => {
			if (isExtracting || !videoItem) return;
			
			// 플레이헤드가 이 비디오 아이템 범위 내에 있는지 확인
			const itemStart = videoItem.from;
			const itemEnd = videoItem.from + videoItem.durationInFrames;
			
			if (currentFrame < itemStart || currentFrame >= itemEnd) {
				toast.error('플레이헤드를 이 클립 위로 옮긴 다음 다시 시도해 주세요');
				return;
			}
			
			setIsExtracting(true);
			try {
				// 플레이헤드 위치에서 프레임 추출
				const frameWithinItem = currentFrame - itemStart;
				const timeWithinItem = frameWithinItem / fps;
				// playbackRate 2x = 타임라인 1초에 원본 2초 소비 → *로 매핑
				const targetTimeInSeconds = (videoItem.videoStartFromInSeconds || 0) + 
					timeWithinItem * (videoItem.playbackRate || 1);
				
				const frameBase64 = await extractFrameAtTime(url, Math.max(0, targetTimeInSeconds));
				onGenerate(frameBase64);
			} catch (error) {
				console.error('Failed to extract frame:', error);
				toast.error('프레임 추출 실패');
			} finally {
				setIsExtracting(false);
			}
		};
		
		return (
			<ContextMenuItem
				className="flex items-center gap-3"
				onSelect={(e) => {
					e.preventDefault();
					handleClick();
				}}
				onPointerDown={handleContextMenuPointerDown}
				disabled={isExtracting}
			>
				{isExtracting ? '🔄 프레임 추출 중...' : '🎬 이 프레임으로 영상 생성'}
			</ContextMenuItem>
		);
	};

	const handleImageVideoGenerate = useCallback((imageUrl: string) => {
		if (!imageAsset) return;
		setVideoDialogImageUrl(imageUrl);
		setVideoDialogAssetId(imageAsset.id);
		setVideoDialogEndImageUrl((imageAsset as ImageAsset).endImageUrl);
		setIsVideoDialogOpen(true);
	}, [imageAsset]);

	const handleVideoFrameGenerate = useCallback((frameUrl: string) => {
		if (!videoAsset) return;
		setVideoDialogImageUrl(frameUrl);
		setVideoDialogAssetId(videoAsset.id);
		setIsVideoDialogOpen(true);
	}, [videoAsset]);

	return (
		<>
			{FEATURE_CUT_LAYERS ? (
				<ContextMenuItem
					className="flex items-center gap-3"
					onSelect={handleCut}
					onPointerDown={handleContextMenuPointerDown}
				>
					잘라내기
				</ContextMenuItem>
			) : null}
			{FEATURE_COPY_LAYERS && (
				<ContextMenuItem
					className="flex items-center gap-3"
					onSelect={handleCopy}
					onPointerDown={handleContextMenuPointerDown}
				>
					복사
				</ContextMenuItem>
			)}
			{FEATURE_DUPLICATE_LAYERS && (
				<ContextMenuItem
					className="flex items-center gap-3"
					onSelect={handleDuplicate}
					onPointerDown={handleContextMenuPointerDown}
				>
					복제
				</ContextMenuItem>
			)}
			<ContextMenuSeparator />
			{FEATURE_BRING_TO_FRONT ? (
				<ContextMenuItem
					className="flex items-center gap-3"
					onSelect={handleBringToFront}
					onPointerDown={handleContextMenuPointerDown}
				>
					맨 앞으로
				</ContextMenuItem>
			) : null}
			{FEATURE_SEND_TO_BACK ? (
				<ContextMenuItem
					className="flex items-center gap-3"
					onSelect={handleSendToBack}
					onPointerDown={handleContextMenuPointerDown}
				>
					맨 뒤로
				</ContextMenuItem>
			) : null}
			{isVideoItem && videoAsset && videoAsset.type === 'video' && (
				<>
					<ContextMenuSeparator />
					{videoItem?.audioRemoved ? (
						// 오디오가 제거된 상태면 "복구" 버튼
						<ContextMenuItem
							className="flex items-center gap-3"
							onSelect={(e) => {
								e.preventDefault();
								handleRestoreAudio();
							}}
							onPointerDown={handleContextMenuPointerDown}
						>
							🔊 오디오 복구
						</ContextMenuItem>
					) : (
						// 오디오가 있으면 "추출" 버튼
						<VideoAssetUrlComponent onExtract={handleExtractAudio} />
					)}
					<VideoFrameGenerateComponent onGenerate={handleVideoFrameGenerate} currentFrame={currentFrame} />
				</>
			)}
			{isImageItem && imageAsset && imageAsset.type === 'image' && (
				<>
					<ContextMenuSeparator />
					<ImageVideoGenerateComponent onGenerate={handleImageVideoGenerate} />
				</>
			)}
			
			{/* 영상 생성 다이얼로그 */}
			{videoDialogImageUrl && videoDialogAssetId && (
				<EditorVideoGenerateDialog
					open={isVideoDialogOpen}
					onOpenChange={setIsVideoDialogOpen}
					imageUrl={videoDialogImageUrl}
					assetId={videoDialogAssetId}
					endImageUrl={videoDialogEndImageUrl}
					onVideoGenerated={handleVideoGenerated}
				/>
			)}
		</>
	);
};
