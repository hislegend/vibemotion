import React, {useCallback, useRef, useState, useEffect} from 'react';
import {Plus, Video, Music, Upload, FolderOpen, X, Image, ChevronDown, ChevronRight, Wand2, Film, FileText, LayoutTemplate, Loader2} from 'lucide-react';
import {PlayerRef} from '@remotion/player';
import {toast} from 'sonner';
import {scrollbarStyle} from '../constants';
import {EditorStarterAsset, VideoAsset, AudioAsset, ImageAsset} from '../assets/assets';
import {useAssets, useDimensions, useFps, useWriteContext} from '../utils/use-context';
import {addAssetToState} from '../state/actions/add-asset-to-state';
import {addItem} from '../state/actions/add-item';
import {generateRandomId} from '../utils/generate-random-id';
import {GalleryPickerDialog} from './gallery-picker-dialog';
import {setLocalUrl} from '../caching/load-to-blob-url';
import {cacheAssetLocally} from '../caching/indexeddb';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
	ContextMenuSeparator,
} from '@/components/ui/context-menu';
import {EditorImageEditDialog} from '../dialogs/image-edit-dialog';
import {EditorVideoGenerateDialog} from '../dialogs/video-generate-dialog';
import {ScriptPanel} from './script-panel';
import {TemplatePanel} from './template-panel';
import {ProcessingVideoCard} from './processing-video-card';
// [STUB] supabase import removed

type AssetPanelTab = 'assets' | 'script' | 'template';

export const ASSET_PANEL_WIDTH = 350;

interface AssetPanelProps {
	playerRef: React.RefObject<PlayerRef | null>;
	projectId?: string;
}

// 접기/펼치기 상태를 위한 로컬 스토리지 키
const COLLAPSED_STATE_KEY = 'editor-asset-panel-collapsed';

const getInitialCollapsedState = (): Record<string, boolean> => {
	try {
		const saved = localStorage.getItem(COLLAPSED_STATE_KEY);
		return saved ? JSON.parse(saved) : {video: false, image: false, audio: false};
	} catch {
		return {video: false, image: false, audio: false};
	}
};

