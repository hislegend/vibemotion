import React, {useState, useEffect} from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Loader2, Check, Video} from 'lucide-react';
// [STUB] supabase import removed

interface GalleryVideo {
	id: string;
	video_url: string;
	product_name: string;
	created_at: string;
}

interface GalleryPickerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (videos: Array<{id: string; url: string; name: string}>) => void;
	projectId?: string;
}

export const GalleryPickerDialog: React.FC<GalleryPickerDialogProps> = ({
	open,
	onOpenChange,
	onSelect,
	projectId,
}) => {
	const [videos, setVideos] = useState<GalleryVideo[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (open) {
			loadVideos();
		} else {
			setSelectedIds(new Set());
		}
	}, [open, projectId]);

	const loadVideos = async () => {
		setLoading(true);
		try {
			let query = supabase
				.from('videos')
				.select('id, video_url, product_name, created_at')
				.eq('status', 'completed')
				.not('video_url', 'is', null)
				.order('created_at', {ascending: false})
				.limit(50);

			if (projectId) {
				query = query.eq('project_id', projectId);
			}

			const {data, error} = await query;

			if (error) throw error;
			setVideos(data || []);
		} catch (err) {
			console.error('Failed to load gallery videos:', err);
		} finally {
			setLoading(false);
		}
	};

	const toggleSelect = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleConfirm = () => {
		const selected = videos
			.filter((v) => selectedIds.has(v.id))
			.map((v) => ({
				id: v.id,
				url: v.video_url!,
				name: v.product_name || 'Untitled',
			}));
		onSelect(selected);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>갤러리에서 선택</DialogTitle>
				</DialogHeader>

				{loading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : videos.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						갤러리에 완료된 비디오가 없습니다
					</div>
				) : (
					<>
						<ScrollArea className="h-[400px]">
							<div className="grid grid-cols-3 gap-2 p-1">
								{videos.map((video) => (
									<div
										key={video.id}
										onClick={() => toggleSelect(video.id)}
										className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
											selectedIds.has(video.id)
												? 'border-primary ring-2 ring-primary/30'
												: 'border-transparent hover:border-muted-foreground/30'
										}`}
									>
										{/* 비디오 썸네일 */}
										<div className="aspect-[9/16] bg-muted">
											{video.video_url ? (
												<video
													src={video.video_url}
													className="h-full w-full object-cover"
													muted
													preload="metadata"
												/>
											) : (
												<div className="flex h-full items-center justify-center">
													<Video className="h-8 w-8 text-muted-foreground" />
												</div>
											)}
										</div>

										{/* 선택 체크 */}
										{selectedIds.has(video.id) && (
											<div className="absolute right-1 top-1 rounded-full bg-primary p-1">
												<Check className="h-3 w-3 text-primary-foreground" />
											</div>
										)}

										{/* 이름 */}
										<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
											<div className="truncate text-xs text-white">
												{video.product_name || 'Untitled'}
											</div>
										</div>
									</div>
								))}
							</div>
						</ScrollArea>

						<div className="flex justify-between pt-4">
							<span className="text-sm text-muted-foreground">
								{selectedIds.size}개 선택됨
							</span>
							<div className="flex gap-2">
								<Button variant="outline" onClick={() => onOpenChange(false)}>
									취소
								</Button>
								<Button
									onClick={handleConfirm}
									disabled={selectedIds.size === 0}
								>
									추가
								</Button>
							</div>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};
