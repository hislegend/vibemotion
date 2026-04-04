import React, {useCallback, useContext} from 'react';
import {Crop, RotateCcw} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {EditModeContext} from '../../edit-mode';
import {CropArea, ImageItem} from '../../items/image/image-item-type';
import {changeItem} from '../../state/actions/change-item';
import {useWriteContext} from '../../utils/use-context';

interface CropControlsProps {
	itemId: string;
	cropArea?: CropArea;
}

const CropControlsUnmemoized: React.FC<CropControlsProps> = ({
	itemId,
	cropArea,
}) => {
	const {setState} = useWriteContext();
	const {setEditMode} = useContext(EditModeContext);

	const hasCrop = cropArea && (
		cropArea.x !== 0 || cropArea.y !== 0 || 
		cropArea.width !== 1 || cropArea.height !== 1
	);

	const handleEnterCropMode = useCallback(() => {
		setEditMode('crop');
	}, [setEditMode]);

	const handleResetCrop = useCallback(() => {
		setState({
			update: (state) =>
				changeItem(state, itemId, (i) => ({
					...(i as ImageItem),
					cropArea: undefined,
					// legacy fields도 제거
					cropZoom: undefined,
					cropOffsetX: undefined,
					cropOffsetY: undefined,
				})),
			commitToUndoStack: true,
		});
	}, [itemId, setState]);

	return (
		<div className="flex flex-col gap-3">
			{/* 크롭 모드 진입 버튼 */}
			<div className="flex flex-row gap-2">
				<Button 
					variant="secondary" 
					size="sm" 
					className="flex-1 gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30"
					onClick={handleEnterCropMode}
				>
					<Crop className="w-4 h-4" />
					영역 선택
					<kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-muted rounded">C</kbd>
				</Button>
				{hasCrop && (
					<Button 
						variant="ghost" 
						size="sm"
						onClick={handleResetCrop}
						title="크롭 초기화"
						className="gap-1"
					>
						<RotateCcw className="w-3.5 h-3.5" />
						초기화
					</Button>
				)}
			</div>

			{/* 현재 상태 표시 */}
			{hasCrop && cropArea && (
				<div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
					크롭: {Math.round(cropArea.width * 100)}% × {Math.round(cropArea.height * 100)}%
				</div>
			)}
		</div>
	);
};

export const CropControls = React.memo(CropControlsUnmemoized);