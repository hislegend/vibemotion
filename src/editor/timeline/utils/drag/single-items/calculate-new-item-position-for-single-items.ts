import {EditorStarterItem} from '../../../../items/item-type';
import {TrackType} from '../../../../state/types';
import {getItemCategory} from '../../../../utils/get-item-category';
import {
	DragPreviewState,
	PreviewPosition,
} from '../../../drag-preview-provider';
import {SnapPoint} from '../../snap-points';
import {getNewPositionAfterDrag} from '../calculate-new-item';
import {calculateSingleItemNewPosition} from '../calculate-single-item-new-position';
import {TrackOffsetResult} from '../get-track-offset';
import {computeTrackInsertionInfoforSingleItem} from './compute-track-insertion-info-for-single-item';

import {TrackCategory} from '../../../../state/types';

/**
 * 드래그 대상 아이템과 같은 카테고리의 트랙만 필터링
 */
const filterSameCategoryTracks = (
	tracks: TrackType[],
	itemCategory: string,
): {track: TrackType; originalIndex: number}[] => {
	return tracks
		.map((track, idx) => ({track, originalIndex: idx}))
		.filter(({track}) => track.category === itemCategory);
};

/**
 * 카테고리별로 새 트랙이 삽입될 적절한 위치 반환
 * text: 맨 위(0), video: 중간(audio 앞), audio: 맨 아래
 */
const getInsertPositionForCategory = (
	category: TrackCategory,
	tracks: TrackType[],
): number => {
	if (category === 'text') {
		return 0; // 자막은 맨 위
	}
	if (category === 'audio') {
		return tracks.length; // 오디오는 맨 아래
	}
	// video는 audio 트랙 앞에 삽입
	const firstAudioIdx = tracks.findIndex((t) => t.category === 'audio');
	return firstAudioIdx === -1 ? tracks.length : firstAudioIdx;
};

