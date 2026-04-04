import {EditorStarterItem} from '../../items/item-type';
import {TrackType} from '../../state/types';

export type SnapPoint = {
	frame: number;
	type: 'item-start' | 'item-end';
	itemId: string;
};

/**
 * timeline item들로부터 모든 잠재적 snap point들을 수집
 */
export const collectSnapPoints = ({
	tracks,
	items,
	excludeItemIds,
}: {
	tracks: TrackType[];
	items: Record<string, EditorStarterItem>;
	excludeItemIds: string[];
}): SnapPoint[] => {
	const snapPoints: SnapPoint[] = [];

	// 모든 item들로부터 snap point 수집 (드래그되고 있는 항목들 제외)
	for (const track of tracks) {
		for (const itemId of track.items) {
			if (excludeItemIds.includes(itemId)) {
				continue;
			}

			const item = items[itemId];
			if (!item) {
				continue;
			}

			// 시작 위치 추가
			snapPoints.push({
				frame: item.from,
				type: 'item-start',
				itemId,
			});

			// 끝 위치 추가
			snapPoints.push({
				frame: item.from + item.durationInFrames,
				type: 'item-end',
				itemId,
			});
		}
	}

	// 중복 제거 및 frame별 정렬
	const uniqueSnapPoints = Array.from(
		new Map(snapPoints.map((sp) => [sp.frame, sp])).values(),
	);

	return uniqueSnapPoints.sort((a, b) => a.frame - b.frame);
};

/**
 * 임계값 내에서 가장 가까운 snap point를 찾기
 */
export const findNearestSnapPoint = ({
	targetFrame,
	snapPoints,
	thresholdInFrames,
}: {
	targetFrame: number;
	snapPoints: SnapPoint[];
	thresholdInFrames: number;
}): SnapPoint | null => {
	if (snapPoints.length === 0) {
		return null;
	}

	// snapPoints는 frame 오름차순으로 정렬되어 있어야 함
	let lo = 0;
	let hi = snapPoints.length; // invariant: answer in [lo, hi)
	while (lo < hi) {
		const mid = (lo + hi) >>> 1;
		if (snapPoints[mid].frame < targetFrame) {
			lo = mid + 1;
		} else {
			hi = mid;
		}
	}

	// lo는 frame >= targetFrame인 첫 번째 index
	const candidates: SnapPoint[] = [];
	if (lo < snapPoints.length) {
		candidates.push(snapPoints[lo]);
	}
	if (lo - 1 >= 0) {
		candidates.push(snapPoints[lo - 1]);
	}

	let best: SnapPoint | null = null;
	let bestDist = thresholdInFrames;
	for (const c of candidates) {
		const d = Math.abs(c.frame - targetFrame);
		if (d <= bestDist) {
			bestDist = d;
			best = c;
		}
	}

	return best;
};

/**
 * timeline zoom을 기반으로 pixel 임계값을 frame 임계값으로 변환
 */
export const pixelsToFrames = ({
	pixels,
	timelineWidth,
	visibleFrames,
}: {
	pixels: number;
	timelineWidth: number;
	visibleFrames: number;
}): number => {
	const pixelsPerFrame = timelineWidth / visibleFrames;
	return Math.ceil(pixels / pixelsPerFrame);
};

/**
 * target frame 위치에 snapping 적용
 */
export const applySnapping = ({
	targetFrame,
	snapPoints,
	pixelThreshold,
	timelineWidth,
	visibleFrames,
	isSnappingEnabled,
}: {
	targetFrame: number;
	snapPoints: SnapPoint[];
	pixelThreshold: number;
	timelineWidth: number;
	visibleFrames: number;
	isSnappingEnabled: boolean;
}): {
	snappedFrame: number;
	activeSnapPoint: SnapPoint | null;
} => {
	if (!isSnappingEnabled || snapPoints.length === 0) {
		return {
			snappedFrame: targetFrame,
			activeSnapPoint: null,
		};
	}

	const thresholdInFrames = pixelsToFrames({
		pixels: pixelThreshold,
		timelineWidth,
		visibleFrames,
	});

	const nearestSnapPoint = findNearestSnapPoint({
		targetFrame,
		snapPoints,
		thresholdInFrames,
	});

	if (nearestSnapPoint) {
		return {
			snappedFrame: nearestSnapPoint.frame,
			activeSnapPoint: nearestSnapPoint,
		};
	}

	return {
		snappedFrame: targetFrame,
		activeSnapPoint: null,
	};
};

export type ItemEdge = {frame: number; type: 'left' | 'right'; itemId: string};

/**
 * 여러 item edge들로부터 최적의 snap point 찾기
 */
export const findBestSnapForMultipleEdges = ({
	itemEdges,
	snapPoints,
	pixelThreshold,
	timelineWidth,
	visibleFrames,
	isSnappingEnabled,
}: {
	itemEdges: ItemEdge[];
	snapPoints: SnapPoint[];
	pixelThreshold: number;
	timelineWidth: number;
	visibleFrames: number;
	isSnappingEnabled: boolean;
}): {
	snapOffset: number | null;
	activeSnapPoint: SnapPoint | null;
	snappedEdge: ItemEdge | null;
} => {
	if (!isSnappingEnabled || snapPoints.length === 0 || itemEdges.length === 0) {
		return {
			snapOffset: null,
			activeSnapPoint: null,
			snappedEdge: null,
		};
	}

	const thresholdInFrames = pixelsToFrames({
		pixels: pixelThreshold,
		timelineWidth,
		visibleFrames,
	});

	let bestSnapPoint: SnapPoint | null = null;
	let bestEdge: (typeof itemEdges)[0] | null = null;
	let minDistance = thresholdInFrames + 1;

	// 각 edge를 모든 snap point들과 비교 확인
	for (const edge of itemEdges) {
		const nearestSnapPoint = findNearestSnapPoint({
			targetFrame: edge.frame,
			snapPoints,
			thresholdInFrames,
		});

		if (nearestSnapPoint) {
			const distance = Math.abs(nearestSnapPoint.frame - edge.frame);
			if (distance < minDistance) {
				minDistance = distance;
				bestSnapPoint = nearestSnapPoint;
				bestEdge = edge;
			}
		}
	}

	if (bestSnapPoint && bestEdge) {
		const snapOffset = bestSnapPoint.frame - bestEdge.frame;
		return {
			snapOffset,
			activeSnapPoint: bestSnapPoint,
			snappedEdge: bestEdge,
		};
	}

	return {
		snapOffset: null,
		activeSnapPoint: null,
		snappedEdge: null,
	};
};
