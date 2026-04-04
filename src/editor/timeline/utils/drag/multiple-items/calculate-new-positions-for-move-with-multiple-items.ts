import {EditorStarterItem} from '../../../../items/item-type';
import {TrackType} from '../../../../state/types';
import {
	DragPreviewState,
	PreviewPosition,
} from '../../../drag-preview-provider';
import {SnapPoint} from '../../snap-points';
import {getNewPositionAfterDrag} from '../calculate-new-item';
import {getAlternativeForGroupCollision} from '../collision';
import {MoveTrackOffsetResult} from '../get-track-offset';
import {getTrackInsertionsFromTentativePositions} from './get-track-insertions-from-tentative-positions';
import {hasNoOverlaps} from './has-no-overlaps';

export const calculateNewPositionsForMoveWithMultipleItems = ({
	draggedItems,
	draggedItemIds,
	tracks,
	allItems,
	frameOffset,
	trackOffsetResult,
	snapPoint,
}: {
	draggedItems: Array<PreviewPosition>;
	draggedItemIds: string[];
	tracks: TrackType[];
	allItems: Record<string, EditorStarterItem>;
	frameOffset: number;
	trackOffsetResult: MoveTrackOffsetResult;
	snapPoint: SnapPoint | null;
}): DragPreviewState | null => {
	// 그룹 전체에 대한 왼쪽 경계 조정
	// 그룹에서 가장 왼쪽에 있는 아이템이 0 아래로 가지 않도록 frameOffset 조정
	const groupLeftmostFrom = Math.min(...draggedItems.map((item) => item.from));
	const tentativeLeftmost = groupLeftmostFrom + frameOffset;

	// 그룹의 왼쪽 끝이 0 아래로 가려면, 0에 딱 붙게 조정
	const adjustedFrameOffset =
		tentativeLeftmost < 0 ? frameOffset - tentativeLeftmost : frameOffset;

	let tentativePositions = draggedItems.map((item) => {
		const newTrack = trackOffsetResult.trackOffset + item.trackIndex;

		return getNewPositionAfterDrag({
			frameOffset: adjustedFrameOffset,
			item,
			newTrackIndex: newTrack,
		});
	});

	const isValid = hasNoOverlaps({
		tentativePositions,
		draggedItemIds,
		tracks,
		allItems,
	});

	// 겹침이 있으면 그룹에 대한 대체 위치를 찾아보기
	if (!isValid) {
		// 그룹이 충돌 없이 들어갈 수 있는 frame 위치 찾기

		// 드래그된 그룹이 기존 timeline item들과 충돌할 때
		// 근처의 유효한 위치에 "자석처럼 달라붙는" 효과를 만드는
		// 기능입니다
		const alternativeFrame = getAlternativeForGroupCollision({
			tentativePositions,
			draggedItemIds,
			tracks,
			allItems,
		});

		if (!alternativeFrame) {
			return null;
		}

		// 충돌을 피하기 위해 그룹을 얼마나 이동시킬지 계산
		const groupLeftmostFrame = Math.min(
			...tentativePositions.map((p) => p.from),
		);
		const offsetDelta = alternativeFrame - groupLeftmostFrame;
		const adjustedFrameOffset = frameOffset + offsetDelta;

		// 충돌 회피 offset을 사용하여 전체 그룹 재배치
		const alternativeTentativePositions = draggedItems.map((item) => {
			const newTrack = trackOffsetResult.trackOffset + item.trackIndex;

			return getNewPositionAfterDrag({
				frameOffset: adjustedFrameOffset,
				item,
				newTrackIndex: newTrack,
			});
		});

		// 조정된 위치에 여전히 겹침이 없는지 확인
		const isValidAfterAlternativeCalculation = hasNoOverlaps({
			tentativePositions: alternativeTentativePositions,
			draggedItemIds,
			tracks,
			allItems,
		});

		// 대체 계산 후에도 겹침이 여전히 존재하면 이동 불가능
		if (!isValidAfterAlternativeCalculation) {
			return null;
		}

		tentativePositions = alternativeTentativePositions;
	}

	const trackInsertions = getTrackInsertionsFromTentativePositions({
		tentativePositions,
		tracks,
	});

	return {
		positions: tentativePositions.map((t) => {
			// array 시작 부분에 track들을 추가하면
			// index들이 이동한다는 사실을 고려
			if (trackInsertions && trackInsertions.type === 'top') {
				return {
					...t,
					trackIndex: t.trackIndex + trackInsertions.count,
				};
			}
			return t;
		}),
		trackInsertions,
		itemsBeingDragged: draggedItemIds,
		snapPoint,
	};
};
