import {BaseItem, CanHaveBorderRadius, CanHaveCrop, CanHaveRotation} from '../shared';

export type GifItem = BaseItem &
	CanHaveBorderRadius &
	CanHaveRotation &
	CanHaveCrop & {
		type: 'gif';
		gifStartFromInSeconds: number;
		playbackRate: number;
		assetId: string;
		keepAspectRatio: boolean;
		fadeInDurationInSeconds: number;
		fadeOutDurationInSeconds: number;
	};
