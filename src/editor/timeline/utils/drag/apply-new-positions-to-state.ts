import {EditorStarterItem} from '../../../items/item-type';
import {TrackCategory, TrackType} from '../../../state/types';
import {getItemCategory} from '../../../utils/get-item-category';
import {removeEmptyTracks} from '../../../utils/remove-empty-tracks';
import {sortTracks} from '../../../utils/sort-tracks';
import {DragPreviewState, PreviewPosition} from '../../drag-preview-provider';
import {insertNewTracks} from './insert-new-tracks';
import {TrackInsertions} from './types';

const calculateOriginalTrackIndex = ({
	currentIndex,
	trackInsertions,
}: {
	currentIndex: number;
	trackInsertions: TrackInsertions | null;
}): number => {
	if (!trackInsertions) {
		return currentIndex;
	}

	switch (trackInsertions.type) {
		case 'top':
			return currentIndex - trackInsertions.count;
		case 'bottom':
			return currentIndex;
		case 'between':
			if (currentIndex < trackInsertions.trackIndex) {
				// 삽입 지점 이전의 track들은 원래 index를 유지
				return currentIndex;
			}
			if (currentIndex < trackInsertions.trackIndex + trackInsertions.count) {
				// 새로운 track들은 원래 index가 없음
				return -1;
			}
			// 삽입 지점 이후의 track들은 뒤로 이동
			return currentIndex - trackInsertions.count;
		default:
			throw new Error(
				`Unexpected trackInsertions: ${JSON.stringify(trackInsertions satisfies never)}`,
			);
	}
};

const getTrackItemsWithoutDraggedOnes = ({
	originalIdx,
	prevTracks,
	itemsToDrag,
}: {
	originalIdx: number;
	prevTracks: TrackType[];
	itemsToDrag: string[];
}): string[] => {
	if (originalIdx < 0 || originalIdx >= prevTracks.length) {
		return [];
	}

	return prevTracks[originalIdx].items.filter(
		(itemId) => !itemsToDrag.includes(itemId),
	);
};

/**
 * 드래그 중인 아이템의 카테고리를 결정
 */
const getDraggedItemCategory = (
	dragPreview: DragPreviewState,
	prevItems: Record<string, EditorStarterItem>,
): TrackCategory => {
	if (dragPreview.itemsBeingDragged.length === 0) {
		return 'video';
	}
	const firstItem = prevItems[dragPreview.itemsBeingDragged[0]];
	return firstItem ? getItemCategory(firstItem) : 'video';
};

const buildTrackItemsMap = ({
	expandedTracks,
	prevTracks,
	itemsToDrag,
	trackInsertions,
}: {
	expandedTracks: TrackType[];
	prevTracks: TrackType[];
	itemsToDrag: string[];
	trackInsertions: TrackInsertions | null;
}): Map<number, string[]> => {
	const trackItemsMap = new Map<number, string[]>();

	for (let idx = 0; idx < expandedTracks.length; idx++) {
		const originalIdx = calculateOriginalTrackIndex({
			currentIndex: idx,
			trackInsertions,
		});
		const trackItems = getTrackItemsWithoutDraggedOnes({
			originalIdx,
			prevTracks,
			itemsToDrag,
		});
		trackItemsMap.set(idx, trackItems);
	}

	return trackItemsMap;
};

const applyPositionsToMaps = ({
	trackItemsMap,
	items,
	newPositions,
}: {
	trackItemsMap: Map<number, string[]>;
	items: Record<string, EditorStarterItem>;
	newPositions: PreviewPosition[];
}): Record<string, EditorStarterItem> => {
	const newItems: Record<string, EditorStarterItem> = {...items};

	for (const newPos of newPositions) {
		const trackItems = trackItemsMap.get(newPos.trackIndex) || [];
		trackItems.push(newPos.id);
		trackItemsMap.set(newPos.trackIndex, trackItems);

		newItems[newPos.id] = {
			...items[newPos.id],
			from: newPos.from,
			durationInFrames: newPos.durationInFrames,
			isDraggingInTimeline: false,
		};
	}

	return newItems;
};

/**
 * Rebuilds tracks from the track items map, sorting items by position
 */
const rebuildTracksFromMap = ({
	expandedTracks,
	trackItemsMap,
	newItems,
}: {
	expandedTracks: TrackType[];
	trackItemsMap: Map<number, string[]>;
	newItems: Record<string, EditorStarterItem>;
}): TrackType[] => {
	return expandedTracks.map((track, idx) => {
		const trackItems = trackItemsMap.get(idx);
		if (!trackItems) {
			throw new Error(
				`Track items not found for index: ${idx}, expandedTracks length: ${expandedTracks.length}`,
			);
		}

		trackItems.sort((a, b) => {
			const itemA = newItems[a];
			const itemB = newItems[b];
			return itemA.from - itemB.from;
		});

		return {
			...track,
			items: trackItems,
		};
	});
};

export const applyNewPositionsToState = ({
	prevTracks,
	dragPreview,
	prevItems,
	shouldRemoveEmptyTracks,
}: {
	prevTracks: TrackType[];
	dragPreview: DragPreviewState;
	prevItems: Record<string, EditorStarterItem>;
	shouldRemoveEmptyTracks: boolean;
}): {tracks: TrackType[]; items: Record<string, EditorStarterItem>} => {
	// 드래그 중인 아이템의 카테고리 결정
	const draggedCategory = getDraggedItemCategory(dragPreview, prevItems);

	const expandedTracks = insertNewTracks({
		tracks: prevTracks,
		trackInsertions: dragPreview.trackInsertions,
		category: draggedCategory,
	});

	const trackItemsMap = buildTrackItemsMap({
		expandedTracks,
		prevTracks,
		itemsToDrag: dragPreview.itemsBeingDragged,
		trackInsertions: dragPreview.trackInsertions,
	});

	const newItems = applyPositionsToMaps({
		trackItemsMap,
		items: prevItems,
		newPositions: dragPreview.positions,
	});

	const newTracks = rebuildTracksFromMap({
		expandedTracks,
		trackItemsMap,
		newItems,
	});

	// 정렬 적용 후 빈 트랙 제거
	const finalTracks = shouldRemoveEmptyTracks
		? sortTracks(removeEmptyTracks(newTracks))
		: sortTracks(newTracks);

	return {
		tracks: finalTracks,
		items: newItems,
	};
};
