import type { UndoableState } from '../state/types';
export async function ensureAssetsUploaded(_state: UndoableState): Promise<void> {
  // No-op in standalone mode
}
