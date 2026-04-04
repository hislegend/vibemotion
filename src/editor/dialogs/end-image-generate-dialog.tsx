import {useState, useEffect} from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Loader2, Wand2, Image as ImageIcon} from 'lucide-react';
import {toast} from 'sonner';
// [STUB] supabase import removed
import {Z_INDEX_EDITOR_DIALOG} from '../z-indices';

interface EndImageGenerateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	startImageUrl: string;
	onEndImageGenerated: (endImageUrl: string) => void;
}

// 프리셋 옵션들
const PRESET_OPTIONS = [
	{ label: '클로즈업', prompt: 'Close-up shot of the product, detailed view, macro photography' },
	{ label: '다른 앵글', prompt: 'Different angle view, rotated perspective, alternative viewpoint' },
	{ label: '줌 아웃', prompt: 'Zoomed out view, wider shot, showing more context and environment' },
	{ label: '사용 장면', prompt: 'Product in use, lifestyle shot, natural usage context' },
];

export const EndImageGenerateDialog: React.FC<EndImageGenerateDialogProps> = ({
	open,
	onOpenChange,
	startImageUrl,
	onEndImageGenerated,
}) => {
	const [prompt, setPrompt] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	// Reset state when dialog opens
	useEffect(() => {
		if (open) {
			setPrompt('');
			setPreviewUrl(null);
			setIsGenerating(false);
		}
	}, [open]);

	const handleGenerate = async (presetPrompt?: string) => {
		setIsGenerating(true);
		try {
			const finalPrompt = presetPrompt || prompt.trim();
			
			// 종료 이미지 생성을 위한 프롬프트 구성
			const endImagePrompt = finalPrompt 
				? `Generate the ending frame for a video. ${finalPrompt}. Maintain visual consistency with the original image style and subject.`
				: `Generate an ending frame for a video. Create a natural conclusion shot - slightly different angle or close-up while maintaining visual consistency with the original image.`;

			const result = await supabase.functions.invoke('edit-showcase-image', {
				body: {
					imageUrl: startImageUrl,
					editPrompt: endImagePrompt,
					mode: 'transform',
					referenceModelUrl: null,
				},
			});

			if (result.error) throw result.error;
			if (!result.data?.editedImageUrl) throw new Error('종료 이미지 생성 결과가 없습니다');

			setPreviewUrl(result.data.editedImageUrl);
			toast.success('종료 이미지 생성 완료');
		} catch (error: any) {
			console.error('End image generation error:', error);
			
			let errorMessage = '알 수 없는 오류가 발생했습니다';
			if (error?.context?.body) {
				try {
					const body = JSON.parse(error.context.body);
					if (body.code === 'CONTENT_FILTERED') {
						errorMessage = '이미지가 AI 정책에 의해 차단되었습니다.';
					} else if (body.error) {
						errorMessage = body.error;
					}
				} catch {}
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}
			
			toast.error('종료 이미지 생성 실패', {description: errorMessage});
		} finally {
			setIsGenerating(false);
		}
	};

	const handleApply = () => {
		if (previewUrl) {
			onEndImageGenerated(previewUrl);
			onOpenChange(false);
			toast.success('종료 이미지가 적용되었습니다');
		}
	};

	const handleReset = () => {
		setPreviewUrl(null);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{zIndex: Z_INDEX_EDITOR_DIALOG}}>
				<DialogHeader>
					<DialogTitle>📽️ 종료 이미지 생성</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* 이미지 비교 영역 */}
					<div className="grid grid-cols-2 gap-4">
						{/* 시작 이미지 */}
						<div className="space-y-2">
							<Label className="text-sm text-muted-foreground flex items-center gap-1">
								<ImageIcon className="w-3 h-3" />
								시작 이미지
							</Label>
							<div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden">
								<img
									src={startImageUrl}
									alt="Start"
									className="w-full h-full object-cover"
								/>
							</div>
						</div>

						{/* 종료 이미지 */}
						<div className="space-y-2">
							<Label className="text-sm text-muted-foreground flex items-center gap-1">
								<ImageIcon className="w-3 h-3" />
								{previewUrl ? '종료 이미지' : '미리보기'}
							</Label>
							<div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
								{previewUrl ? (
									<img
										src={previewUrl}
										alt="End"
										className="w-full h-full object-cover"
									/>
								) : (
									<span className="text-muted-foreground text-sm text-center px-4">
										프리셋을 선택하거나<br />직접 지시어를 입력하세요
									</span>
								)}
							</div>
						</div>
					</div>

					{/* 프리셋 버튼 */}
					<div className="space-y-2">
						<Label className="text-sm">빠른 프리셋</Label>
						<div className="grid grid-cols-4 gap-2">
							{PRESET_OPTIONS.map((preset) => (
								<Button
									key={preset.label}
									variant="outline"
									size="sm"
									onClick={() => handleGenerate(preset.prompt)}
									disabled={isGenerating}
									className="text-xs"
								>
									{preset.label}
								</Button>
							))}
						</div>
					</div>

					{/* 커스텀 프롬프트 입력 */}
					<div className="space-y-2">
						<Label htmlFor="end-prompt">직접 입력 (선택)</Label>
						<Textarea
							id="end-prompt"
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder="제품이 살짝 회전된 모습, 패키지가 보이는 앵글, 손에 들고 있는 장면..."
							rows={2}
							disabled={isGenerating}
						/>
						<p className="text-xs text-muted-foreground">
							영상의 마지막 프레임으로 사용될 이미지를 생성합니다. 시작 이미지와 자연스럽게 연결됩니다.
						</p>
					</div>
				</div>

				<DialogFooter className="gap-2 mt-4">
					{previewUrl ? (
						<>
							<Button variant="outline" onClick={handleReset}>
								다시 생성
							</Button>
							<Button onClick={handleApply}>
								적용하기
							</Button>
						</>
					) : (
						<>
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								취소
							</Button>
							<Button onClick={() => handleGenerate()} disabled={isGenerating || !prompt.trim()}>
								{isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
								<Wand2 className="w-4 h-4 mr-2" />
								생성하기
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
