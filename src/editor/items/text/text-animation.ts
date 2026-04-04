import {interpolate, spring} from 'remotion';
import React from 'react';

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

/**
 * 텍스트 애니메이션 스타일 계산
 * @param animationType - 애니메이션 타입
 * @param frame - 현재 프레임
 * @param fps - 초당 프레임 수
 * @param durationInFrames - 전체 지속 프레임
 * @param intensity - 애니메이션 강도 (0.1 ~ 1.0)
 * @returns CSS 스타일 객체
 */
export function calculateTextAnimationStyle(
	animationType: TextAnimationType,
	frame: number,
	fps: number,
	durationInFrames: number,
	intensity: number = 0.5
): React.CSSProperties {
	if (!animationType || animationType === 'none' || durationInFrames === 0) {
		return {};
	}

	// 애니메이션 진입 구간 (전체 길이의 20% 또는 최대 1초)
	const animationDuration = Math.min(durationInFrames * 0.2, fps);
	const clampedIntensity = Math.max(0.1, Math.min(1, intensity));

	switch (animationType) {
		case 'zoom-in': {
			// 작게 시작 -> 원래 크기
			const startScale = 1 - clampedIntensity * 0.5; // 0.5 ~ 0.95
			const scale = interpolate(
				frame,
				[0, animationDuration],
				[startScale, 1],
				{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
			);
			return {transform: `scale(${scale})`};
		}

		case 'zoom-out': {
			// 크게 시작 -> 원래 크기
			const startScale = 1 + clampedIntensity * 0.5; // 1.05 ~ 1.5
			const scale = interpolate(
				frame,
				[0, animationDuration],
				[startScale, 1],
				{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
			);
			return {transform: `scale(${scale})`};
		}

		case 'slide-up': {
			const offset = 100 * clampedIntensity; // 10 ~ 100px
			const translateY = interpolate(
				frame,
				[0, animationDuration],
				[offset, 0],
				{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
			);
			return {transform: `translateY(${translateY}px)`};
		}

		case 'slide-down': {
			const offset = -100 * clampedIntensity;
			const translateY = interpolate(
				frame,
				[0, animationDuration],
				[offset, 0],
				{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
			);
			return {transform: `translateY(${translateY}px)`};
		}

		case 'slide-left': {
			const offset = 100 * clampedIntensity;
			const translateX = interpolate(
				frame,
				[0, animationDuration],
				[offset, 0],
				{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
			);
			return {transform: `translateX(${translateX}px)`};
		}

		case 'slide-right': {
			const offset = -100 * clampedIntensity;
			const translateX = interpolate(
				frame,
				[0, animationDuration],
				[offset, 0],
				{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
			);
			return {transform: `translateX(${translateX}px)`};
		}

		case 'bounce': {
			// spring 함수 사용 - 탄성 있는 스케일 애니메이션
			const springValue = spring({
				frame,
				fps,
				config: {
					damping: 10 + (1 - clampedIntensity) * 10, // 강도가 높으면 damping 낮음
					stiffness: 100,
					mass: 0.5,
				},
				durationInFrames: Math.floor(animationDuration * 1.5),
			});
			const scale = 0.5 + springValue * 0.5; // 0.5 -> 1.0
			return {transform: `scale(${scale})`};
		}

		case 'blink': {
			// 깜빡임 효과 - 강도에 따라 속도 조절
			const blinkSpeed = Math.max(2, Math.floor(fps / (1 + clampedIntensity * 3)));
			const blinkPhase = Math.floor(frame / blinkSpeed) % 2;
			const opacity = blinkPhase === 0 ? 1 : 0.2 + (1 - clampedIntensity) * 0.5;
			return {opacity};
		}

		default:
			return {};
	}
}

// 애니메이션 타입 레이블 (한글)
export const ANIMATION_TYPE_LABELS: Record<TextAnimationType, string> = {
	'none': '없음',
	'zoom-in': '줌 인',
	'zoom-out': '줌 아웃',
	'slide-up': '위로 슬라이드',
	'slide-down': '아래로 슬라이드',
	'slide-left': '왼쪽으로 슬라이드',
	'slide-right': '오른쪽으로 슬라이드',
	'bounce': '바운스',
	'blink': '깜빡임',
};

// 애니메이션 타입 목록
export const ANIMATION_TYPES: TextAnimationType[] = [
	'none',
	'zoom-in',
	'zoom-out',
	'slide-up',
	'slide-down',
	'slide-left',
	'slide-right',
	'bounce',
	'blink',
];
