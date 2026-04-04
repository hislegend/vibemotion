import React, {useEffect} from 'react';
import {setSelectedItems} from '../state/actions/set-selected-items';
import {isEventTargetInputElement} from '../utils/is-event-target-input-element';
import {useAllItems, useWriteContext} from '../utils/use-context';

export const SelectAllShortcut: React.FC = () => {
	const {items} = useAllItems();
	const {setState} = useWriteContext();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// target이 input이면 trigger하지 않음
			if (isEventTargetInputElement(e)) {
				return;
			}

			// Select All: Cmd+A (Mac) 또는 Ctrl+A (Windows/Linux)
			if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
				e.preventDefault();

				// 모든 item ID 가져오기
				const allItemIds = Object.keys(items);

				setState({
					update: (state) => setSelectedItems(state, allItemIds),
					commitToUndoStack: true,
				});
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [items, setState]);

	return null;
};
