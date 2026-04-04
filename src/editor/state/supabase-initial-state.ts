import type { UndoableState } from './types';

const STORAGE_KEY = 'vibemotion-editor-state';

export function loadAndClearSupabaseInitialState(): UndoableState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      localStorage.removeItem(STORAGE_KEY);
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

export function saveEditorStateSnapshot(state: UndoableState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function getProjectIdForEditor(): string | null {
  try {
    return localStorage.getItem('vibemotion-editor-project-id');
  } catch { return null; }
}
