import {useState, useEffect} from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';

import {Loader2, Video, CheckCircle} from 'lucide-react';
import {toast} from 'sonner';
// [STUB] supabase import removed
import {Z_INDEX_EDITOR_DIALOG} from '../z-indices';
// [STUB] useAuth removed

type VideoModel = 'veo3' | 'kling-turbo' | 'kling-turbo-pro' | 'seedance';
type MovementStyle = 'natural' | 'energetic' | 'elegant' | 'playful' | 'dramatic';

interface EditorVideoGenerateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	imageUrl: string;
	assetId: string;
	endImageUrl?: string; // 종료 이미지 (선택)
	onVideoGenerated: (videoUrl: string, sourceAssetId: string) => void;
	// 선택적: 트랙에 바로 배치할지 여부
	placeOnTrack?: boolean;
	trackPosition?: {frame: number; trackIndex?: number};
}

const MODEL_INFO: Record<VideoModel, {name: string; duration: number}> = {
	'veo3': {name: 'Veo3', duration: 8},
	'kling-turbo': {name: 'Kling 2.5 Turbo', duration: 5},
	'kling-turbo-pro': {name: 'Kling 2.5 Pro', duration: 5},
	'seedance': {name: 'Seedance 2.0 (래핑)', duration: 10},
};

const MOVEMENT_STYLES: {value: MovementStyle; label: string; emoji: string}[] = [
	{value: 'natural', label: '자연스러운', emoji: '🌿'},
	{value: 'energetic', label: '에너제틱', emoji: '💃'},
	{value: 'elegant', label: '엘레강스', emoji: '👠'},
	{value: 'playful', label: '플레이풀', emoji: '🎈'},
	{value: 'dramatic', label: '드라마틱', emoji: '🎭'},
];

const MOVEMENT_PROMPTS: Record<MovementStyle, string> = {
	natural: 'Natural, gentle movement with subtle motion. Camera slowly pans.',
	energetic: 'Dynamic, fast-paced movement with energy. Quick cuts and vibrant motion.',
	elegant: 'Slow, graceful movement with sophisticated pacing. Smooth transitions.',
	playful: 'Fun, bouncy movement with cheerful energy. Light and whimsical motion.',
	dramatic: 'Intense, cinematic movement with bold transitions. Striking poses.',
};

