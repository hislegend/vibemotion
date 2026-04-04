import React, {useMemo} from 'react';
import {Img, useCurrentFrame, useVideoConfig} from 'remotion';
import {RequireCachedAsset} from '../../caching/require-cached-asset';
import {usePreferredLocalUrl} from '../../utils/find-asset-by-id';
import {useAssetFromItem} from '../../utils/use-context';
import {
	calculateFadeInOpacity,
	calculateFadeOutOpacity,
} from '../video/calculate-fade';
import {ImageItem, KenBurnsEffect} from './image-item-type';
import {useCroppableLayer} from '../croppable-layer';

export const calculateKenBurnsTransform = (
	effect: KenBurnsEffect,
	intensity: number,
	frame: number,
	durationInFrames: number
): React.CSSProperties => {
	if (effect === 'none') return {};
	
	const progress = durationInFrames > 0 ? frame / durationInFrames : 0;

	if (effect === 'zoom-in') {
		const scale = 1 + progress * intensity;
		return {transform: `scale(${scale})`};
	}
	if (effect === 'zoom-out') {
		const scale = 1 + intensity - progress * intensity;
		return {transform: `scale(${scale})`};
	}
	if (effect === 'pan-left') {
		const translateX = progress * intensity * 100;
		return {transform: `scale(${1 + intensity}) translateX(-${translateX}%)`};
	}
	if (effect === 'pan-right') {
		const translateX = progress * intensity * 100;
		return {transform: `scale(${1 + intensity}) translateX(${translateX}%)`};
	}
	return {};
};

const ImageItemUnmemoized: React.FC<{
	item: ImageItem;
	cropBackground?: boolean;
}> = ({item, cropBackground = false}) => {
	if (item.type !== 'image') {
		throw new Error('Item is not an image');
	}

	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const asset = useAssetFromItem(item);

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

	const kenBurnsTransform = useMemo(() => {
		const effect = item.kenBurnsEffect || 'none';
		const intensity = item.kenBurnsIntensity ?? 0.15;
		return calculateKenBurnsTransform(effect, intensity, frame, durationInFrames);
	}, [frame, durationInFrames, item.kenBurnsEffect, item.kenBurnsIntensity]);

	// 크롭 가능 레이어 스타일 사용
	const {outerStyle, innerStyle, wrapperStyle} = useCroppableLayer({
		item,
		opacity,
		borderRadius: item.borderRadius,
		cropBackground,
	});

	const src = usePreferredLocalUrl(asset);

	return (
		<div style={outerStyle}>
			<RequireCachedAsset asset={asset}>
				<div style={{...kenBurnsTransform, ...wrapperStyle, width: '100%', height: '100%'}}>
					<Img
						crossOrigin="anonymous"
						pauseWhenLoading
						style={innerStyle}
						src={src}
					/>
				</div>
			</RequireCachedAsset>
		</div>
	);
};

export const ImageLayer = React.memo(ImageItemUnmemoized);