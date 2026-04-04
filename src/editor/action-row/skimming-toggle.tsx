import {useCallback} from 'react';
import {Eye, EyeOff} from 'lucide-react';
import {toggleSkimming} from '../state/actions/toggle-skimming';
import {saveSkimmingEnabled} from '../state/skimming-persistance';
import {useFullState, useWriteContext} from '../utils/use-context';

export function SkimmingToggle() {
	const writeContext = useWriteContext();
	const {isSkimmingEnabled} = useFullState();

	const handleToggle = useCallback(() => {
		writeContext.setState({
			update: (state) => {
				const newState = toggleSkimming(state);
				saveSkimmingEnabled(newState.isSkimmingEnabled);
				return newState;
			},
			commitToUndoStack: false,
		});
	}, [writeContext]);

	return (
		<button
			onClick={handleToggle}
			className={`editor-starter-focus-ring flex items-center justify-center p-2 ${
				isSkimmingEnabled ? 'text-yellow-400' : 'text-neutral-300'
			}`}
			title={isSkimmingEnabled ? '스키밍 끄기' : '스키밍 켜기'}
			aria-label={isSkimmingEnabled ? '스키밍 끄기' : '스키밍 켜기'}
			aria-pressed={isSkimmingEnabled}
		>
			{isSkimmingEnabled ? (
				<Eye className="w-[14px] h-[14px]" />
			) : (
				<EyeOff className="w-[14px] h-[14px]" />
			)}
		</button>
	);
}