export const EditorVideoGenerateDialog: React.FC<EditorVideoGenerateDialogProps> = ({
	open,
	onOpenChange,
	imageUrl,
	assetId,
	endImageUrl,
	onVideoGenerated,
}) => {
	const isAdmin = true; const isOwner = true; // [STUB] auth removed
	const [selectedModel, setSelectedModel] = useState<VideoModel>('kling-turbo-pro');
	const [selectedMovementStyle, setSelectedMovementStyle] = useState<MovementStyle>('natural');
	const [customPrompt, setCustomPrompt] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [operationId, setOperationId] = useState<string | null>(null);
	const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
	const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

	// Reset state when dialog opens & load default model from system_settings
	useEffect(() => {
		if (open) {
			setStatus('idle');
			setOperationId(null);
			setGeneratedVideoUrl(null);
			setSelectedMovementStyle('natural');
			setCustomPrompt('');
			
			// system_settings에서 쇼케이스 영상 모델 로드
			const loadDefaultModel = async () => {
				try {
					const { data } = await supabase
						.from('system_settings')
						.select('value')
						.eq('key', 'showcase_video_model')
						.single();
					
					if (data?.value) {
						setSelectedModel(data.value as VideoModel);
					} else {
						setSelectedModel('kling-turbo-pro'); // 기본값
					}
				} catch (error) {
					console.error('Failed to load default model:', error);
					setSelectedModel('kling-turbo-pro');
				}
			};
			loadDefaultModel();
		}
	}, [open]);

	const generatePrompt = () => {
		const movementPrompt = MOVEMENT_PROMPTS[selectedMovementStyle];
		const customInstruction = customPrompt.trim() ? ` ${customPrompt.trim()}.` : '';
		return `Professional product showcase video. ${movementPrompt}${customInstruction} High-end commercial aesthetic with soft lighting. 9:16 vertical format.`;
	};

	const handleGenerate = async () => {
		setIsGenerating(true);
		try {
			const prompt = generatePrompt();
			
			let functionName = '';
			let body: any = {};
			
			if (selectedModel === 'veo3') {
				functionName = 'generate-veo3-video';
				body = {
					imageUrl,
					narration: '',
					sceneDescription: prompt,
					model: 'veo3',
				};
		} else if (selectedModel === 'kling-turbo' || selectedModel === 'kling-turbo-pro') {
			functionName = 'generate-kling-video';
			body = {
				imageUrl,
				endImageUrl: endImageUrl || undefined,
				prompt,
				duration: 5,
				mode: selectedModel === 'kling-turbo-pro' ? 'pro' : 'std',
			};
		} else if (selectedModel === 'seedance') {
			functionName = 'generate-seedance-video';
			body = {
				prompt,
				imageUrl,
				duration: 10,
				aspect_ratio: '9:16',
			};
		}

			const {data, error} = await supabase.functions.invoke(functionName, {body});

			if (error) throw error;
			
			const opId = data?.operationId || data?.taskId || data?.task_id;
			if (!opId) throw new Error('영상 생성 요청 실패: Operation ID가 없습니다');

			setOperationId(opId);
			setStatus('processing');
			
			toast.success('영상 생성이 시작되었습니다', {
				description: '완료까지 1-5분 소요됩니다',
			});
		} catch (error) {
			console.error('Video generation error:', error);
			toast.error('영상 생성 실패', {
				description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
			});
		} finally {
			setIsGenerating(false);
		}
	};

	// Veo 영상을 스토리지에 업로드하여 브라우저 재생 가능한 URL로 변환
	const uploadVeoVideoToStorage = async (veoVideoUrl: string): Promise<string> => {
		// 프록시를 통해 영상 다운로드
		const proxyUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/download-veo3-video?uri=${encodeURIComponent(veoVideoUrl)}`;
		const response = await fetch(proxyUrl);
		
		if (!response.ok) {
			throw new Error('Failed to download video from Veo');
		}
		
		const videoBlob = await response.blob();
		const fileName = `editor-generated/${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;
		
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('videos')
			.upload(fileName, videoBlob, { contentType: 'video/mp4', upsert: true });
		
		if (uploadError) throw uploadError;
		
		const { data: urlData } = supabase.storage
			.from('videos')
			.getPublicUrl(uploadData.path);
		
		return urlData.publicUrl;
	};

	// Poll for status
	useEffect(() => {
		if (!operationId || status !== 'processing') return;

		const checkStatus = async () => {
			try {
			let functionName = '';
				if (selectedModel === 'veo3') {
					functionName = 'check-veo3-status';
				} else if (selectedModel === 'kling-turbo' || selectedModel === 'kling-turbo-pro') {
					functionName = 'check-kling-status';
				} else if (selectedModel === 'seedance') {
					functionName = 'check-seedance-status';
				}

				const {data, error} = await supabase.functions.invoke(functionName, {
					body: {operationId},
				});

				if (error) throw error;

				if (data?.status === 'completed' && data?.videoUrl) {
					let finalVideoUrl = data.videoUrl;
					
					// Veo3의 경우 스토리지에 업로드하여 브라우저 재생 가능한 URL로 변환
					if (selectedModel === 'veo3') {
						try {
							toast.info('영상을 저장 중입니다...');
							finalVideoUrl = await uploadVeoVideoToStorage(data.videoUrl);
						} catch (uploadError) {
							console.error('Failed to upload Veo video to storage:', uploadError);
							// 업로드 실패 시 원본 URL 사용 (재생 안 될 수 있음)
						}
					}
					
					setStatus('completed');
					setGeneratedVideoUrl(finalVideoUrl);
					onVideoGenerated(finalVideoUrl, assetId);
					toast.success('영상 생성 완료!');
				} else if (data?.status === 'failed') {
					setStatus('failed');
					toast.error('영상 생성 실패', {description: data?.error});
				}
			} catch (error) {
				console.error('Status check error:', error);
			}
		};

		const interval = setInterval(checkStatus, 10000);
		checkStatus();

		return () => clearInterval(interval);
	}, [operationId, status, selectedModel, assetId, onVideoGenerated]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg" style={{zIndex: Z_INDEX_EDITOR_DIALOG}}>
				<DialogHeader>
					<DialogTitle>🎬 영상 생성</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Preview or generated video */}
					<div className="aspect-video bg-muted rounded-lg overflow-hidden">
						{generatedVideoUrl ? (
							<video
								src={generatedVideoUrl}
								className="w-full h-full object-cover"
								controls
								autoPlay
								muted
							/>
						) : (
							<img
								src={imageUrl}
								alt="Preview"
								className="w-full h-full object-cover"
							/>
						)}
					</div>

					{/* 종료 이미지 설정됨 표시 */}
					{endImageUrl && (
						<div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg">
							<span className="text-xs text-primary">🎯 종료 이미지 설정됨</span>
							<img src={endImageUrl} alt="End" className="h-8 w-8 rounded object-cover" />
						</div>
					)}

					{/* Model info (read-only) - 관리자/오너만 표시 */}
					{(isAdmin || isOwner) && (
						<div className="p-3 bg-muted/50 rounded-lg">
							<p className="text-sm text-muted-foreground">
								🎬 {MODEL_INFO[selectedModel].name} - {MODEL_INFO[selectedModel].duration}초 영상 생성
							</p>
						</div>
					)}

					{/* Movement Style selection */}
					<div className="space-y-2">
						<Label>무브먼트 스타일</Label>
						<div className="grid grid-cols-5 gap-1.5">
							{MOVEMENT_STYLES.map((style) => (
								<button
									key={style.value}
									onClick={() => setSelectedMovementStyle(style.value)}
									disabled={status === 'processing'}
									className={`p-2 rounded-lg border-2 text-center transition-all ${
										selectedMovementStyle === style.value
											? 'border-primary bg-primary/10'
											: 'border-border hover:border-primary/50'
									} ${status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}`}
								>
									<div className="text-lg">{style.emoji}</div>
									<div className="text-[10px] leading-tight">{style.label}</div>
								</button>
							))}
						</div>
					</div>

					{/* Custom instructions */}
					<div className="space-y-2">
						<Label>추가 지시사항 (선택)</Label>
						<Textarea
							placeholder="예: 천천히 회전하면서, 부드럽게 줌인, 살짝 흔들리는 느낌..."
							value={customPrompt}
							onChange={(e) => setCustomPrompt(e.target.value)}
							disabled={status === 'processing'}
							rows={2}
							className="resize-none"
						/>
					</div>

					{/* Status display */}
					{status === 'processing' && (
						<div className="p-4 bg-muted rounded-lg flex items-center gap-3">
							<Loader2 className="w-5 h-5 animate-spin text-primary" />
							<div>
								<p className="font-medium">영상 생성 중...</p>
								<p className="text-sm text-muted-foreground">완료까지 1-5분 소요됩니다</p>
							</div>
						</div>
					)}

					{status === 'completed' && (
						<div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
							<CheckCircle className="w-5 h-5 text-green-500" />
							<div>
								<p className="font-medium text-green-700">영상 생성 완료!</p>
								<p className="text-sm text-muted-foreground">에셋 라이브러리에 추가되었습니다</p>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{status === 'completed' ? '닫기' : '취소'}
					</Button>
					{status !== 'completed' && (
						<Button
							onClick={handleGenerate}
							disabled={isGenerating || status === 'processing'}
						>
							{isGenerating || status === 'processing' ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									생성 중...
								</>
							) : (
								<>
									<Video className="w-4 h-4 mr-2" />
									영상 생성
								</>
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