export const AssetPanel: React.FC<AssetPanelProps> = ({playerRef, projectId}) => {
	const {assets} = useAssets();
	const {setState} = useWriteContext();
	const {fps} = useFps();
	const {compositionWidth, compositionHeight} = useDimensions();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [showGalleryPicker, setShowGalleryPicker] = useState(false);
	const [collapsedSections, setCollapsedSections] = useState(getInitialCollapsedState);
	const [activeTab, setActiveTab] = useState<AssetPanelTab>('assets');
	
	// 이미지 편집 다이얼로그 상태
	const [editingImageAsset, setEditingImageAsset] = useState<ImageAsset | null>(null);
	
	// 영상 생성 다이얼로그 상태
	const [videoGenImageAsset, setVideoGenImageAsset] = useState<ImageAsset | null>(null);
	
	// 🆕 생성 중인 영상 상태
	interface ProcessingVideo {
		id: string;
		video_id: string;
		product_name: string;
		progress: number | null;
		created_at: string;
		stage?: 'generating' | 'downloading' | 'uploading' | 'checking';
	}
	const [processingVideos, setProcessingVideos] = useState<ProcessingVideo[]>([]);

	const assetList = Object.values(assets);
	
	// 타입별로 에셋 분류
	const videoAssets = assetList.filter(a => a.type === 'video') as VideoAsset[];
	const imageAssets = assetList.filter(a => a.type === 'image') as ImageAsset[];
	const audioAssets = assetList.filter(a => a.type === 'audio') as AudioAsset[];
	
	// progress 정규화 헬퍼 (0~100으로 통일)
	const normalizeProgress = (p: number | null | undefined): number => {
		if (p === null || p === undefined) return 0;
		// 0~1 범위면 100을 곱함
		if (p > 0 && p <= 1) return Math.round(p * 100);
		// 0~100 범위로 클램프
		return Math.max(0, Math.min(100, Math.round(p)));
	};
	
	// URL 추출 헬퍼 (다양한 필드명 호환)
	const resolveVideoUrl = (statusData: any): string | null => {
		return statusData?.videoUrl ?? 
		       statusData?.downloadUrl ?? 
		       statusData?.download_url ?? 
		       statusData?.url ?? 
		       statusData?.asset_url ?? 
		       null;
	};
	
	// 완료된 영상을 에셋에 추가 (useEffect보다 먼저 정의)
	const addCompletedVideoToAssets = useCallback(async (video: { id: string; product_name: string }, videoUrl: string) => {
		try {
			const metadata = await getVideoMetadata(videoUrl);
			const assetId = generateRandomId();
			
			const asset: VideoAsset = {
				id: assetId,
				type: 'video',
				filename: `${video.product_name || 'video'}.mp4`,
				remoteUrl: videoUrl,
				remoteFileKey: null,
				durationInSeconds: metadata.durationInSeconds,
				hasAudioTrack: true,
				width: metadata.width,
				height: metadata.height,
				size: 0,
				mimeType: 'video/mp4',
			};
			
			setState({
				update: (state) => addAssetToState({state, asset}),
				commitToUndoStack: false, // 자동 추가이므로 undo stack에 넣지 않음
			});
			
			toast.success(`영상 생성 완료: ${video.product_name}`);
		} catch (err) {
			console.error('Error adding completed video to assets:', err);
		}
	}, [setState]);
	
	// 🆕 생성 중인 영상 폴링 (병합/단조증가 방식)
	useEffect(() => {
		if (!projectId) return;
		
		const checkProcessingVideos = async () => {
			try {
				// 1. processing 상태 영상 조회
				const { data: videos } = await supabase
					.from('videos')
					.select('id, video_id, product_name, progress, created_at, video_url, status, video_model')
					.eq('project_id', projectId)
					.in('status', ['processing', 'completed']) // completed도 조회해서 완료 감지
					.order('created_at', { ascending: false });
				
				if (!videos || videos.length === 0) {
					setProcessingVideos([]);
					return;
				}
				
				// 이미 완료된 영상은 에셋에 추가 후 목록에서 제외
				const completedVideos = videos.filter(v => v.status === 'completed' && v.video_url);
				const processingVideosList = videos.filter(v => v.status === 'processing');
				
				for (const video of completedVideos) {
					// 이미 에셋에 있는지 확인
					const existingAsset = Object.values(assets).find(
						a => a.type === 'video' && (a as VideoAsset).remoteUrl === video.video_url
					);
					if (!existingAsset && video.video_url) {
						await addCompletedVideoToAssets(video, video.video_url);
					}
				}
				
				// 🔑 핵심: DB 값과 로컬 상태를 병합 (단조 증가)
				setProcessingVideos(prev => {
					const merged = processingVideosList.map(dbVideo => {
						const existing = prev.find(p => p.id === dbVideo.id);
						const dbProgress = normalizeProgress(dbVideo.progress);
						const localProgress = existing?.progress ?? 0;
						
						return {
							...dbVideo,
							progress: Math.max(dbProgress, localProgress), // 단조 증가!
							stage: existing?.stage || 'generating'
						};
					});
					return merged;
				});
				
			// 2. 각 영상 상태 체크 (Edge function 호출) - 모델별 분기
			for (const video of processingVideosList) {
				try {
					const videoModel = video.video_model || 'sora-2';
					let statusData: any;
					let error: any;

					if (videoModel === 'seedance-1.5-pro') {
						({ data: statusData, error } = await supabase.functions.invoke('check-seedance-status', {
							body: { predictionId: video.video_id }
						}));
						// 응답 표준화 (check-video-status 형식에 맞춤)
						if (statusData) {
							statusData = {
								status: statusData.status === 'completed' ? 'completed'
									: statusData.status === 'failed' ? 'failed'
									: 'in_progress',
								videoUrl: statusData.videoUrl,
								download_url: statusData.videoUrl,
								url: statusData.videoUrl,
								error: statusData.error ? { message: statusData.error } : undefined,
								progress: statusData.status === 'completed' ? 100 : 50,
							};
						}
					} else {
						// 기존 Sora/기본 로직 유지
						({ data: statusData, error } = await supabase.functions.invoke('check-video-status', {
							body: { 
								videoId: video.video_id,
								dbVideoId: video.id
							}
						}));
					}
						
						if (error) {
							console.error('check-video-status error:', error);
							continue;
						}
						
						const resolvedUrl = resolveVideoUrl(statusData);
						const apiProgress = normalizeProgress(statusData?.progress);
						const stage = statusData?.stage || 'generating';
						
						// 완료된 경우 에셋에 추가
						if (statusData?.status === 'completed' && resolvedUrl) {
							await addCompletedVideoToAssets(video, resolvedUrl);
							setProcessingVideos(prev => prev.filter(v => v.id !== video.id));
						} else if (statusData?.status === 'failed' || statusData?.status === 'expired' || statusData?.status === 'not_found') {
							// 실패/만료/삭제된 경우 목록에서 제거
							setProcessingVideos(prev => prev.filter(v => v.id !== video.id));
							const errorMsg = statusData?.error?.message || statusData?.message || '영상 생성에 실패했습니다';
							toast.error(`영상 생성 실패: ${video.product_name}`, { description: errorMsg });
						} else {
							// 🔑 진행률 업데이트 (단조 증가 보장)
							setProcessingVideos(prev => prev.map(v => {
								if (v.id !== video.id) return v;
								const currentProgress = v.progress ?? 0;
								const newProgress = Math.max(currentProgress, apiProgress); // 절대 감소 안 함
								return { 
									...v, 
									progress: newProgress,
									stage: stage as ProcessingVideo['stage']
								};
							}));
						}
					} catch (err) {
						console.error('Error checking video status:', err);
					}
				}
			} catch (err) {
				console.error('Error fetching processing videos:', err);
			}
		};
		
		// 즉시 실행 + 5초 간격 폴링
		checkProcessingVideos();
		const interval = setInterval(checkProcessingVideos, 5000);
		return () => clearInterval(interval);
	}, [projectId, assets, addCompletedVideoToAssets]);

	const toggleSection = useCallback((section: string) => {
		setCollapsedSections(prev => {
			const next = {...prev, [section]: !prev[section]};
			try {
				localStorage.setItem(COLLAPSED_STATE_KEY, JSON.stringify(next));
			} catch {}
			return next;
		});
	}, []);

	const handleAddFromLocal = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		for (const file of Array.from(files)) {
			const url = URL.createObjectURL(file);
			const assetId = generateRandomId();
			const fileType = file.type;

			// 파일 타입에 따라 에셋만 생성 (타임라인에 추가하지 않음)
			if (fileType.startsWith('video/')) {
				const metadata = await getVideoMetadata(url);
				const asset: VideoAsset = {
					id: assetId,
					type: 'video',
					filename: file.name,
					remoteUrl: null,
					remoteFileKey: null,
					durationInSeconds: metadata.durationInSeconds,
					hasAudioTrack: true,
					width: metadata.width,
					height: metadata.height,
					size: file.size,
					mimeType: file.type,
				};

				setLocalUrl(assetId, url);
				await cacheAssetLocally({assetId, value: file});

				setState({
					update: (state) => addAssetToState({state, asset}),
					commitToUndoStack: true,
				});
			} else if (fileType.startsWith('audio/')) {
				const metadata = await getAudioMetadata(url);
				const asset: AudioAsset = {
					id: assetId,
					type: 'audio',
					filename: file.name,
					remoteUrl: null,
					remoteFileKey: null,
					durationInSeconds: metadata.durationInSeconds,
					size: file.size,
					mimeType: file.type,
				};

				setLocalUrl(assetId, url);
				await cacheAssetLocally({assetId, value: file});

				setState({
					update: (state) => addAssetToState({state, asset}),
					commitToUndoStack: true,
				});
			} else if (fileType.startsWith('image/')) {
				const metadata = await getImageMetadata(url);
				const asset: ImageAsset = {
					id: assetId,
					type: 'image',
					filename: file.name,
					remoteUrl: null,
					remoteFileKey: null,
					width: metadata.width,
					height: metadata.height,
					size: file.size,
					mimeType: file.type,
				};

				setLocalUrl(assetId, url);
				await cacheAssetLocally({assetId, value: file});

				setState({
					update: (state) => addAssetToState({state, asset}),
					commitToUndoStack: true,
				});
			}
		}

		e.target.value = '';
	}, [setState]);

	const handleAddAssetToTrack = useCallback((asset: EditorStarterAsset) => {
		const currentFrame = playerRef.current?.getCurrentFrame() ?? 0;
		const itemId = generateRandomId();

		if (asset.type === 'video') {
			const videoAsset = asset as VideoAsset;
			const durationInFrames = Math.floor(videoAsset.durationInSeconds * fps);

			setState({
				update: (state) => {
					const newItem = {
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
				return addItem({state, item: newItem, select: true, position: {type: 'front'}});
				},
				commitToUndoStack: true,
			});
		} else if (asset.type === 'audio') {
			const audioAsset = asset as AudioAsset;
			const durationInFrames = Math.floor(audioAsset.durationInSeconds * fps);

			setState({
				update: (state) => {
					const newItem = {
						id: itemId,
						type: 'audio' as const,
						assetId: asset.id,
						from: currentFrame,
						durationInFrames,
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
						isDraggingInTimeline: false,
					};
					return addItem({state, item: newItem, select: true, position: {type: 'back'}});
				},
				commitToUndoStack: true,
			});
		} else if (asset.type === 'image') {
			const durationInFrames = fps * 2;

			setState({
				update: (state) => {
					const newItem = {
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
						kenBurnsEffect: 'none' as const,
						kenBurnsIntensity: 0.15,
					};
				return addItem({state, item: newItem, select: true, position: {type: 'front'}});
			},
			commitToUndoStack: true,
		});
	}
}, [playerRef, fps, compositionWidth, compositionHeight, setState]);

	const handleRemoveAsset = useCallback((assetId: string) => {
		setState({
			update: (state) => {
				const newAssets = {...state.undoableState.assets};
				delete newAssets[assetId];
				
				const newItems = {...state.undoableState.items};
				const itemsToRemove: string[] = [];
				for (const [itemId, item] of Object.entries(newItems)) {
					if ('assetId' in item && item.assetId === assetId) {
						itemsToRemove.push(itemId);
					}
				}
				itemsToRemove.forEach(id => delete newItems[id]);

				const newTracks = state.undoableState.tracks.map(track => ({
					...track,
					items: track.items.filter(id => !itemsToRemove.includes(id)),
				})).filter(track => track.items.length > 0);

				return {
					...state,
					undoableState: {
						...state.undoableState,
						assets: newAssets,
						items: newItems,
						tracks: newTracks,
					},
					selectedItems: state.selectedItems.filter(id => !itemsToRemove.includes(id)),
				};
			},
			commitToUndoStack: true,
		});
	}, [setState]);

	const handleGallerySelect = useCallback((videos: Array<{id: string; url: string; name: string}>) => {
		videos.forEach(async (video) => {
			const metadata = await getVideoMetadata(video.url);
			const assetId = generateRandomId();

			const response = await fetch(video.url);
			const blob = await response.blob();

			const asset: VideoAsset = {
				id: assetId,
				type: 'video',
				filename: video.name,
				remoteUrl: video.url,
				remoteFileKey: null,
				durationInSeconds: metadata.durationInSeconds,
				hasAudioTrack: true,
				width: metadata.width,
				height: metadata.height,
				size: blob.size,
				mimeType: blob.type,
			};

			setState({
				update: (state) => addAssetToState({state, asset}),
				commitToUndoStack: true,
			});
		});
		setShowGalleryPicker(false);
	}, [setState]);

	// 이미지 편집 완료 핸들러 - Blob으로 캐시 교체하여 트랙에서도 즉시 반영
	const handleImageEdited = useCallback(async (assetId: string, newImageUrl: string) => {
		try {
			// 프록시를 통해 CORS 안전하게 다운로드
			const proxyUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/proxy-image?url=${encodeURIComponent(newImageUrl)}`;
			const response = await fetch(proxyUrl);
			
			if (response.ok) {
				const blob = await response.blob();
				// IndexedDB에 새 이미지로 덮어쓰기
				await cacheAssetLocally({ assetId, value: blob });
				// 새 blob URL 생성 및 localUrls 업데이트
				const blobUrl = URL.createObjectURL(blob);
				setLocalUrl(assetId, blobUrl);
			} else {
				// 프록시 실패 시 https URL로 폴백
				setLocalUrl(assetId, newImageUrl);
			}
		} catch (error) {
			console.error('Failed to cache edited image:', error);
			// 실패해도 https URL로 폴백
			setLocalUrl(assetId, newImageUrl);
		}
		
		// 새 이미지로 에셋 업데이트
		setState({
			update: (state) => {
				const oldAsset = state.undoableState.assets[assetId];
				if (!oldAsset || oldAsset.type !== 'image') return state;
				
				return {
					...state,
					undoableState: {
						...state.undoableState,
						assets: {
							...state.undoableState.assets,
							[assetId]: {
								...oldAsset,
								remoteUrl: newImageUrl,
							},
						},
					},
				};
			},
			commitToUndoStack: true,
		});
		setEditingImageAsset(null);
	}, [setState]);

	// 영상 생성 완료 핸들러 - 에셋에 추가
	const handleVideoGenerated = useCallback(async (videoUrl: string, sourceAssetId: string) => {
		const metadata = await getVideoMetadata(videoUrl);
		const assetId = generateRandomId();
		const sourceAsset = assets[sourceAssetId];
		const filename = sourceAsset ? `${sourceAsset.filename.replace(/\.[^/.]+$/, '')}_video.mp4` : 'generated_video.mp4';

		const asset: VideoAsset = {
			id: assetId,
			type: 'video',
			filename,
			remoteUrl: videoUrl,
			remoteFileKey: null,
			durationInSeconds: metadata.durationInSeconds,
			hasAudioTrack: false,
			width: metadata.width,
			height: metadata.height,
			size: 0,
			mimeType: 'video/mp4',
		};

		setState({
			update: (state) => addAssetToState({state, asset}),
			commitToUndoStack: true,
		});
		setVideoGenImageAsset(null);
	}, [assets, setState]);

	return (
		<>
			<div
				className="border-r-editor-starter-border bg-editor-starter-panel flex flex-col border-r-[1px] text-white"
				style={{width: ASSET_PANEL_WIDTH, ...scrollbarStyle}}
			>
				{/* 헤더 + 탭 */}
				<div className="border-b border-neutral-700">
					<div className="px-3 py-2">
						<div className="text-xs font-medium text-neutral-300">설정</div>
					</div>
					<div className="flex border-t border-neutral-700">
						<button
							onClick={() => setActiveTab('assets')}
							className={`flex-1 py-2 text-xs font-medium transition-colors ${
								activeTab === 'assets' 
									? 'bg-neutral-700 text-white' 
									: 'text-neutral-400 hover:text-white hover:bg-neutral-800'
							}`}
						>
							<Image className="inline-block h-3 w-3 mr-1" />
							에셋
						</button>
						<button
							onClick={() => setActiveTab('script')}
							className={`flex-1 py-2 text-xs font-medium transition-colors ${
								activeTab === 'script' 
									? 'bg-neutral-700 text-white' 
									: 'text-neutral-400 hover:text-white hover:bg-neutral-800'
							}`}
						>
							<FileText className="inline-block h-3 w-3 mr-1" />
							대본
						</button>
						<button
							onClick={() => setActiveTab('template')}
							className={`flex-1 py-2 text-xs font-medium transition-colors ${
								activeTab === 'template' 
									? 'bg-neutral-700 text-white' 
									: 'text-neutral-400 hover:text-white hover:bg-neutral-800'
							}`}
						>
							<LayoutTemplate className="inline-block h-3 w-3 mr-1" />
							템플릿
						</button>
					</div>
				</div>

				{/* 탭 내용 */}
				{activeTab === 'assets' ? (
					<>
						{/* 에셋 추가 버튼 */}
						<div className="flex gap-1 p-2">
							<button
								onClick={() => setShowGalleryPicker(true)}
								className="flex flex-1 items-center justify-center gap-1 rounded bg-neutral-700 px-2 py-1.5 text-xs transition-colors hover:bg-neutral-600"
							>
								<FolderOpen className="h-3 w-3" />
								갤러리
							</button>
							<button
								onClick={handleAddFromLocal}
								className="flex flex-1 items-center justify-center gap-1 rounded bg-neutral-700 px-2 py-1.5 text-xs transition-colors hover:bg-neutral-600"
							>
								<Upload className="h-3 w-3" />
								로컬
							</button>
						</div>

						{/* 🆕 생성 중인 영상 섹션 */}
						{processingVideos.length > 0 && (
							<div className="mx-2 mb-2 p-2 rounded border border-primary/30 bg-primary/5">
								<div className="text-xs font-medium text-primary mb-2 flex items-center gap-2">
									<Loader2 className="h-3 w-3 animate-spin" />
									생성 중인 영상 ({processingVideos.length})
								</div>
								<div className="space-y-2">
									{processingVideos.map(video => (
										<ProcessingVideoCard
											key={video.id}
											video={video}
										/>
									))}
								</div>
							</div>
						)}

						{/* 에셋 리스트 - 접기/펼치기 섹션 */}
				<div className="flex-1 overflow-y-auto p-2 space-y-2">
					{/* 영상 섹션 */}
					<AssetSection
						title="영상"
						icon={<Video className="h-3 w-3 text-purple-400" />}
						count={videoAssets.length}
						collapsed={collapsedSections.video}
						onToggle={() => toggleSection('video')}
					>
						{videoAssets.length === 0 ? (
							<div className="py-2 text-center text-[10px] text-neutral-500">
								영상 에셋이 없습니다
							</div>
						) : (
							<div className="grid grid-cols-3 gap-1.5">
								{videoAssets.map((asset) => (
									<AssetThumbnail
										key={asset.id}
										asset={asset}
										onAddToTrack={() => handleAddAssetToTrack(asset)}
										onRemove={() => handleRemoveAsset(asset.id)}
									/>
								))}
							</div>
						)}
					</AssetSection>

					{/* 이미지 섹션 */}
					<AssetSection
						title="이미지"
						icon={<Image className="h-3 w-3 text-blue-400" />}
						count={imageAssets.length}
						collapsed={collapsedSections.image}
						onToggle={() => toggleSection('image')}
					>
						{imageAssets.length === 0 ? (
							<div className="py-2 text-center text-[10px] text-neutral-500">
								이미지 에셋이 없습니다
							</div>
						) : (
							<div className="grid grid-cols-3 gap-1.5">
								{imageAssets.map((asset) => (
									<ImageAssetThumbnail
										key={asset.id}
										asset={asset}
										onAddToTrack={() => handleAddAssetToTrack(asset)}
										onRemove={() => handleRemoveAsset(asset.id)}
										onEditImage={() => setEditingImageAsset(asset)}
										onGenerateVideo={() => setVideoGenImageAsset(asset)}
									/>
								))}
							</div>
						)}
					</AssetSection>

					{/* 오디오 섹션 */}
					<AssetSection
						title="오디오"
						icon={<Music className="h-3 w-3 text-green-400" />}
						count={audioAssets.length}
						collapsed={collapsedSections.audio}
						onToggle={() => toggleSection('audio')}
					>
						{audioAssets.length === 0 ? (
							<div className="py-2 text-center text-[10px] text-neutral-500">
								오디오 에셋이 없습니다
							</div>
						) : (
							<div className="grid grid-cols-3 gap-1.5">
								{audioAssets.map((asset) => (
									<AssetThumbnail
										key={asset.id}
										asset={asset}
										onAddToTrack={() => handleAddAssetToTrack(asset)}
										onRemove={() => handleRemoveAsset(asset.id)}
									/>
								))}
							</div>
						)}
					</AssetSection>
				</div>

				{/* 숨겨진 파일 인풋 */}
				<input
					ref={fileInputRef}
					type="file"
					accept="video/*,audio/*,image/*"
					multiple
					className="hidden"
					onChange={handleFileChange}
				/>
					</>
				) : activeTab === 'script' ? (
					/* 대본 탭 */
					<ScriptPanel projectId={projectId} playerRef={playerRef} />
				) : (
					/* 템플릿 탭 */
					<TemplatePanel playerRef={playerRef} />
				)}
			</div>

			{/* 갤러리 피커 다이얼로그 */}
			<GalleryPickerDialog
				open={showGalleryPicker}
				onOpenChange={setShowGalleryPicker}
				onSelect={handleGallerySelect}
				projectId={projectId}
			/>

			{/* 이미지 편집 다이얼로그 */}
			{editingImageAsset && (
				<EditorImageEditDialog
					open={!!editingImageAsset}
					onOpenChange={(open) => !open && setEditingImageAsset(null)}
					imageUrl={editingImageAsset.remoteUrl || ''}
					assetId={editingImageAsset.id}
					onImageEdited={handleImageEdited}
				/>
			)}

			{/* 영상 생성 다이얼로그 */}
			{videoGenImageAsset && (
				<EditorVideoGenerateDialog
					open={!!videoGenImageAsset}
					onOpenChange={(open) => !open && setVideoGenImageAsset(null)}
					imageUrl={videoGenImageAsset.remoteUrl || ''}
					assetId={videoGenImageAsset.id}
					endImageUrl={videoGenImageAsset.endImageUrl}
					onVideoGenerated={handleVideoGenerated}
				/>
			)}
		</>
	);
};

// 접기/펼치기 가능한 섹션 컴포넌트
const AssetSection: React.FC<{
	title: string;
	icon: React.ReactNode;
	count: number;
	collapsed: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}> = ({title, icon, count, collapsed, onToggle, children}) => {
	return (
		<div className="rounded border border-neutral-700 bg-neutral-800/50">
			<button
				onClick={onToggle}
				className="flex w-full items-center gap-2 px-2 py-1.5 hover:bg-neutral-700/50 transition-colors"
			>
				{collapsed ? (
					<ChevronRight className="h-3 w-3 text-neutral-400" />
				) : (
					<ChevronDown className="h-3 w-3 text-neutral-400" />
				)}
				{icon}
				<span className="flex-1 text-left text-[11px] font-medium">{title}</span>
				<span className="text-[10px] text-neutral-500">({count})</span>
			</button>
			{!collapsed && (
				<div className="border-t border-neutral-700 p-1.5">
					{children}
				</div>
			)}
		</div>
	);
};

// 기본 에셋 썸네일 컴포넌트 (비디오, 오디오용)
const AssetThumbnail: React.FC<{
	asset: EditorStarterAsset;
	onAddToTrack: () => void;
	onRemove: () => void;
}> = ({asset, onAddToTrack, onRemove}) => {
	const [imageError, setImageError] = useState(false);

	const getIcon = () => {
		switch (asset.type) {
			case 'video':
				return <Video className="h-4 w-4 text-purple-400" />;
			case 'audio':
				return <Music className="h-4 w-4 text-green-400" />;
			case 'image':
				return <Image className="h-4 w-4 text-blue-400" />;
			default:
				return <Video className="h-4 w-4 text-neutral-400" />;
		}
	};

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const thumbnailUrl =
		(asset.type === 'image' || asset.type === 'video') && 'remoteUrl' in asset
			? asset.remoteUrl
			: null;

	return (
		<div 
			className="group relative overflow-hidden rounded border border-neutral-700 bg-neutral-800 transition-colors hover:border-neutral-500"
			draggable
			onDragStart={(e) => {
				e.dataTransfer.setData('application/x-asset-id', asset.id);
				e.dataTransfer.setData('application/x-asset-type', asset.type);
				e.dataTransfer.effectAllowed = 'copy';
			}}
		>
			<div
				className="flex aspect-video cursor-pointer items-center justify-center bg-neutral-900 overflow-hidden"
				onClick={onAddToTrack}
				title={`${asset.filename} - 클릭하여 타임라인에 추가`}
			>
				{thumbnailUrl && !imageError ? (
					<img
						src={thumbnailUrl}
						alt={asset.filename}
						className="h-full w-full object-cover"
						onError={() => setImageError(true)}
					/>
				) : (
					getIcon()
				)}
				
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
					<Plus className="h-5 w-5 text-white" />
				</div>
			</div>

			<div className="flex items-center justify-between px-1 py-0.5">
				<span className="flex-1 truncate text-[9px]" title={asset.filename}>
					{asset.filename}
				</span>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					className="rounded p-0.5 opacity-0 transition-opacity hover:bg-red-500/20 group-hover:opacity-100"
					title="에셋 제거"
				>
					<X className="h-2.5 w-2.5 text-neutral-400 hover:text-red-400" />
				</button>
			</div>

			{'durationInSeconds' in asset && (
				<div className="absolute right-0.5 top-0.5 rounded bg-black/60 px-1 text-[8px] text-white">
					{formatDuration(asset.durationInSeconds)}
				</div>
			)}
		</div>
	);
};

// 이미지 전용 썸네일 (우클릭 메뉴 포함)
const ImageAssetThumbnail: React.FC<{
	asset: ImageAsset;
	onAddToTrack: () => void;
	onRemove: () => void;
	onEditImage: () => void;
	onGenerateVideo: () => void;
}> = ({asset, onAddToTrack, onRemove, onEditImage, onGenerateVideo}) => {
	const [imageError, setImageError] = useState(false);

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div 
					className="group relative overflow-hidden rounded border border-neutral-700 bg-neutral-800 transition-colors hover:border-neutral-500"
					draggable
					onDragStart={(e) => {
						e.dataTransfer.setData('application/x-asset-id', asset.id);
						e.dataTransfer.setData('application/x-asset-type', asset.type);
						e.dataTransfer.effectAllowed = 'copy';
					}}
				>
					<div
						className="flex aspect-video cursor-pointer items-center justify-center bg-neutral-900 overflow-hidden"
						onClick={onAddToTrack}
						title={`${asset.filename} - 클릭하여 타임라인에 추가`}
					>
						{asset.remoteUrl && !imageError ? (
							<img
								src={asset.remoteUrl}
								alt={asset.filename}
								className="h-full w-full object-cover"
								onError={() => setImageError(true)}
							/>
						) : (
							<Image className="h-4 w-4 text-blue-400" />
						)}
						
						<div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
							<Plus className="h-5 w-5 text-white" />
						</div>
					</div>

					<div className="flex items-center justify-between px-1 py-0.5">
						<span className="flex-1 truncate text-[9px]" title={asset.filename}>
							{asset.filename}
						</span>
						<button
							onClick={(e) => {
								e.stopPropagation();
								onRemove();
							}}
							className="rounded p-0.5 opacity-0 transition-opacity hover:bg-red-500/20 group-hover:opacity-100"
							title="에셋 제거"
						>
							<X className="h-2.5 w-2.5 text-neutral-400 hover:text-red-400" />
						</button>
					</div>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={onAddToTrack}>
					<Plus className="h-4 w-4 mr-2" />
					타임라인에 추가
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem onClick={onEditImage}>
					<Wand2 className="h-4 w-4 mr-2" />
					🎨 이미지 편집
				</ContextMenuItem>
				<ContextMenuItem onClick={onGenerateVideo}>
					<Film className="h-4 w-4 mr-2" />
					🎬 영상 생성
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem onClick={onRemove} className="text-red-400">
					<X className="h-4 w-4 mr-2" />
					에셋 제거
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};

// 비디오 메타데이터 추출 헬퍼
async function getVideoMetadata(videoUrl: string): Promise<{
	durationInSeconds: number;
	width: number;
	height: number;
}> {
	return new Promise((resolve) => {
		const video = document.createElement('video');
		video.crossOrigin = 'anonymous';
		video.preload = 'metadata';
		
		const timeout = setTimeout(() => {
			video.remove();
			resolve({durationInSeconds: 5, width: 1080, height: 1920});
		}, 10000);

		video.onloadedmetadata = () => {
			clearTimeout(timeout);
			resolve({
				durationInSeconds: video.duration || 5,
				width: video.videoWidth || 1080,
				height: video.videoHeight || 1920,
			});
			video.remove();
		};

		video.onerror = () => {
			clearTimeout(timeout);
			video.remove();
			resolve({durationInSeconds: 5, width: 1080, height: 1920});
		};

		video.src = videoUrl;
	});
}

// 오디오 메타데이터 추출 헬퍼
async function getAudioMetadata(audioUrl: string): Promise<{
	durationInSeconds: number;
}> {
	return new Promise((resolve) => {
		const audio = document.createElement('audio');
		audio.crossOrigin = 'anonymous';
		audio.preload = 'metadata';
		
		const timeout = setTimeout(() => {
			audio.remove();
			resolve({durationInSeconds: 30});
		}, 10000);

		audio.onloadedmetadata = () => {
			clearTimeout(timeout);
			resolve({
				durationInSeconds: audio.duration || 30,
			});
			audio.remove();
		};

		audio.onerror = () => {
			clearTimeout(timeout);
			audio.remove();
			resolve({durationInSeconds: 30});
		};

		audio.src = audioUrl;
	});
}

// 이미지 메타데이터 추출 헬퍼
async function getImageMetadata(imageUrl: string): Promise<{
	width: number;
	height: number;
}> {
	return new Promise((resolve) => {
		const img = document.createElement('img');
		img.crossOrigin = 'anonymous';
		
		const timeout = setTimeout(() => {
			img.remove();
			resolve({width: 1080, height: 1920});
		}, 10000);

		img.onload = () => {
			clearTimeout(timeout);
			resolve({
				width: img.naturalWidth || 1080,
				height: img.naturalHeight || 1920,
			});
			img.remove();
		};

		img.onerror = () => {
			clearTimeout(timeout);
			img.remove();
			resolve({width: 1080, height: 1920});
		};

		img.src = imageUrl;
	});
}
