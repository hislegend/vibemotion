import {useContext, useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {
	TextItemEditingContext,
	TextItemHoverPreviewContext,
} from '../../context-provider';
import {turnFontStyleIntoCss} from '../../inspector/controls/font-style-controls/font-style-controls';
import {FontInfoContext} from '../../utils/text/font-info';
import {loadFontFromTextItem} from '../../utils/text/load-font-from-text-item';
import {
	calculateFadeInOpacity,
	calculateFadeOutOpacity,
} from '../video/calculate-fade';
import {overrideTextItemWithHoverPreview} from './override-text-item-with-hover-preview';
import {CanvasTextEditor} from './text-editor';
import {TextItem} from './text-item-type';
import {calculateTextAnimationStyle} from './text-animation';

export const TextLayer = ({
	item: itemWithoutHoverPreview,
}: {
	item: TextItem;
}) => {
	if (itemWithoutHoverPreview.type !== 'text') {
		throw new Error('Item is not a text');
	}

	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	const textItemHoverPreview = useContext(TextItemHoverPreviewContext);
	const item = useMemo(
		() =>
			overrideTextItemWithHoverPreview({
				textItem: itemWithoutHoverPreview,
				hoverPreview: textItemHoverPreview,
			}),
		[itemWithoutHoverPreview, textItemHoverPreview],
	);

	const opacity = useMemo(() => {
		const inOpacity = calculateFadeInOpacity({
			currentFrame: frame,
			fadeInDurationInSeconds: item.fadeInDurationInSeconds,
			framesPerSecond: fps,
		});
		const outOpacity = calculateFadeOutOpacity({
			currentFrame: frame,
			fadeOutDurationInSeconds: item.fadeOutDurationInSeconds,
			framesPerSecond: fps,
			totalDurationInFrames: durationInFrames,
		});
		return inOpacity * outOpacity * item.opacity;
	}, [
		item.fadeInDurationInSeconds,
		fps,
		frame,
		item.opacity,
		durationInFrames,
		item.fadeOutDurationInSeconds,
	]);

	// 애니메이션 스타일 계산
	const animationStyle = useMemo(() => {
		const animationType = item.animationType ?? 'none';
		if (animationType === 'none') return {};
		return calculateTextAnimationStyle(
			animationType,
			frame,
			fps,
			durationInFrames,
			item.animationIntensity ?? 0.5
		);
	}, [item.animationType, item.animationIntensity, frame, fps, durationInFrames]);

	const context = useContext(FontInfoContext);
	const textItemEditing = useContext(TextItemEditingContext);

	loadFontFromTextItem({
		fontFamily: item.fontFamily,
		fontVariant: item.fontStyle.variant,
		fontWeight: item.fontStyle.weight,
		fontInfosDuringRendering: context[item.fontFamily] ?? null,
	});

	if (item.id === textItemEditing) {
		return <CanvasTextEditor item={item} />;
	}

	// 폰트 스타일 계산 (isBold, isItalic 우선)
	const computedFontWeight = item.isBold ? '700' : item.fontStyle.weight;
	const computedFontStyle = item.isItalic ? 'italic' : item.fontStyle.variant;

	// 그림자 효과
	const textShadow = item.shadowEnabled
		? `${item.shadowOffsetX}px ${item.shadowOffsetY}px ${item.shadowBlur}px ${item.shadowColor}`
		: 'none';

	// 배경 스타일
	const hasBackground = item.backgroundColor && item.backgroundColor !== 'transparent';

	// 기본 transform + 애니메이션 transform 병합
	const baseTransform = `rotate(${item.rotation}deg)`;
	const animTransform = animationStyle.transform as string | undefined;
	const combinedTransform = animTransform 
		? `${baseTransform} ${animTransform}` 
		: baseTransform;

	// 최종 opacity (페이드 + 애니메이션)
	const finalOpacity = animationStyle.opacity !== undefined 
		? opacity * (animationStyle.opacity as number) 
		: opacity;

	return (
		<div
			dir={item.direction}
			style={{
				fontSize: item.fontSize,
				color: item.color,
				lineHeight: String(item.lineHeight),
				letterSpacing: `${item.letterSpacing}px`,
				left: item.left,
				top: item.top,
				width: item.width,
				height: item.height,
				position: 'absolute',
				whiteSpace: 'pre-wrap',
				display: 'block',
				fontFamily: item.fontFamily,
				fontWeight: computedFontWeight,
				fontStyle: computedFontStyle,
				textDecoration: item.isUnderline ? 'underline' : 'none',
				overflow: 'visible',
				wordWrap: 'break-word',
				boxSizing: 'border-box',
				userSelect: 'none',
				textAlign: item.align,
				opacity: finalOpacity,
				transform: combinedTransform,
				WebkitTextStroke: item.strokeWidth
					? `${item.strokeWidth}px ${item.strokeColor}`
					: '0',
				paintOrder: 'stroke',
				textShadow,
				backgroundColor: hasBackground ? item.backgroundColor : 'transparent',
				padding: hasBackground ? item.backgroundPadding : 0,
				borderRadius: hasBackground ? 4 : 0,
			}}
		>
			{item.text}
		</div>
	);
};
