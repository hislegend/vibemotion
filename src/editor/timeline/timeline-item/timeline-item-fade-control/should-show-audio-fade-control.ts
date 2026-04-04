import {
	FEATURE_AUDIO_FADE_CONTROL,
	FEATURE_AUDIO_WAVEFORM_FOR_VIDEO_ITEM,
} from '../../../flags';
import {EditorStarterItem} from '../../../items/item-type';

export const shouldShowAudioFadeControl = ({
	item,
}: {
	item: EditorStarterItem;
}) => {
	if (!FEATURE_AUDIO_FADE_CONTROL) {
		return false;
	}

	if (item.type === 'audio') {
		return true;
	}

	if (item.type === 'video') {
		return FEATURE_AUDIO_WAVEFORM_FOR_VIDEO_ITEM;
	}

	// Type safety 검사, audio fade control이 없는 item type들을 여기에 추가
	if (
		item.type === 'captions' ||
		item.type === 'gif' ||
		item.type === 'text' ||
		item.type === 'solid' ||
		item.type === 'image'
	) {
		return false;
	}

	throw new Error('Invalid item type: ' + (item satisfies never));
};
