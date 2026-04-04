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
import {Switch} from '@/components/ui/switch';
import {Loader2, Wand2, Video} from 'lucide-react';
import {toast} from 'sonner';
// [STUB] supabase import removed

// 끝이미지 프리셋 옵션 (영상 움직임 스타일 기반)
const END_IMAGE_PRESETS = [
	{value: 'natural', label: '🌿 자연스러운', prompt: '부드럽고 자연스러운 미세한 움직임. 고개가 살짝 돌아가거나 손 위치가 약간 바뀐 상태.'},
	{value: 'energetic', label: '💃 에너제틱', prompt: '역동적이고 활기찬 움직임. 에너지 넘치는 표정과 다이나믹한 포즈.'},
	{value: 'elegant', label: '👠 엘레강스', prompt: '우아하고 세련된 움직임. 그레이스풀한 자세와 품격 있는 표현.'},
	{value: 'playful', label: '🎈 플레이풀', prompt: '발랄하고 경쾌한 움직임. 밝은 미소와 재미있는 표정.'},
	{value: 'dramatic', label: '🎭 드라마틱', prompt: '극적이고 강렬한 움직임. 임팩트 있는 포즈와 강한 눈빛.'},
];

interface EditorImageEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	imageUrl: string;
	assetId: string;
	onImageEdited: (assetId: string, newImageUrl: string) => void;
	onEndImageGenerated?: (assetId: string, endImageUrl: string) => void;
	currentEndImageUrl?: string;
}

