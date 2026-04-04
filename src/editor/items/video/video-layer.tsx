import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Video} from '@remotion/media';
import {RequireCachedAsset} from '../../caching/require-cached-asset';
import {usePreferredLocalUrl} from '../../utils/find-asset-by-id';
import {useAssetFromItem} from '../../utils/use-context';
import {volumeFn} from '../../utils/volume-fn';
import {
	calculateFadeInOpacity,
	calculateFadeOutOpacity,
} from './calculate-fade';
import {VideoItem, TransitionType} from './video-item-type';
import {calculateKenBurnsTransform} from '../image/image-layer';
import {useCroppableLayer} from '../croppable-layer';

// 전환 효과 스타일 계산 함수
const calculateTransitionStyle = (
	transitionType: TransitionType,
	progress: number,
	direction: 'in' | 'out'
): React.CSSProperties => {
	const value = direction === 'in' ? progress : 1 - progress;
	
	switch (transitionType) {
		case 'fade':
			return { opacity: value };
		case 'slide-left':
			return { transform: `translateX(${(1 - value) * -100}%)` };
		case 'slide-right':
			return { transform: `translateX(${(1 - value) * 100}%)` };
		case 'zoom-in':
			return { transform: `scale(${0.5 + value * 0.5})`, opacity: value };
		case 'zoom-out':
			return { transform: `scale(${1.5 - value * 0.5})`, opacity: value };
		default:
			return {};
	}
};

export const VideoLayer = ({
	item,
	trackMuted,
	cropBackground = false,
}: {
	item: VideoItem;
	trackMuted: boolean;
	cropBackground?: boolean;
}) => {
	if (item.type !== 'video') {
		throw new Error('Item is not a video');
	}

	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	// audioRemoved가 true면 볼륨 0, 아니면 정상 볼륨 함수 사용
	const volume = useMemo(() => {
		if (item.audioRemoved) {
			return () => 0; // 오디오가 제거된 경우 볼륨 0
		}
		return volumeFn({
			fps,
			audioFadeInDurationInSeconds: item.audioFadeInDurationInSeconds,
			audioFadeOutDurationInSeconds: item.audioFadeOutDurationInSeconds,
			durationInFrames: item.durationInFrames,
			decibelAdjustment: item.decibelAdjustment,
		});
	}, [
		item.audioRemoved,
		item.audioFadeInDurationInSeconds,
		item.audioFadeOutDurationInSeconds,
		item.decibelAdjustment,
		item.durationInFrames,
		fps,
	]);

	const asset = useAssetFromItem(item);
	const src = usePreferredLocalUrl(asset);

	// 페이드 opacity 계산
	const fadeOpacity = useMemo(() => {
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

	// 전환 효과 스타일 계산
	const transitionStyle = useMemo(() => {
		const transitionDurationFrames = (item.transitionDurationInSeconds ?? 0.3) * fps;
		const hasTransitionIn = item.transitionIn && item.transitionIn !== 'none';
		const hasTransitionOut = item.transitionOut && item.transitionOut !== 'none';
		
		let style: React.CSSProperties = {};
		
		// 시작 전환 효과
		if (hasTransitionIn && frame < transitionDurationFrames) {
			const progress = interpolate(
				frame,
				[0, transitionDurationFrames],
				[0, 1],
				{ extrapolateRight: 'clamp' }
			);
			style = { ...style, ...calculateTransitionStyle(item.transitionIn!, progress, 'in') };
		}
		
		// 종료 전환 효과
		if (hasTransitionOut && frame >= durationInFrames - transitionDurationFrames) {
			const progress = interpolate(
				frame,
				[durationInFrames - transitionDurationFrames, durationInFrames],
				[1, 0],
				{ extrapolateLeft: 'clamp' }
			);
			style = { ...style, ...calculateTransitionStyle(item.transitionOut!, progress, 'out') };
		}
		
		return style;
	}, [frame, durationInFrames, fps, item.transitionIn, item.transitionOut, item.transitionDurationInSeconds]);

	// Ken Burns 효과 계산
	const kenBurnsTransform = useMemo(() => {
		return calculateKenBurnsTransform(
			item.kenBurnsEffect || 'none',
			item.kenBurnsIntensity ?? 0.15,
			frame,
			durationInFrames
		);
	}, [frame, durationInFrames, item.kenBurnsEffect, item.kenBurnsIntensity]);

	// 전환 효과의 opacity를 페이드 opacity와 병합
	const combinedOpacity = useMemo(() => {
		const transitionOpacity = transitionStyle.opacity !== undefined 
			? Number(transitionStyle.opacity) 
			: 1;
		return fadeOpacity * transitionOpacity;
	}, [fadeOpacity, transitionStyle.opacity]);

	// useCroppableLayer 사용
	const {outerStyle, innerStyle, wrapperStyle} = useCroppableLayer({
		item,
		opacity: combinedOpacity,
		borderRadius: item.borderRadius,
		cropBackground,
	});

	// transform 병합 (rotation + transition)
	const finalOuterStyle: React.CSSProperties = useMemo(() => {
		const transitionTransform = transitionStyle.transform || '';
		const baseTransform = outerStyle.transform || '';
		const combinedTransform = transitionTransform 
			? `${baseTransform} ${transitionTransform}` 
			: baseTransform;
		return {
			...outerStyle,
			transform: combinedTransform,
		};
	}, [outerStyle, transitionStyle.transform]);

	const startFrom = item.videoStartFromInSeconds * fps;

	const hasKenBurns = item.kenBurnsEffect && item.kenBurnsEffect !== 'none';

	return (
		<div style={finalOuterStyle}>
			<RequireCachedAsset asset={asset}>
				{hasKenBurns ? (
					<div style={{...kenBurnsTransform, ...wrapperStyle, width: '100%', height: '100%'}}>
						<Video
							volume={volume}
							trimBefore={startFrom}
							src={src}
							style={innerStyle}
							muted={trackMuted || item.audioRemoved}
							playbackRate={item.playbackRate}
						/>
					</div>
				) : (
					<div style={{...wrapperStyle, width: '100%', height: '100%'}}>
						<Video
							volume={volume}
							trimBefore={startFrom}
							src={src}
							style={innerStyle}
							muted={trackMuted || item.audioRemoved}
							playbackRate={item.playbackRate}
						/>
					</div>
				)}
			</RequireCachedAsset>
		</div>
	);
};