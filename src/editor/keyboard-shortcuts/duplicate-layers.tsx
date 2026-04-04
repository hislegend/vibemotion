import React, {useEffect} from 'react';
import {duplicateItems} from '../state/actions/duplicate-items';
import {isEventTargetInputElement} from '../utils/is-event-target-input-element';
import {useSelectedItems, useWriteContext} from '../utils/use-context';

export const DuplicateLayers: React.FC = () => {
	const {selectedItems} = useSelectedItems();
	const {setState} = useWriteContext();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// target이 input이면 trigger하지 않음
			if (isEventTargetInputElement(e)) {
				return;
			}

			const commandKey = window.navigator.platform.startsWith('Mac')
				? e.metaKey
				: e.ctrlKey;

			if (e.key === 'd' && commandKey && selectedItems.length > 0) {
				e.preventDefault();
				setState({
					update: (state) => duplicateItems(state, selectedItems),
					commitToUndoStack: true,
				});
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [selectedItems, setState]);

	return null;
};
