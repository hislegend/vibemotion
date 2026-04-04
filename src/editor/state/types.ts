import {AssetState, EditorStarterAsset} from '../assets/assets';
import {CaptioningTask} from '../captioning/caption-state';
import {EditorStarterItem} from '../items/item-type';
import {TextItemHoverPreview} from '../items/text/override-text-item-with-hover-preview';
import {ItemBeingTrimmed} from '../items/trim-indicator';
import {RenderingTask} from '../rendering/render-state';
import {SnapPoint} from '../timeline/utils/snap-points';

// state의 구조는 여기에 설명되어 있음:
// https://remotion.dev/docs/editor-starter/state-management

export type TrackCategory = 'video' | 'audio' | 'text';

export type TrackType = {
	items: string[];
	id: string;
	hidden: boolean;
	muted: boolean;
	category: TrackCategory;
};

type DeletedAsset = {
	remoteUrl: string | null;
	remoteFileKey: string | null;
	assetId: string;
	statusAtDeletion: AssetState;
};

// 실행 취소 가능한 state: https://remotion.dev/docs/editor-starter/state-management#undoable-state
export type UndoableState = {
	tracks: TrackType[];
	assets: Record<string, EditorStarterAsset>;
	items: Record<string, EditorStarterItem>;
	fps: number;
	compositionWidth: number;
	compositionHeight: number;
	deletedAssets: DeletedAsset[];
};

export type EditorState = {
	undoableState: UndoableState;
	selectedItems: string[];
	textItemEditing: string | null;
	textItemHoverPreview: TextItemHoverPreview | null;
	renderingTasks: RenderingTask[];
	captioningTasks: CaptioningTask[];
	initialized: boolean;
	itemsBeingTrimmed: ItemBeingTrimmed[];
	loop: boolean;
	timelineHeight: number;
	assetStatus: Record<string, AssetState>;
	isSnappingEnabled: boolean;
	activeSnapPoint: SnapPoint | null;
	isSkimmingEnabled: boolean;
	// 크롭 모드 관련
	itemSelectedForCrop: string | null;
};
