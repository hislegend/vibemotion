import {EditorStarterItem} from './items/item-type';

export const MIN_TIMELINE_ZOOM = 0;
export const MAX_TIMELINE_WIDTH = 40_000; // 더 높은 최대 zoom을 원한다면 이 값을 증가시키세요

export const PLAYHEAD_WIDTH = 19;

// playhead가 보이도록 충분한 공간을 만들고, 왼쪽 가장자리에 붙지 않도록 패딩 추가
export const TIMELINE_HORIZONTAL_PADDING = Math.ceil(PLAYHEAD_WIDTH / 2) + 5;

export const scrollbarStyle: React.CSSProperties = {
	scrollbarWidth: 'thin',
	scrollbarColor:
		'var(--color-editor-starter-scrollbar-thumb) var(--color-editor-starter-scrollbar-track)',
};

export const ITEM_COLORS: Record<EditorStarterItem['type'], string> = {
	image: '#3A7A44',
	gif: '#3A7A44',
	text: '#7A5DE8',
	video: '#347EBF',
	solid: '#B04BCF',
	audio: '#347EBF',
	captions: '#347EBF',
};

export const DEFAULT_COMPOSITION_WIDTH = 1080;
export const DEFAULT_COMPOSITION_HEIGHT = 1920;
export const DEFAULT_FPS = 30;

export const SCROLL_EDGE_THRESHOLD = 200; // auto-scroll을 활성화하는 가장자리로부터의 픽셀 거리
export const MAX_AUTOSCROLL_SPEED = 10;

export const MAX_FADE_DURATION_SECONDS = Infinity;

// Timeline snapping
// snap point 근접성을 평가할 때 사용되는 기본 픽셀 임계값
export const DEFAULT_TIMELINE_SNAPPING_THRESHOLD_PIXELS = 5;
