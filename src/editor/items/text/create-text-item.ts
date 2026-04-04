import {generateRandomId} from '../../utils/generate-random-id';
import {loadFontFromTextItem} from '../../utils/text/load-font-from-text-item';
import {getTextDimensions} from '../../utils/text/measure-text';
import {stringSeemsRightToLeft} from '../../utils/text/right-to-left';
import {EditorStarterItem} from '../item-type';
import {FontStyle} from './text-item-type';

const TEXT_DURATION_IN_FRAMES = 100;
export const DEFAULT_FONT_SIZE = 80;

export const createTextItem = async ({
	xOnCanvas,
	yOnCanvas,
	from,
	text,
	align,
}: {
	xOnCanvas: number;
	yOnCanvas: number;
	from: number;
	text: string;
	align: 'left' | 'center';
}): Promise<EditorStarterItem> => {
	const id = generateRandomId();
	const defaultFontFamily = 'Noto Sans KR';
	await loadFontFromTextItem({
		fontFamily: defaultFontFamily,
		fontVariant: 'normal',
		fontWeight: '400',
		fontInfosDuringRendering: null,
	});

	const defaultLineHeight = 1.2;
	const defaultLetterSpacing = 0;

	const fontStyle: FontStyle = {
		variant: 'normal',
		weight: '400',
	};

	const textDimensions = getTextDimensions({
		text,
		fontFamily: defaultFontFamily,
		fontSize: DEFAULT_FONT_SIZE,
		lineHeight: defaultLineHeight,
		letterSpacing: defaultLetterSpacing,
		fontStyle,
	});

	const top = Math.round(yOnCanvas - textDimensions.height / 2);
	const left =
		align === 'center'
			? Math.round(xOnCanvas - textDimensions.width / 2)
			: Math.round(xOnCanvas);

	return {
		id,
		durationInFrames: TEXT_DURATION_IN_FRAMES,
		from,
		type: 'text',
		text,
		color: '#ffffff',
		top,
		left,
		width: textDimensions.width,
		height: textDimensions.height,
		align: align,
		opacity: 1,
		rotation: 0,
		fontFamily: defaultFontFamily,
		fontSize: DEFAULT_FONT_SIZE,
		lineHeight: defaultLineHeight,
		letterSpacing: defaultLetterSpacing,
		resizeOnEdit: true,
		direction: stringSeemsRightToLeft(text) ? 'rtl' : 'ltr',
		fontStyle,
		isDraggingInTimeline: false,
		strokeWidth: 0,
		strokeColor: '#000000',
		fadeInDurationInSeconds: 0,
		fadeOutDurationInSeconds: 0,
		// 텍스트 포맷 기본값
		isBold: false,
		isItalic: false,
		isUnderline: false,
		// 그림자 효과 기본값
		shadowEnabled: false,
		shadowColor: '#000000',
		shadowBlur: 4,
		shadowOffsetX: 2,
		shadowOffsetY: 2,
		// 배경 박스 기본값
		backgroundColor: 'transparent',
		backgroundPadding: 8,
		// 애니메이션 효과 기본값
		animationType: 'none',
		animationIntensity: 0.5,
	};
};
