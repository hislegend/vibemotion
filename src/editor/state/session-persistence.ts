import {UndoableState} from './types';

const SESSION_KEY_PREFIX = 'remotion-editor-session-';

const getSessionKey = (projectId?: string) => {
	return projectId ? `${SESSION_KEY_PREFIX}${projectId}` : `${SESSION_KEY_PREFIX}default`;
};

export const saveState = (state: UndoableState, projectId?: string): void => {
	if (typeof localStorage === 'undefined') return;
	
	const key = getSessionKey(projectId);
	const data = {
		state,
		timestamp: Date.now(),
	};
	
	localStorage.setItem(key, JSON.stringify(data));
};

export const loadState = (projectId?: string): UndoableState | null => {
	if (typeof localStorage === 'undefined') return null;
	
	const key = getSessionKey(projectId);
	const stored = localStorage.getItem(key);
	
	if (!stored) return null;
	
	try {
		const data = JSON.parse(stored);
		return data.state;
	} catch {
		return null;
	}
};

export const hasUnsavedSession = (projectId?: string): boolean => {
	if (typeof localStorage === 'undefined') return false;
	
	const key = getSessionKey(projectId);
	const stored = localStorage.getItem(key);
	
	if (!stored) return false;
	
	try {
		const data = JSON.parse(stored);
		// 24시간 이내의 세션만 유효
		const isRecent = Date.now() - data.timestamp < 24 * 60 * 60 * 1000;
		return isRecent && data.state !== null;
	} catch {
		return false;
	}
};

export const clearSession = (projectId?: string): void => {
	if (typeof localStorage === 'undefined') return;
	
	const key = getSessionKey(projectId);
	localStorage.removeItem(key);
};
