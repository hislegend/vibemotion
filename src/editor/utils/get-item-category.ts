import {EditorStarterItem} from '../items/item-type';
import {TrackCategory} from '../state/types';

/**
 * 아이템 타입에 따라 해당 트랙 카테고리를 반환합니다.
 * - text, captions → 'text' (자막)
 * - audio → 'audio' (오디오)
 * - video, image, gif, solid → 'video' (영상)
 */
export const getItemCategory = (item: EditorStarterItem): TrackCategory => {
	switch (item.type) {
		case 'text':
		case 'captions':
			return 'text';
		case 'audio':
			return 'audio';
		case 'video':
		case 'image':
		case 'gif':
		case 'solid':
		default:
			return 'video';
	}
};