export const calculateNewItemPositionForSingleItem = ({
	draggedItem,
	tracks,
	allItems,
	frameOffset,
	trackOffsetResult,
	snapPoint,
}: {
	draggedItem: PreviewPosition;
	tracks: TrackType[];
	allItems: Record<string, EditorStarterItem>;
	frameOffset: number;
	trackOffsetResult: TrackOffsetResult;
	snapPoint: SnapPoint | null;
}): DragPreviewState | null => {
	// 드래그 중인 아이템의 카테고리 확인
	const item = allItems[draggedItem.id];
	if (!item) return null;

	const itemCategory = getItemCategory(item);
	const sameCategoryTracks = filterSameCategoryTracks(tracks, itemCategory);

	// 단일 item에 대한 track 삽입 처리 - 같은 카테고리 트랙 사이에만 허용
	if (trackOffsetResult.type === 'insert-between') {
		// 같은 카테고리 트랙이 없으면 카테고리에 맞는 위치에 새 트랙 생성
		if (sameCategoryTracks.length === 0) {
			const insertPosition = getInsertPositionForCategory(itemCategory, tracks);
			return {
				positions: [
					getNewPositionAfterDrag({
						item: draggedItem,
						frameOffset,
						newTrackIndex: insertPosition,
					}),
				],
				trackInsertions: {
					type: 'between',
					trackIndex: insertPosition,
					count: 1,
				},
				itemsBeingDragged: [draggedItem.id],
				snapPoint,
			};
		}
		const firstCategoryIdx = sameCategoryTracks[0].originalIndex;
		const lastCategoryIdx =
			sameCategoryTracks[sameCategoryTracks.length - 1].originalIndex;

		// 삽입 위치를 같은 카테고리 범위로 제한
		const clampedPosition = Math.max(
			firstCategoryIdx,
			Math.min(trackOffsetResult.position, lastCategoryIdx + 1),
		);

		return {
			positions: [
				getNewPositionAfterDrag({
					item: draggedItem,
					frameOffset,
					newTrackIndex: clampedPosition,
				}),
			],
			trackInsertions: {
				type: 'between',
				trackIndex: clampedPosition,
				count: 1,
			},
			itemsBeingDragged: [draggedItem.id],
			snapPoint,
		};
	}

	// edge에서 track 생성 처리 - 카테고리별 제한
	if (trackOffsetResult.type === 'create-at-top') {
		// 같은 카테고리 트랙이 있으면 그 범위의 맨 위에 삽입
		if (sameCategoryTracks.length > 0) {
			const firstCategoryIdx = sameCategoryTracks[0].originalIndex;
			return {
				positions: [
					getNewPositionAfterDrag({
						frameOffset,
						item: draggedItem,
						newTrackIndex: firstCategoryIdx,
					}),
				],
				trackInsertions: {
					type: 'between',
					trackIndex: firstCategoryIdx,
					count: 1,
				},
				itemsBeingDragged: [draggedItem.id],
				snapPoint,
			};
		}
		// 같은 카테고리 트랙이 없으면 카테고리에 맞는 위치에 생성
		const insertPosition = getInsertPositionForCategory(itemCategory, tracks);
		return {
			positions: [
				getNewPositionAfterDrag({
					frameOffset,
					item: draggedItem,
					newTrackIndex: insertPosition,
				}),
			],
			trackInsertions: {
				type: 'between',
				trackIndex: insertPosition,
				count: 1,
			},
			itemsBeingDragged: [draggedItem.id],
			snapPoint,
		};
	}

	if (trackOffsetResult.type === 'create-at-bottom') {
		// 같은 카테고리 트랙이 있으면 그 범위의 맨 아래에 삽입
		if (sameCategoryTracks.length > 0) {
			const lastCategoryIdx =
				sameCategoryTracks[sameCategoryTracks.length - 1].originalIndex;
			return {
				positions: [
					getNewPositionAfterDrag({
						frameOffset,
						item: draggedItem,
						newTrackIndex: lastCategoryIdx + 1,
					}),
				],
				trackInsertions: {
					type: 'between',
					trackIndex: lastCategoryIdx + 1,
					count: 1,
				},
				itemsBeingDragged: [draggedItem.id],
				snapPoint,
			};
		}
		// 같은 카테고리 트랙이 없으면 카테고리에 맞는 위치에 생성
		const insertPosition = getInsertPositionForCategory(itemCategory, tracks);
		return {
			positions: [
				getNewPositionAfterDrag({
					frameOffset,
					item: draggedItem,
					newTrackIndex: insertPosition,
				}),
			],
			trackInsertions: {
				type: 'between',
				trackIndex: insertPosition,
				count: 1,
			},
			itemsBeingDragged: [draggedItem.id],
			snapPoint,
		};
	}

	if (trackOffsetResult.type === 'move') {
		// 이동 대상 트랙이 같은 카테고리인지 확인
		const targetTrackIndex =
			draggedItem.trackIndex + trackOffsetResult.trackOffset;
		const targetTrack = tracks[targetTrackIndex];

		// 대상 트랙이 다른 카테고리이면 이동 불가
		if (targetTrack && targetTrack.category !== itemCategory) {
			return null;
		}

		const {targetTrack: computedTargetTrack, trackInsertions} =
			computeTrackInsertionInfoforSingleItem({
				allTracks: tracks,
				startTrack: draggedItem.trackIndex,
				rawTrackOffset: trackOffsetResult.trackOffset,
			});

		// 새로운 track을 생성하지 않는 경우, 일반적인 충돌 해결 로직 실행
		if (!trackInsertions) {
			const resolved = calculateSingleItemNewPosition({
				durationInFrames: draggedItem.durationInFrames,
				initialFrom: draggedItem.from,
				trackIndex: draggedItem.trackIndex,
				tracks,
				itemId: draggedItem.id,
				items: allItems,
				trackOffsetResult,
				frameOffset,
			});

			if (!resolved) {
				return null;
			}

			// 해결된 트랙이 다른 카테고리이면 이동 불가
			const resolvedTrack = tracks[resolved.track];
			if (resolvedTrack && resolvedTrack.category !== itemCategory) {
				return null;
			}

			return {
				positions: [
					{
						id: draggedItem.id,
						trackIndex: resolved.track,
						from: resolved.from,
						durationInFrames: draggedItem.durationInFrames,
					},
				],
				trackInsertions: null,
				itemsBeingDragged: [draggedItem.id],
				snapPoint,
			};
		}

		// 새로운 track(들)이 삽입될 경우 새 track이 비어있으므로 충돌 검사를 건너뛴 수 있음
		return {
			positions: [
				getNewPositionAfterDrag({
					frameOffset,
					item: draggedItem,
					newTrackIndex: computedTargetTrack,
				}),
			],
			trackInsertions: trackInsertions,
			itemsBeingDragged: [draggedItem.id],
			snapPoint,
		};
	}

	throw new Error(
		`Unexpected trackOffsetResult: ${JSON.stringify(trackOffsetResult satisfies never)}`,
	);
};
