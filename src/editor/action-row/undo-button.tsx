import {useCallback} from 'react';
import {UndoIcon} from '../icons/undo';
import {clsx} from '../utils/clsx';
import {useCanUseUndoStack, useWriteContext} from '../utils/use-context';

export const UndoButton = () => {
	const {undo} = useWriteContext();
	const {canUndo} = useCanUseUndoStack();

	const handleUndo = useCallback(() => {
		undo();
	}, [undo]);

	return (
		<div className="bg-white/5">
			<button
				className={clsx(
					'editor-starter-focus-ring flex h-10 w-10 items-center justify-center rounded text-white transition-colors',
					!canUndo && 'opacity-50',
					canUndo && 'hover:bg-white/10',
				)}
				title="실행 취소 (Ctrl+Z / Cmd+Z)"
				onClick={handleUndo}
				disabled={!canUndo}
				aria-label="실행 취소"
			>
				<UndoIcon />
			</button>
		</div>
	);
};