export const EditorImageEditDialog: React.FC<EditorImageEditDialogProps> = ({
	open,
	onOpenChange,
	imageUrl,
	assetId,
	onImageEdited,
	onEndImageGenerated,
	currentEndImageUrl,
}) => {
	// 모드 상태 (edit: 수정, endImage: 끝이미지)
	const [mode, setMode] = useState<'edit' | 'endImage'>('edit');
	
	// 수정 모드 상태
	const [editPrompt, setEditPrompt] = useState('');
	const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	
	// 끝이미지 모드 상태
	const [endImagePrompt, setEndImagePrompt] = useState('');
	const [endImagePreviewUrl, setEndImagePreviewUrl] = useState<string | null>(null);
	const [isGeneratingEndImage, setIsGeneratingEndImage] = useState(false);
	const [useEditedAsStart, setUseEditedAsStart] = useState(false);

	// Reset state when dialog opens (모드는 유지)
	useEffect(() => {
		if (open) {
			setEditPrompt('');
			setEditPreviewUrl(null);
			setIsEditing(false);
			setEndImagePrompt('');
			setEndImagePreviewUrl(null);
			setIsGeneratingEndImage(false);
			setUseEditedAsStart(false);
		}
	}, [open]);

	// 수정 모드: 이미지 편집
	const handleEdit = async (editMode: 'clean' | 'transform' = 'transform') => {
		setIsEditing(true);
		try {
			const result = await supabase.functions.invoke('edit-showcase-image', {
				body: {
					imageUrl,
					editPrompt: editPrompt,
					mode: editMode,
					referenceModelUrl: null,
				},
			});

			if (result.error) throw result.error;
			if (!result.data?.editedImageUrl) throw new Error('이미지 편집 결과가 없습니다');

			setEditPreviewUrl(result.data.editedImageUrl);
			toast.success(editMode === 'clean' ? '텍스트 제거 완료' : '이미지 편집 완료');
		} catch (error: any) {
			console.error('Image edit error:', error);
			
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
			
			toast.error('이미지 편집 실패', {description: errorMessage});
		} finally {
			setIsEditing(false);
		}
	};

	// 끝이미지 모드: 끝이미지 생성
	const handleGenerateEndImage = async () => {
		setIsGeneratingEndImage(true);
		try {
			const startUrl = useEditedAsStart && editPreviewUrl ? editPreviewUrl : imageUrl;
			const stylePrompt = endImagePrompt.trim() || END_IMAGE_PRESETS[0].prompt;
			
			// 5초 후 장면 컨텍스트를 명확히 전달
			const finalPrompt = `This image is frame 0 of a 5-second video. Generate frame 150 (the final frame, 5 seconds later).
The subject should have naturally transitioned during those 5 seconds with this movement style: ${stylePrompt}
CRITICAL: Maintain perfect visual consistency - same person, same clothing, same background, same lighting.
Only the pose, expression, and position should change naturally as if 5 seconds have passed.`;
			
			const result = await supabase.functions.invoke('edit-showcase-image', {
				body: {
					imageUrl: startUrl,
					editPrompt: finalPrompt,
					mode: 'transform',
					referenceModelUrl: null,
				},
			});

			if (result.error) throw result.error;
			if (!result.data?.editedImageUrl) throw new Error('끝이미지 생성 결과가 없습니다');

			setEndImagePreviewUrl(result.data.editedImageUrl);
			toast.success('끝이미지 생성 완료');
		} catch (error: any) {
			console.error('End image generate error:', error);
			
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
			
			toast.error('끝이미지 생성 실패', {description: errorMessage});
		} finally {
			setIsGeneratingEndImage(false);
		}
	};

	// 수정 모드: 적용
	const handleApplyEdit = () => {
		if (editPreviewUrl) {
			onImageEdited(assetId, editPreviewUrl);
			onOpenChange(false);
			toast.success('이미지가 적용되었습니다');
		}
	};

	// 끝이미지 모드: 적용
	const handleApplyEndImage = () => {
		if (endImagePreviewUrl && onEndImageGenerated) {
			onEndImageGenerated(assetId, endImagePreviewUrl);
			onOpenChange(false);
			toast.success('종료 이미지가 적용되었습니다');
		}
	};

	const getEditButtonText = () => {
		if (isEditing) return '생성 중...';
		if (editPrompt.trim()) return '이미지 편집';
		return '자동 생성';
	};

	// 시작 이미지 URL (끝이미지 모드용)
	const startImageForEndMode = useEditedAsStart && editPreviewUrl ? editPreviewUrl : imageUrl;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>🎨 이미지 편집</DialogTitle>
				</DialogHeader>

				{/* 모드 전환 스위치 */}
				<div className="flex items-center justify-center gap-3 py-2 border-b">
					<span className={`text-sm transition-colors ${mode === 'edit' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
						수정
					</span>
					<Switch
						checked={mode === 'endImage'}
						onCheckedChange={(checked) => setMode(checked ? 'endImage' : 'edit')}
					/>
					<span className={`text-sm transition-colors ${mode === 'endImage' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
						끝이미지
					</span>
				</div>

				<div className="space-y-4">
					{mode === 'edit' ? (
						// ============= 수정 모드 =============
						<>
							{/* 이미지 비교 영역 */}
							<div className="grid grid-cols-2 gap-4">
								{/* 원본 이미지 */}
								<div className="space-y-2">
									<Label className="text-sm text-muted-foreground">원본 이미지</Label>
									<div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden">
										<img
											src={imageUrl}
											alt="Original"
											className="w-full h-full object-cover"
										/>
									</div>
								</div>

								{/* 편집 결과 */}
								<div className="space-y-2">
									<Label className="text-sm text-muted-foreground">
										{editPreviewUrl ? '편집 결과' : '미리보기'}
									</Label>
									<div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
										{editPreviewUrl ? (
											<img
												src={editPreviewUrl}
												alt="Edited"
												className="w-full h-full object-cover"
											/>
										) : (
											<span className="text-muted-foreground text-sm text-center px-4">
												편집 지시어를 입력하거나<br />자동 생성을 실행하세요
											</span>
										)}
									</div>
								</div>
							</div>

							{/* 프롬프트 입력 */}
							<div className="space-y-2">
								<Label htmlFor="edit-prompt">편집 지시어 (선택)</Label>
								<Textarea
									id="edit-prompt"
									value={editPrompt}
									onChange={(e) => setEditPrompt(e.target.value)}
									placeholder="배경을 해변으로 바꿔줘, 모델이 선글라스를 쓰게 해줘..."
									rows={2}
									disabled={isEditing}
								/>
								<p className="text-xs text-muted-foreground">
									원하는 변경사항을 입력하세요. 비워두면 자동으로 개선합니다.
								</p>
							</div>
						</>
					) : (
						// ============= 끝이미지 모드 =============
						<>
							{/* 시작 이미지 선택 (편집된 이미지가 있을 때만) */}
							{editPreviewUrl && (
								<div className="flex gap-2 p-2 bg-muted/50 rounded-lg">
									<Button
										variant={useEditedAsStart ? 'default' : 'outline'}
										size="sm"
										onClick={() => setUseEditedAsStart(true)}
									>
										편집된 이미지 사용
									</Button>
									<Button
										variant={!useEditedAsStart ? 'default' : 'outline'}
										size="sm"
										onClick={() => setUseEditedAsStart(false)}
									>
										원본 이미지 사용
									</Button>
								</div>
							)}

							{/* 이미지 비교 영역 */}
							<div className="grid grid-cols-2 gap-4">
								{/* 시작 이미지 */}
								<div className="space-y-2">
									<Label className="text-sm text-muted-foreground">시작 이미지</Label>
									<div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden">
										<img
											src={startImageForEndMode}
											alt="Start"
											className="w-full h-full object-cover"
										/>
									</div>
								</div>

								{/* 끝이미지 */}
								<div className="space-y-2">
									<Label className="text-sm text-muted-foreground">
										{endImagePreviewUrl ? '끝이미지' : '미리보기'}
									</Label>
									<div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
										{endImagePreviewUrl ? (
											<img
												src={endImagePreviewUrl}
												alt="End"
												className="w-full h-full object-cover"
											/>
										) : currentEndImageUrl ? (
											<img
												src={currentEndImageUrl}
												alt="Current End"
												className="w-full h-full object-cover opacity-50"
											/>
										) : (
											<span className="text-muted-foreground text-sm text-center px-4">
												프리셋을 선택하거나<br />직접 입력하세요
											</span>
										)}
									</div>
								</div>
							</div>

							{/* 움직임 스타일 선택 */}
							<div className="space-y-2">
								<Label className="text-sm text-muted-foreground">움직임 스타일</Label>
								<div className="flex flex-wrap gap-2">
									{END_IMAGE_PRESETS.map((preset) => (
										<Button
											key={preset.value}
											variant={endImagePrompt === preset.prompt ? 'default' : 'outline'}
											size="sm"
											onClick={() => setEndImagePrompt(preset.prompt)}
											disabled={isGeneratingEndImage}
										>
											{preset.label}
										</Button>
									))}
								</div>
							</div>

							{/* 추가 지시사항 입력 */}
							<div className="space-y-2">
								<Label htmlFor="end-prompt">추가 지시사항 (선택)</Label>
								<Textarea
									id="end-prompt"
									value={endImagePrompt}
									onChange={(e) => setEndImagePrompt(e.target.value)}
									placeholder="미소 짓기, 손 올리기, 카메라 응시..."
									rows={2}
									disabled={isGeneratingEndImage}
								/>
								<p className="text-xs text-muted-foreground">
									5초 영상의 마지막 장면을 생성합니다. 스타일을 선택하거나 직접 입력하세요.
								</p>
							</div>

							{/* 현재 설정된 끝이미지 표시 */}
							{currentEndImageUrl && !endImagePreviewUrl && (
								<div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground flex items-center gap-2">
									<Video className="w-3 h-3" />
									기존 끝이미지가 설정되어 있습니다. 새로 생성하면 덮어씁니다.
								</div>
							)}
						</>
					)}
				</div>

				<DialogFooter className="gap-2 mt-4">
					{mode === 'edit' ? (
						// 수정 모드 버튼
						editPreviewUrl ? (
							<>
								<Button variant="outline" onClick={() => setEditPreviewUrl(null)}>
									다시 편집
								</Button>
								<Button onClick={handleApplyEdit}>
									적용하기
								</Button>
							</>
						) : (
							<>
								<Button variant="outline" onClick={() => onOpenChange(false)}>
									취소
								</Button>
								<Button
									variant="outline"
									onClick={() => handleEdit('clean')}
									disabled={isEditing}
								>
									{isEditing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
									🧹 텍스트만 제거
								</Button>
								<Button onClick={() => handleEdit('transform')} disabled={isEditing}>
									{isEditing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
									<Wand2 className="w-4 h-4 mr-2" />
									{getEditButtonText()}
								</Button>
							</>
						)
					) : (
						// 끝이미지 모드 버튼
						endImagePreviewUrl ? (
							<>
								<Button variant="outline" onClick={() => setEndImagePreviewUrl(null)}>
									다시 생성
								</Button>
								<Button onClick={handleApplyEndImage} disabled={!onEndImageGenerated}>
									<Video className="w-4 h-4 mr-2" />
									끝이미지 적용
								</Button>
							</>
						) : (
							<>
								<Button variant="outline" onClick={() => onOpenChange(false)}>
									취소
								</Button>
								<Button onClick={handleGenerateEndImage} disabled={isGeneratingEndImage}>
									{isGeneratingEndImage && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
									<Video className="w-4 h-4 mr-2" />
									끝이미지 생성
								</Button>
							</>
						)
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
