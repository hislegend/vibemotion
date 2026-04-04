import type {Dimensions} from '@remotion/layout-utils';

export type Rect = {
	width: number;
	height: number;
	top: number;
	left: number;
};

// aspect ratio를 container에 맞게 resize하고
// 중앙에 배치
export const fitElementSizeInContainer = ({
	containerSize,
	elementSize,
}: {
	containerSize: Dimensions;
	elementSize: Dimensions;
}): Rect => {
	const heightRatio = containerSize.height / elementSize.height;
	const widthRatio = containerSize.width / elementSize.width;

	const ratio = Math.min(heightRatio, widthRatio);

	const newWidth = elementSize.width * ratio;
	const newHeight = elementSize.height * ratio;

	if (
		newWidth > containerSize.width + 0.000001 ||
		newHeight > containerSize.height + 0.000001
	) {
		throw new Error(
			`Element is too big to fit into the container. Max size: ${containerSize.width}x${containerSize.height}, element size: ${newWidth}x${newHeight}`,
		);
	}

	return {
		width: newWidth,
		height: newHeight,
		top: (containerSize.height - newHeight) / 2,
		left: (containerSize.width - newWidth) / 2,
	};
};
