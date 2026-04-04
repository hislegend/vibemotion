import React, {useEffect} from 'react';
import {toggleSnapping} from '../state/actions/toggle-snapping';
import {saveSnappingEnabled} from '../state/snapping-persistance';
import {isEventTargetInputElement} from '../utils/is-event-target-input-element';
import {useWriteContext} from '../utils/use-context';

export const SnappingShortcut: React.FC = () => {
	const {setState} = useWriteContext();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// input에서의 타이핑 및 시스템 단축키 캐처 방지
			if (isEventTargetInputElement(e)) {
				return;
			}

			// Shift+M으로 snapping toggle
			if (e.shiftKey && e.code === 'KeyM') {
				e.preventDefault();
				setState({
					update: (state) => {
						const newState = toggleSnapping(state);
						saveSnappingEnabled(newState.isSnappingEnabled);
						return newState;
					},
					commitToUndoStack: false,
				});
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [setState]);

	return null;
};
