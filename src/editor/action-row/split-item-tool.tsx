import {PlayerRef} from '@remotion/player';
import React, {useCallback, useMemo} from 'react';
import {ScissorsIcon} from '../icons/scissors';
import {splitItem} from '../state/actions/split-item';
import {useAllItems, useSelectedItems, useWriteContext} from '../utils/use-context';
import {useTimelinePosition} from '../utils/use-timeline-position';

export function SplitItemTool({
	playerRef,
}: {
	playerRef: React.RefObject<PlayerRef | null>;
}) {
	const timelineWriteContext = useWriteContext();
	const {items} = useAllItems();
	const {selectedItems} = useSelectedItems();
	const currentFrame = useTimelinePosition({playerRef});

	// 선택 기반 편집 우선 로직:
	// - 아이템이 선택되어 있으면 → 선택된 아이템 중 플레이헤드에 있는 것만 분할
	// - 선택된 아이템이 없으면 → 플레이헤드 위치의 모든 아이템 분할 (기존 동작)
	const splittableItems = useMemo(() => {
		const itemsAtPlayhead = Object.entries(items)
			.filter(([, item]) => {
				const start = item.from;
				const end = item.from + item.durationInFrames;
				return (
					currentFrame > start &&
					currentFrame < end &&
					item.durationInFrames > 1
				);
			})
			.map(([id]) => id);

		// 선택된 아이템이 있으면 선택된 것 중 플레이헤드에 있는 것만 분할
		if (selectedItems.length > 0) {
			return itemsAtPlayhead.filter((id) => selectedItems.includes(id));
		}
		return itemsAtPlayhead;
	}, [items, currentFrame, selectedItems]);

	const canSplit = splittableItems.length > 0;

	const handleSplitClip = useCallback(() => {
		if (!canSplit) return;

		timelineWriteContext.setState({
			update: (state) => {
				let newState = state;
				for (const itemId of splittableItems) {
					newState = splitItem({
						state: newState,
						idToSplit: itemId,
						framePosition: currentFrame,
					});
				}
				return newState;
			},
			commitToUndoStack: true,
		});
	}, [canSplit, timelineWriteContext, splittableItems, currentFrame]);

	return (
		<button
			onClick={handleSplitClip}
			disabled={!canSplit}
			className="editor-starter-focus-ring flex h-10 w-10 cursor-pointer items-center justify-center text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
			title="플레이헤드에서 클립 분할 (E)"
			aria-label="플레이헤드에서 클립 분할"
		>
			<ScissorsIcon className="w-4" />
		</button>
	);
}
