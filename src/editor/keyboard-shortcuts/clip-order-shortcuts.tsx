import {useCallback, useEffect, useRef} from 'react';
import {bringToFrontOrBack} from '../state/actions/bring-item-to-front-or-back';
import {isEventTargetInputElement} from '../utils/is-event-target-input-element';
import {useSelectedItems, useWriteContext} from '../utils/use-context';

export const ClipOrderShortcuts: React.FC = () => {
	const {setState} = useWriteContext();
	const {selectedItems} = useSelectedItems();
	
	const selectedItemsRef = useRef(selectedItems);
	selectedItemsRef.current = selectedItems;

	const moveClip = useCallback((direction: 'front' | 'back') => {
		if (selectedItemsRef.current.length === 0) return;

		setState({
			update: (state) => {
				let newState = state;
				for (const itemId of selectedItemsRef.current) {
					newState = bringToFrontOrBack({
						state: newState,
						itemId,
						position: direction,
					});
				}
				return newState;
			},
			commitToUndoStack: true,
		});
	}, [setState]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isEventTargetInputElement(e)) return;
			if (!e.altKey) return;

			// Alt + ArrowUp: 클립을 앞으로 (front)
			if (e.code === 'ArrowUp') {
				e.preventDefault();
				moveClip('front');
			}

			// Alt + ArrowDown: 클립을 뒤로 (back)
			if (e.code === 'ArrowDown') {
				e.preventDefault();
				moveClip('back');
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [moveClip]);

	return null;
};
