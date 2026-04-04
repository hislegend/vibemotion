import {PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect, useRef} from 'react';
import {
	FEATURE_CUT_SHORTCUT,
	FEATURE_TRIM_END_SHORTCUT,
	FEATURE_TRIM_START_SHORTCUT,
} from '../flags';
import {splitItem} from '../state/actions/split-item';
import {trimEnd} from '../state/actions/trim-end';
import {trimStart} from '../state/actions/trim-start';
import {isEventTargetInputElement} from '../utils/is-event-target-input-element';
import {useAllItems, useSelectedItems, useWriteContext} from '../utils/use-context';
import {useTimelinePosition} from '../utils/use-timeline-position';

export const CutEditShortcuts: React.FC<{
	playerRef: React.RefObject<PlayerRef | null>;
}> = ({playerRef}) => {
	const {setState} = useWriteContext();
	const {items} = useAllItems();
	const {selectedItems} = useSelectedItems();
	const currentFrame = useTimelinePosition({playerRef});

	// Ref를 사용하여 최신 값 유지 (클로저 문제 해결)
	const itemsRef = useRef(items);
	const currentFrameRef = useRef(currentFrame);
	const selectedItemsRef = useRef(selectedItems);

	useEffect(() => {
		itemsRef.current = items;
	}, [items]);

	useEffect(() => {
		currentFrameRef.current = currentFrame;
	}, [currentFrame]);

	useEffect(() => {
		selectedItemsRef.current = selectedItems;
	}, [selectedItems]);

	// 선택 기반 편집 우선 로직:
	// - 아이템이 선택되어 있으면 → 선택된 아이템 중 플레이헤드에 있는 것만
	// - 선택된 아이템이 없으면 → 플레이헤드 위치의 모든 아이템 (기존 동작)
	const getItemsAtPlayhead = useCallback(() => {
		const itemsAtPlayhead = Object.entries(itemsRef.current)
			.filter(([, item]) => {
				const start = item.from;
				const end = item.from + item.durationInFrames;
				return currentFrameRef.current > start && currentFrameRef.current < end;
			})
			.map(([id]) => id);

		// 선택된 아이템이 있으면 선택된 것 중 플레이헤드에 있는 것만
		if (selectedItemsRef.current.length > 0) {
			return itemsAtPlayhead.filter((id) =>
				selectedItemsRef.current.includes(id),
			);
		}
		return itemsAtPlayhead;
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isEventTargetInputElement(e)) {
				return;
			}

			// modifier 키가 눌려있으면 무시 (Ctrl+W 브라우저 탭 닫기 등 충돌 방지)
			if (e.ctrlKey || e.metaKey || e.altKey) {
				return;
			}

			const code = e.code;

			// E 키: Split (컷)
			if (code === 'KeyE' && FEATURE_CUT_SHORTCUT) {
				const itemsAtPlayhead = getItemsAtPlayhead();
				if (itemsAtPlayhead.length === 0) return;

				const frame = currentFrameRef.current;
				e.preventDefault();
				setState({
					update: (state) => {
						let newState = state;
						for (const itemId of itemsAtPlayhead) {
							newState = splitItem({
								state: newState,
								idToSplit: itemId,
								framePosition: frame,
							});
						}
						return newState;
					},
					commitToUndoStack: true,
				});
			}

			// Q 키: Trim Start (앞 날리기) + 리플 편집
			if (code === 'KeyQ' && FEATURE_TRIM_START_SHORTCUT) {
				const itemsAtPlayhead = getItemsAtPlayhead();
				if (itemsAtPlayhead.length === 0) return;

				const frame = currentFrameRef.current;
				e.preventDefault();
				setState({
					update: (state) => {
						let newState = state;
						for (const itemId of itemsAtPlayhead) {
							newState = trimStart({
								state: newState,
								itemId,
								framePosition: frame,
							});
						}
						return newState;
					},
					commitToUndoStack: true,
				});
			}

			// W 키: Trim End (뒤 날리기) + 리플 편집
			if (code === 'KeyW' && FEATURE_TRIM_END_SHORTCUT) {
				const itemsAtPlayhead = getItemsAtPlayhead();
				if (itemsAtPlayhead.length === 0) return;

				const frame = currentFrameRef.current;
				e.preventDefault();
				setState({
					update: (state) => {
						let newState = state;
						for (const itemId of itemsAtPlayhead) {
							newState = trimEnd({
								state: newState,
								itemId,
								framePosition: frame,
							});
						}
						return newState;
					},
					commitToUndoStack: true,
				});
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [setState, getItemsAtPlayhead]);

	return null;
};
