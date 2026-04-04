import {EditorStarterItem} from '../../../../items/item-type';
import {TrackType} from '../../../../state/types';
import {PreviewPosition} from '../../../drag-preview-provider';

// overlap이 발생하지 않는지 검증하는 helper function
export const hasNoOverlaps = ({
	tentativePositions,
	draggedItemIds,
	tracks,
	allItems,
}: {
	tentativePositions: Array<PreviewPosition>;
	draggedItemIds: string[];
	tracks: TrackType[];
	allItems: Record<string, EditorStarterItem>;
}): boolean => {
	const positionsByTrack = new Map<number, typeof tentativePositions>();

	for (const pos of tentativePositions) {
		const trackPositions = positionsByTrack.get(pos.trackIndex) || [];
		trackPositions.push(pos);
		positionsByTrack.set(pos.trackIndex, trackPositions);
	}

	for (const [trackIndex, trackTentativePositions] of positionsByTrack) {
		// 아직 존재하지 않는 track에서는 충돌 없음
		if (!tracks[trackIndex]) {
			continue;
		}

		const existingItems = tracks[trackIndex].items
			.filter((itemId) => !draggedItemIds.includes(itemId))
			.map((itemId) => allItems[itemId]);

		const allItemsOnTrack = [
			...existingItems,
			...trackTentativePositions.map((pos) => ({
				id: pos.id,
				from: pos.from,
				durationInFrames: pos.durationInFrames,
				type: 'temp' as const, // overlap 검사에서는 type이 중요하지 않음
			})),
		];

		allItemsOnTrack.sort((a, b) => a.from - b.from);

		for (let i = 0; i < allItemsOnTrack.length - 1; i++) {
			const current = allItemsOnTrack[i];
			const next = allItemsOnTrack[i + 1];

			if (current.from + current.durationInFrames > next.from) {
				return false; // overlap 감지
			}
		}

		const tentativeIds = new Set<string>();
		for (const pos of trackTentativePositions) {
			if (tentativeIds.has(pos.id)) {
				return false; // 동일한 track에 중복 item
			}
			tentativeIds.add(pos.id);
		}
	}

	return true;
};
