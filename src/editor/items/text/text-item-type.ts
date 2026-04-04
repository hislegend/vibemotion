import {BaseItem, CanHaveRotation} from '../shared';

export type TextAlign = 'left' | 'center' | 'right';
export type TextDirection = 'ltr' | 'rtl';

export type FontStyle = {
	variant: string;
	weight: string;
};

// 텍스트 애니메이션 타입
export type TextAnimationType = 
	| 'none' 
	| 'zoom-in' 
	| 'zoom-out' 
	| 'slide-up' 
	| 'slide-down' 
	| 'slide-left' 
	| 'slide-right' 
	| 'bounce' 
	| 'blink';

export type TextItem = BaseItem &
	CanHaveRotation & {
		type: 'text';
		text: string;
		color: string;
		align: TextAlign;
		fontFamily: string;
		fontStyle: FontStyle;
		fontSize: number;
		lineHeight: number;
		letterSpacing: number;
		resizeOnEdit: boolean;
		direction: TextDirection;
		strokeWidth: number;
		strokeColor: string;
		fadeInDurationInSeconds: number;
		fadeOutDurationInSeconds: number;
		// 텍스트 포맷
		isBold: boolean;
		isItalic: boolean;
		isUnderline: boolean;
		// 그림자 효과
		shadowEnabled: boolean;
		shadowColor: string;
		shadowBlur: number;
		shadowOffsetX: number;
		shadowOffsetY: number;
		// 배경 박스
		backgroundColor: string;
		backgroundPadding: number;
		// 애니메이션 효과
		animationType: TextAnimationType;
		animationIntensity: number;  // 0.1 ~ 1.0
	};
