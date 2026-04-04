import React, {useCallback} from 'react';
import {FEATURE_CROPPING} from '../flags';
import {selectItemForCrop} from '../state/actions/item-cropping';
import {useCanvasTransformationScale} from '../utils/canvas-transformation-context';
import {useWriteContext} from '../utils/use-context';
import {Crop} from 'lucide-react';

const BUTTON_HEIGHT = 32;
const BUTTON_OFFSET = 8;

interface CropButtonProps {
	itemId: string;
}

export const CropButton: React.FC<CropButtonProps> = ({itemId}) => {
	const {setState} = useWriteContext();
	const scale = useCanvasTransformationScale();

	const scaledButtonHeight = BUTTON_HEIGHT / scale;
	const scaledOffset = BUTTON_OFFSET / scale;

	const handleCropClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			setState({
				update: (state) => selectItemForCrop({state, itemId}),
				commitToUndoStack: true,
			});
		},
		[setState, itemId],
	);

	if (!FEATURE_CROPPING) {
		return null;
	}

	const buttonStyle: React.CSSProperties = {
		position: 'absolute',
		bottom: scaledOffset,
		left: '50%',
		transform: 'translateX(-50%)',
		height: scaledButtonHeight,
		padding: `0 ${12 / scale}px`,
		fontSize: 14 / scale,
		lineHeight: `${scaledButtonHeight}px`,
		borderRadius: 6 / scale,
		backgroundColor: 'white',
		color: '#333',
		border: 'none',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		gap: 4 / scale,
		boxShadow: `0 ${2 / scale}px ${8 / scale}px rgba(0, 0, 0, 0.15)`,
		whiteSpace: 'nowrap',
		zIndex: 10,
	};

	const iconStyle: React.CSSProperties = {
		width: 16 / scale,
		height: 16 / scale,
	};

	return (
		<button
			style={buttonStyle}
			onClick={handleCropClick}
			onPointerDown={(e) => e.stopPropagation()}
		>
			<Crop style={iconStyle} />
			<span>크롭</span>
		</button>
	);
};
