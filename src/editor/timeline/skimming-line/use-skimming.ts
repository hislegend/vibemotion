import {PlayerRef} from '@remotion/player';
import {useCallback, useRef, useState} from 'react';
import {TIMELINE_HORIZONTAL_PADDING} from '../../constants';
import {splitItem} from '../../state/actions/split-item';
import {EditorStarterItem} from '../../items/item-type';
import {SetState} from '../../context-provider';
import {SIDE_PANEL_WIDTH} from '../timeline-side-panel/timeline-side-panel';

interface UseSkimmingProps {
	playerRef: React.RefObject<PlayerRef | null>;
	timelineWidth: number | null;
	visibleFrames: number;
	isEnabled: boolean;
	items: Record<string, EditorStarterItem>;
	setState: SetState;
}

export const useSkimming = ({
	playerRef,
	timelineWidth,
	visibleFrames,
	isEnabled,
	items,
	setState,
}: UseSkimmingProps) => {
	const [skimmingFrame, setSkimmingFrame] = useState<number | null>(null);
	const [isInTimelineArea, setIsInTimelineArea] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const getFrameFromMouseX = useCallback(
		(clientX: number): number | null => {
			if (!containerRef.current || !timelineWidth) return null;

			const rect = containerRef.current.getBoundingClientRect();
			const scrollLeft = containerRef.current.scrollLeft;
			const x = clientX - rect.left + scrollLeft - TIMELINE_HORIZONTAL_PADDING - SIDE_PANEL_WIDTH;

			if (x < 0) return 0;

			const frame = Math.round((x / timelineWidth) * visibleFrames);
			return Math.max(0, Math.min(frame, visibleFrames - 1));
		},
		[timelineWidth, visibleFrames],
	);

	const onMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isEnabled || !playerRef.current) return;

			// 재생 중이면 스키밍 무시
			if (playerRef.current.isPlaying()) {
				setSkimmingFrame(null);
				return;
			}

			const frame = getFrameFromMouseX(e.clientX);
			if (frame === null) return;

			setSkimmingFrame(frame);
			playerRef.current.seekTo(frame);
		},
		[isEnabled, getFrameFromMouseX, playerRef],
	);

	const onMouseEnter = useCallback(() => {
		if (!isEnabled || !playerRef.current) return;

		// 재생 중이면 스키밍 활성화 안 함
		if (playerRef.current.isPlaying()) {
			return;
		}

		setIsInTimelineArea(true);
	}, [isEnabled, playerRef]);

	const onMouseLeave = useCallback(() => {
		if (!isEnabled) return;

		setSkimmingFrame(null);
		setIsInTimelineArea(false);
	}, [isEnabled]);

	// 스키밍 위치에서 컷 편집
	const onSkimmingClick = useCallback(
		(e: React.MouseEvent) => {
			if (!isEnabled || skimmingFrame === null) return;

			// 클릭된 요소가 아이템인지 확인 (아이템 위에서 클릭한 경우만 컷 편집)
			const target = e.target as HTMLElement;
			if (!target.closest('[data-timeline-item]')) return;

			// 해당 프레임에 있는 분할 가능한 아이템 찾기
			const splittableItems = Object.entries(items)
				.filter(([, item]) => {
					const start = item.from;
					const end = item.from + item.durationInFrames;
					return (
						skimmingFrame > start &&
						skimmingFrame < end &&
						item.durationInFrames > 1
					);
				})
				.map(([id]) => id);

			if (splittableItems.length === 0) return;

			// 컷 편집 실행
			setState({
				update: (state) => {
					let newState = state;
					for (const itemId of splittableItems) {
						newState = splitItem({
							state: newState,
							idToSplit: itemId,
							framePosition: skimmingFrame,
						});
					}
					return newState;
				},
				commitToUndoStack: true,
			});
		},
		[isEnabled, skimmingFrame, items, setState],
	);

	return {
		skimmingFrame,
		isInTimelineArea,
		onMouseMove,
		onMouseEnter,
		onMouseLeave,
		onSkimmingClick,
		containerRef,
	};
};
