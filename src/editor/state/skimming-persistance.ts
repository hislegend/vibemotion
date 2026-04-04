const SKIMMING_KEY = 'editor-skimming-enabled';

export const DEFAULT_SKIMMING_ENABLED = false;

export const loadSkimmingEnabled = (): boolean => {
	const stored = localStorage.getItem(SKIMMING_KEY);
	return stored === null ? DEFAULT_SKIMMING_ENABLED : stored === 'true';
};

export const saveSkimmingEnabled = (enabled: boolean): void => {
	localStorage.setItem(SKIMMING_KEY, String(enabled));
};
