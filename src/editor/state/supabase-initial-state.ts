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

export function getScriptForEditor(): string | null {
  try { return localStorage.getItem('vibemotion-editor-script'); } catch { return null; }
}

export function saveScriptForEditor(script: string): void {
  try { localStorage.setItem('vibemotion-editor-script', script); } catch {}
}

export function getProjectDataForEditor(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem('vibemotion-editor-project-data');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getSourceVideoIdsForEditor(): string[] { return []; }
