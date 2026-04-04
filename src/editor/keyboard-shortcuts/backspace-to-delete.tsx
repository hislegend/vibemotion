import React, {useEffect} from 'react';
import {FEATURE_DELETE_SHORTCUT} from '../flags';
import {deleteItems} from '../state/actions/delete-items';
import {isEventTargetInputElement} from '../utils/is-event-target-input-element';
import {useSelectedItems, useWriteContext} from '../utils/use-context';

export const BackspaceToDelete: React.FC = () => {
	const {selectedItems} = useSelectedItems();
	const {setState} = useWriteContext();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// target이 input이면 trigger하지 않음
			if (isEventTargetInputElement(e)) {
				return;
			}

			if (
				(e.key === 'Backspace' || e.key === 'Delete') &&
				FEATURE_DELETE_SHORTCUT &&
				selectedItems.length > 0
			) {
				setState({
					update: (state) => deleteItems(state, selectedItems),
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
