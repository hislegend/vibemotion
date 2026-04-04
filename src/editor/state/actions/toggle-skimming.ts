import {EditorState} from '../types';

export const toggleSkimming = (state: EditorState): EditorState => ({
	...state,
	isSkimmingEnabled: !state.isSkimmingEnabled,
});
