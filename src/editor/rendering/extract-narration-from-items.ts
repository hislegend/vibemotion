import { EditorStarterItem } from '../items/item-type';
import { EditorStarterAsset, CaptionAsset } from '../assets/assets';

/**
 * Extract narration text from editor items (text and captions)
 * Returns a formatted string that gallery's extractNarrationFromPrompt can recognize
 */
export function extractNarrationFromItems(
  items: Record<string, EditorStarterItem>,
  assets: Record<string, EditorStarterAsset>
): string | null {
  const narrations: string[] = [];

  // 1. Collect text from text items
  Object.values(items).forEach((item) => {
    if (item.type === 'text' && item.text?.trim()) {
      narrations.push(item.text.trim());
    }
  });

  // 2. Collect text from caption items
  Object.values(items).forEach((item) => {
    if (item.type === 'captions') {
      const asset = assets[item.assetId] as CaptionAsset | undefined;
      if (asset?.captions) {
        const captionText = asset.captions
          .map((c) => c.text)
          .join(' ')
          .trim();
        if (captionText) {
          narrations.push(captionText);
        }
      }
    }
  });

  if (narrations.length === 0) {
    return null;
  }

  // Format that gallery's extractNarrationFromPrompt can recognize
  return `Korean narration: "${narrations.join(' ')}"`;
}
