import React, {useContext, useMemo} from 'react';
import {ItemSelectedForCropContext} from '../context-provider';
import {FEATURE_CROP_BACKGROUNDS} from '../flags';
import {EditorStarterItem} from '../items/item-type';
import {getCanCrop, getCropFromItem} from '../utils/get-crop-from-item';
import {getRectAfterCrop} from '../utils/get-dimensions-after-crop';

interface UseCroppableLayerProps {
	item: EditorStarterItem;
	opacity: number;
	borderRadius?: number;
	cropBackground?: boolean;  // true면 원본 영역을 반투명하게 표시
}

interface CroppableLayerStyles {
	outerStyle: React.CSSProperties;
	innerStyle: React.CSSProperties;
	wrapperStyle: React.CSSProperties;
}

/**
 * 크롭 가능한 레이어의 스타일을 계산합니다.
 * - outerStyle: 보이는 영역 (크롭 후)의 위치/크기
 * - innerStyle: 원본 이미지의 스타일 (음수 위치로 크롭 효과)
 * - wrapperStyle: overflow:hidden 등
 * 
 * cropBackground=true일 때:
 * - 원본 전체 영역을 반투명하게 표시 (크롭 모드 배경)
 */
export const useCroppableLayer = ({
	item,
	opacity,
	borderRadius = 0,
	cropBackground = false,
}: UseCroppableLayerProps): CroppableLayerStyles => {
	const itemSelectedForCrop = useContext(ItemSelectedForCropContext);
	const itemIsBeingCropped = item.id === itemSelectedForCrop;

	return useMemo(() => {
		const hasRotation = 'rotation' in item;
		const rotation = hasRotation ? (item as {rotation: number}).rotation : 0;

		// cropBackground 모드면 반투명, 아니면 정상 opacity
		// 크롭 중인 전면 레이어는 항상 불투명
		let effectiveOpacity = opacity;
		if (cropBackground) {
			effectiveOpacity = 0.3;
		} else if (itemIsBeingCropped && FEATURE_CROP_BACKGROUNDS) {
			effectiveOpacity = opacity; // 전면 레이어는 정상 opacity 유지
		}

		if (!getCanCrop(item)) {
			// 크롭 불가능한 아이템은 기본 스타일
			return {
				outerStyle: {
					position: 'absolute',
					left: item.left,
					top: item.top,
					width: item.width,
					height: item.height,
					transform: `rotate(${rotation}deg)`,
					opacity: effectiveOpacity,
				},
				innerStyle: {
					width: '100%',
					height: '100%',
					objectFit: 'fill' as const,
					borderRadius,
				},
				wrapperStyle: {},
			};
		}

		const crop = getCropFromItem(item);
		
		// cropBackground 모드면 원본 전체 영역 표시 (크롭 무시)
		if (cropBackground) {
			return {
				outerStyle: {
					position: 'absolute',
					left: item.left,
					top: item.top,
					width: item.width,
					height: item.height,
					transform: `rotate(${rotation}deg)`,
					opacity: effectiveOpacity,
					overflow: 'hidden',
				},
				innerStyle: {
					width: '100%',
					height: '100%',
					objectFit: 'fill' as const,
					borderRadius,
				},
				wrapperStyle: {},
			};
		}

		if (!crop || (crop.cropLeft === 0 && crop.cropTop === 0 && crop.cropRight === 0 && crop.cropBottom === 0)) {
			// 크롭 없음 - 기본 스타일
			return {
				outerStyle: {
					position: 'absolute',
					left: item.left,
					top: item.top,
					width: item.width,
					height: item.height,
					transform: `rotate(${rotation}deg)`,
					opacity: effectiveOpacity,
					overflow: 'hidden',
				},
				innerStyle: {
					width: '100%',
					height: '100%',
					objectFit: 'fill' as const,
					borderRadius,
				},
				wrapperStyle: {},
			};
		}

		// 크롭 적용
		const rectAfterCrop = getRectAfterCrop(item);

		// 원본 이미지 대비 크롭 영역의 스케일
		const visibleWidthRatio = 1 - crop.cropLeft - crop.cropRight;
		const visibleHeightRatio = 1 - crop.cropTop - crop.cropBottom;

		// 원본 이미지를 크롭 영역으로 스케일링
		// 보이는 영역 크기 = rectAfterCrop.width/height
		// 원본 이미지 크기 = 보이는 영역 / 비율
		const originalImageWidth = rectAfterCrop.width / visibleWidthRatio;
		const originalImageHeight = rectAfterCrop.height / visibleHeightRatio;

		// 크롭된 부분만큼 이미지를 이동
		const imageOffsetLeft = -crop.cropLeft * originalImageWidth;
		const imageOffsetTop = -crop.cropTop * originalImageHeight;

		return {
			outerStyle: {
				position: 'absolute',
				left: rectAfterCrop.left,
				top: rectAfterCrop.top,
				width: rectAfterCrop.width,
				height: rectAfterCrop.height,
				transform: `rotate(${rotation}deg)`,
				opacity: effectiveOpacity,
				overflow: 'hidden',
			},
			innerStyle: {
				position: 'absolute',
				left: imageOffsetLeft,
				top: imageOffsetTop,
				width: originalImageWidth,
				height: originalImageHeight,
				objectFit: 'fill' as const,
				borderRadius,
			},
			wrapperStyle: {
				width: '100%',
				height: '100%',
				position: 'relative',
				overflow: 'hidden',
			},
		};
	}, [item, opacity, borderRadius, cropBackground, itemIsBeingCropped]);
};
