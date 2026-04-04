import type {EditorStarterItem} from '../../../items/item-type';
import type {TrackType} from '../../../state/types';
import type {PreviewPosition} from '../../drag-preview-provider';

export const overlapsLeft = ({
	item,
	from,
}: {
	item: EditorStarterItem;
	from: number;
}) => {
	return item.from <= from && item.from + item.durationInFrames > from;
};

export const overlapsRight = ({
	item,
	from,
	durationInFrames,
}: {
	item: EditorStarterItem;
	from: number;
	durationInFrames: number;
}) => {
	return (
		item.from < from + durationInFrames &&
		item.from + item.durationInFrames > from &&
		item.from > from
	);
};

const doesFitIn = (
	from: number,
	durationInFrames: number,
	otherItems: EditorStarterItem[],
) => {
	return otherItems.every((item) => {
		const leftOverlap = overlapsLeft({item, from});
		const rightOverlap = overlapsRight({item, from, durationInFrames});
		return !leftOverlap && !rightOverlap;
	});
};

export const getAlternativeForCollisionRight = ({
	collisionRight,
	otherItemsOnTrack,
	durationInFrames,
	items,
}: {
	collisionRight: string | null;
	otherItemsOnTrack: string[];
	durationInFrames: number;
	items: Record<string, EditorStarterItem>;
}) => {
	if (!collisionRight) {
		return null;
	}
	const item = items[collisionRight];
	const shiftedFrom = item.from - durationInFrames;

	if (shiftedFrom < 0) {
		return null;
	}

	const doesFit = doesFitIn(
		shiftedFrom,
		durationInFrames,
		otherItemsOnTrack.map((i) => items[i]),
	);
	if (!doesFit) {
		return null;
	}
	return shiftedFrom;
};

export const getAlternativeForCollisionLeft = ({
	collisionLeft,
	otherItemsOnTrack,
	durationInFrames,
	items,
}: {
	collisionLeft: string | null;
	otherItemsOnTrack: string[];
	durationInFrames: number;
	items: Record<string, EditorStarterItem>;
}) => {
	if (!collisionLeft) {
		return null;
	}
	const item = items[collisionLeft];

	const shiftedFrom = item.from + item.durationInFrames;
	if (shiftedFrom < 0) {
		return null;
	}
	const doesFit = doesFitIn(
		shiftedFrom,
		durationInFrames,
		otherItemsOnTrack.map((i) => items[i]),
	);
	if (!doesFit) {
		return null;
	}

	return shiftedFrom;
};

// 드래그 중인 item들의 그룹을 나타내는 가상 item
interface VirtualTrackItem {
	leftmost: number;
	rightmost: number;
	trackIndex: number;
}

/**
 * 드래그 중인 item 그룹에 대한 대체 위치를 계산합니다.
 * 대체 위치는 겹침을 피하기 위해 최소한의 이동이 필요한 위치입니다.
 *
 * @param tentativePositions - 그룹 내 item들의 임시 위치
 * @param draggedItemIds - 그룹 내 item들의 id
 * @param tracks - 그룹 내 item들의 track
 * @param allItems - 그룹 내 모든 item
 * @returns 그룹에 대한 대체 위치인 **frame position**을 반환합니다.
 *
 * 구체적으로, 그룹의 모든 item이 timeline의 기존 item들과
 * 겹치지 않고 들어갈 수 있도록 하는
 * 그룹에 대한 가장 왼쪽 frame 위치입니다.
 *
 * 대체 위치가 없으면 `null`을 반환합니다.
 */
export const getAlternativeForGroupCollision = ({
	tentativePositions,
	draggedItemIds,
	tracks,
	allItems,
}: {
	tentativePositions: PreviewPosition[];
	draggedItemIds: string[];
	tracks: TrackType[];
	allItems: Record<string, EditorStarterItem>;
}): number | null => {
	const trackVirtualItems = new Map<number, VirtualTrackItem>();

	// 그룹이 드래그되는 각 track에 대한 가상 item 생성
	// 충돌을 더 쉬게 찾기 위해서
	for (const position of tentativePositions) {
		const trackIndex = position.trackIndex;
		const itemLeft = position.from;
		const itemRight = position.from + position.durationInFrames;

		if (!trackVirtualItems.has(trackIndex)) {
			trackVirtualItems.set(trackIndex, {
				leftmost: itemLeft,
				rightmost: itemRight,
				trackIndex,
			});
		} else {
			const existing = trackVirtualItems.get(trackIndex)!;
			existing.leftmost = Math.min(existing.leftmost, itemLeft);
			existing.rightmost = Math.max(existing.rightmost, itemRight);
		}
	}

	// 그룹에 대한 가장 왼쪽 frame 위치 찾기
	const alternativePositionCandidates: number[] = [];
	const originalGroupLeftmost = Math.min(
		...tentativePositions.map((p) => p.from),
	);

	// 각 대상 track에 대해 충돌과 대체 위치 찾기
	// 그리고 그룹에 대한 대체 위치 계산
	for (const [trackIndex, virtualItem] of trackVirtualItems) {
		if (!tracks[trackIndex] || trackIndex < 0) {
			continue;
		}

		const otherItemsOnThisTrack = tracks[trackIndex].items.filter(
			(id) => !draggedItemIds.includes(id),
		);

		if (otherItemsOnThisTrack.length === 0) {
			continue;
		}

		const virtualItemDuration = virtualItem.rightmost - virtualItem.leftmost;

		const leftCollision =
			otherItemsOnThisTrack.find((itemId) =>
				overlapsLeft({item: allItems[itemId], from: virtualItem.leftmost}),
			) || null;

		const rightCollision =
			otherItemsOnThisTrack.find((itemId) =>
				overlapsRight({
					item: allItems[itemId],
					from: virtualItem.leftmost,
					durationInFrames: virtualItemDuration,
				}),
			) || null;

		const leftAlternative = getAlternativeForCollisionLeft({
			collisionLeft: leftCollision,
			otherItemsOnTrack: otherItemsOnThisTrack,
			durationInFrames: virtualItemDuration,
			items: allItems,
		});

		const rightAlternative = getAlternativeForCollisionRight({
			collisionRight: rightCollision,
			otherItemsOnTrack: otherItemsOnThisTrack,
			durationInFrames: virtualItemDuration,
			items: allItems,
		});

		if (leftAlternative !== null) {
			const offsetFromVirtualToGroup =
				originalGroupLeftmost - virtualItem.leftmost;
			alternativePositionCandidates.push(
				leftAlternative + offsetFromVirtualToGroup,
			);
		}

		if (rightAlternative !== null) {
			const offsetFromVirtualToGroup =
				originalGroupLeftmost - virtualItem.leftmost;
			alternativePositionCandidates.push(
				rightAlternative + offsetFromVirtualToGroup,
			);
		}
	}

	if (alternativePositionCandidates.length === 0) {
		return null;
	}

	// 최소한의 이동이 필요한 대체 위치 선택
	const optimalFrame = alternativePositionCandidates.reduce(
		(best, candidate) => {
			const bestShift = Math.abs(originalGroupLeftmost - best);
			const candidateShift = Math.abs(originalGroupLeftmost - candidate);
			return candidateShift < bestShift ? candidate : best;
		},
	);

	return optimalFrame;
};
