import {BaseItem, CanHaveBorderRadius, CanHaveCrop, CanHaveRotation} from '../shared';
import {KenBurnsEffect} from '../image/image-item-type';

// 전환 효과 타입
export type TransitionType = 'none' | 'fade' | 'slide-left' | 'slide-right' | 'zoom-in' | 'zoom-out';

export type VideoItem = BaseItem &
	CanHaveBorderRadius &
	CanHaveRotation &
	CanHaveCrop & {
		type: 'video';
		videoStartFromInSeconds: number;
		decibelAdjustment: number;
		playbackRate: number;
		audioFadeInDurationInSeconds: number;
		audioFadeOutDurationInSeconds: number;
		fadeInDurationInSeconds: number;
		fadeOutDurationInSeconds: number;
		assetId: string;
		keepAspectRatio: boolean;
		kenBurnsEffect?: KenBurnsEffect;
		kenBurnsIntensity?: number;
		// 전환 효과 속성
		transitionIn?: TransitionType;
		transitionOut?: TransitionType;
		transitionDurationInSeconds?: number;
		// 오디오 제거 상태 (오디오 추출 시 true로 설정)
		audioRemoved?: boolean;
	};
