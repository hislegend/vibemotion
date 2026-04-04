import React, {useState, useCallback} from 'react';
import {Sparkles} from 'lucide-react';
import {VideoItem} from '../../items/video/video-item-type';
import {VideoAsset} from '../../assets/assets';
import {usePreferredLocalUrl} from '../../utils/find-asset-by-id';
import {useFps} from '../../utils/use-context';
import {usePlayerRef} from '../../contexts/player-ref-context';
import {extractFrameAtTime} from '@/utils/videoFrameExtractor';
import {EditorVideoGenerateDialog} from '../../dialogs/video-generate-dialog';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import {toast} from 'sonner';

interface ContinueVideoMaskProps {
	item: VideoItem;
	asset: VideoAsset;
	itemHeight: number;
	onVideoGenerated: (videoUrl: string, sourceAssetId: string, placeAfterFrame: number) => void;
}

export const ContinueVideoMask: React.FC<ContinueVideoMaskProps> = ({
	item,
	asset,
	itemHeight,
	onVideoGenerated,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [extractedFrame, setExtractedFrame] = useState<string | null>(null);
	const [isExtracting, setIsExtracting] = useState(false);

	const videoUrl = usePreferredLocalUrl(asset);
	const playerRef = usePlayerRef();
	const {fps} = useFps();

	const handleClick = useCallback(async (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		
		if (isExtracting || !videoUrl) return;
		
		setIsExtracting(true);
		try {
			// 현재 플레이헤드 프레임 가져오기
			const currentFrame = playerRef.current?.getCurrentFrame() ?? 0;
			
			// 플레이헤드가 이 비디오 아이템 범위 내에 있는지 확인
			const itemStart = item.from;
			const itemEnd = item.from + item.durationInFrames;
			
			let targetTimeInSeconds: number;
			
			if (currentFrame >= itemStart && currentFrame < itemEnd) {
				// 플레이헤드가 아이템 범위 내에 있음 → 해당 프레임 추출
				const frameWithinItem = currentFrame - itemStart;
				const timeWithinItem = frameWithinItem / fps;
				// playbackRate 2x = 타임라인 1초에 원본 2초 소비 → *로 매핑
				targetTimeInSeconds = (item.videoStartFromInSeconds || 0) + 
					timeWithinItem * (item.playbackRate || 1);
			} else {
				// 플레이헤드가 아이템 범위 밖에 있음 → 추출 차단
				toast.error('플레이헤드를 이 클립 위로 옮긴 다음 다시 시도해 주세요');
				setIsExtracting(false);
				return;
			}
			
			const frameBase64 = await extractFrameAtTime(videoUrl, Math.max(0, targetTimeInSeconds));
			setExtractedFrame(frameBase64);
			setIsDialogOpen(true);
		} catch (error) {
			console.error('Failed to extract frame:', error);
		} finally {
			setIsExtracting(false);
		}
	}, [videoUrl, item, isExtracting, playerRef, fps]);

	const handleVideoGenerated = useCallback((videoUrl: string, sourceAssetId: string) => {
		// 원본 클립 바로 뒤에 배치할 프레임 위치 계산
		const placeAfterFrame = item.from + item.durationInFrames;
		onVideoGenerated(videoUrl, sourceAssetId, placeAfterFrame);
		setIsDialogOpen(false);
	}, [item.from, item.durationInFrames, onVideoGenerated]);

	const maskSize = Math.min(itemHeight - 8, 24);

	return (
		<>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							onClick={handleClick}
							onMouseDown={(e) => e.stopPropagation()}
							onPointerDown={(e) => e.stopPropagation()}
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
							className={`absolute z-20 flex items-center justify-center rounded transition-all duration-200 ${
								isHovered 
									? 'bg-primary text-primary-foreground scale-110' 
									: 'bg-primary/80 text-primary-foreground/90'
							} ${isExtracting ? 'animate-pulse' : ''}`}
							style={{
								right: 4,
								top: '50%',
								transform: 'translateY(-50%)',
								width: maskSize,
								height: maskSize,
								pointerEvents: 'auto',
							}}
						>
							<Sparkles size={maskSize * 0.6} />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top" className="text-xs">
						이어서 만들기
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			{extractedFrame && (
				<EditorVideoGenerateDialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					imageUrl={extractedFrame}
					assetId={asset.id}
					onVideoGenerated={handleVideoGenerated}
				/>
			)}
		</>
	);
};
