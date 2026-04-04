/**
 * code-to-timeline.ts
 * AI가 생성한 Remotion 코드(Series + Sequence)를 파싱하여
 * 에디터 타임라인 아이템(클립)으로 변환합니다.
 */

import type { UndoableState, TrackType } from '../state/types';
import type { SolidItem } from '../items/solid/solid-item-type';
import type { TextItem } from '../items/text/text-item-type';
import { generateRandomId } from './generate-random-id';
import {
  DEFAULT_COMPOSITION_WIDTH,
  DEFAULT_COMPOSITION_HEIGHT,
  DEFAULT_FPS,
} from '../constants';

/** 파싱된 씬 정보 */
export interface ParsedScene {
  index: number;
  name: string;
  durationInFrames: number;
  startFrame: number;
  code: string; // 해당 씬의 코드 (컴포넌트 함수 본문)
}

/**
 * AI 코드에서 Series.Sequence 패턴을 파싱하여 씬 목록을 추출합니다.
 *
 * 패턴:
 *   <Series.Sequence durationInFrames={90}><Cover /></Series.Sequence>
 *   <Series.Sequence durationInFrames={150}><Problem /></Series.Sequence>
 */
export function parseScenes(code: string): ParsedScene[] {
  const scenes: ParsedScene[] = [];

  // Series.Sequence 패턴 매칭
  const seqRegex = /<Series\.Sequence\s+durationInFrames=\{(\d+)\}[^>]*>\s*<(\w+)\s*\/?\s*>/g;
  let match: RegExpExecArray | null;
  let currentFrame = 0;

  while ((match = seqRegex.exec(code)) !== null) {
    const durationInFrames = parseInt(match[1], 10);
    const componentName = match[2];

    scenes.push({
      index: scenes.length,
      name: componentName,
      durationInFrames,
      startFrame: currentFrame,
      code: extractComponentCode(code, componentName),
    });

    currentFrame += durationInFrames;
  }

  return scenes;
}

/**
 * 컴포넌트 이름으로 해당 함수의 코드를 추출합니다.
 */
function extractComponentCode(fullCode: string, componentName: string): string {
  // const ComponentName = () => { ... };
  const patterns = [
    new RegExp(`const\\s+${componentName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{([\\s\\S]*?)\\n\\};`, 'm'),
    new RegExp(`const\\s+${componentName}\\s*=\\s*\\(\\{[^}]*\\}[^)]*\\)\\s*=>\\s*\\{([\\s\\S]*?)\\n\\};`, 'm'),
    new RegExp(`function\\s+${componentName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}`, 'm'),
  ];

  for (const pattern of patterns) {
    const match = fullCode.match(pattern);
    if (match) return match[0];
  }

  return `// Component: ${componentName}`;
}

/**
 * 파싱된 씬 목록을 에디터 타임라인 상태(UndoableState)로 변환합니다.
 *
 * 각 씬은:
 * - 메인 비주얼 트랙에 SolidItem (배경 역할, 색상 추출)
 * - 텍스트 트랙에 TextItem (씬 이름 라벨)
 */
export function scenesToEditorState(
  scenes: ParsedScene[],
  options?: {
    compositionWidth?: number;
    compositionHeight?: number;
    fps?: number;
  },
): UndoableState {
  const width = options?.compositionWidth ?? DEFAULT_COMPOSITION_WIDTH;
  const height = options?.compositionHeight ?? DEFAULT_COMPOSITION_HEIGHT;
  const fps = options?.fps ?? DEFAULT_FPS;

  const items: Record<string, SolidItem | TextItem> = {};
  const visualTrack: TrackType = {
    id: generateRandomId(),
    items: [],
    hidden: false,
    muted: false,
    category: 'video',
  };
  const labelTrack: TrackType = {
    id: generateRandomId(),
    items: [],
    hidden: false,
    muted: false,
    category: 'video',
  };

  for (const scene of scenes) {
    // 배경색 추출 시도
    const bgColor = extractBackgroundColor(scene.code) ?? '#1a1a2e';

    // 씬 배경 (SolidItem)
    const solidId = generateRandomId();
    const solidItem: SolidItem = {
      id: solidId,
      type: 'solid',
      from: scene.startFrame,
      durationInFrames: scene.durationInFrames,
      top: 0,
      left: 0,
      width,
      height,
      opacity: 1,
      color: bgColor,
      borderRadius: 0,
      rotation: 0,
      keepAspectRatio: false,
      fadeInDurationInSeconds: 0.2,
      fadeOutDurationInSeconds: 0.2,
      isDraggingInTimeline: false,
    };
    items[solidId] = solidItem;
    visualTrack.items.push(solidId);

    // 씬 라벨 (TextItem)
    const textId = generateRandomId();
    const textItem: TextItem = {
      id: textId,
      type: 'text',
      from: scene.startFrame,
      durationInFrames: scene.durationInFrames,
      top: height * 0.4,
      left: width * 0.1,
      width: width * 0.8,
      height: 100,
      opacity: 1,
      text: `Scene ${scene.index + 1}: ${scene.name}`,
      fontSize: 48,
      fontFamily: 'Inter',
      fontWeight: '700',
      lineHeight: 1.2,
      textAlign: 'center',
      color: '#ffffff',
      backgroundColor: 'transparent',
      backgroundOpacity: 0,
      backgroundPadding: 0,
      borderRadius: 0,
      rotation: 0,
      letterSpacing: 0,
      strokeColor: '#000000',
      strokeWidth: 0,
      shadowColor: '#00000080',
      shadowBlur: 4,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      isDraggingInTimeline: false,
      textDirection: 'ltr',
      fadeInDurationInSeconds: 0.3,
      fadeOutDurationInSeconds: 0.3,
      maxLines: undefined,
    } as TextItem;
    items[textId] = textItem;
    labelTrack.items.push(textId);
  }

  const totalDuration = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

  return {
    tracks: [visualTrack, labelTrack],
    items: items as any,
    assets: {},
    fps,
    compositionWidth: width,
    compositionHeight: height,
    deletedAssets: [],
  };
}

/**
 * 코드에서 배경색을 추출합니다.
 */
function extractBackgroundColor(code: string): string | null {
  // backgroundColor: '#xxx' 또는 BG = '#xxx'
  const patterns = [
    /backgroundColor:\s*['"]?(#[0-9a-fA-F]{6,8})['"]?/,
    /BG\s*=\s*['"]?(#[0-9a-fA-F]{6,8})['"]?/,
    /COLOR_BG\s*=\s*['"]?(#[0-9a-fA-F]{6,8})['"]?/,
  ];
  for (const p of patterns) {
    const m = code.match(p);
    if (m) return m[1];
  }
  return null;
}

/**
 * 전체 흐름: AI 코드 → 에디터 상태
 */
export function codeToEditorState(
  code: string,
  options?: {
    compositionWidth?: number;
    compositionHeight?: number;
    fps?: number;
  },
): { state: UndoableState; scenes: ParsedScene[] } {
  const scenes = parseScenes(code);
  const state = scenesToEditorState(scenes, options);
  return { state, scenes };
}
