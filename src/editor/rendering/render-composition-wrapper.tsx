import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EditorStarterAsset } from '../assets/assets';
import { EditorStarterItem } from '../items/item-type';
import { TrackType } from '../state/types';
import {
  TracksContext,
  AllItemsContext,
  AssetsContext,
  DimensionsContext,
  FpsContext,
} from '../context-provider';
import { Layers } from '../canvas/layers';

export type RenderCompositionWrapperProps = {
  tracks: TrackType[];
  items: Record<string, EditorStarterItem>;
  assets: Record<string, EditorStarterAsset>;
  fps: number;
  compositionWidth: number;
  compositionHeight: number;
};

/**
 * renderMediaOnWeb()용 래퍼 컴포넌트.
 * MainComposition이 의존하는 Context를 props에서 직접 제공.
 * 편집 UI 요소(SortedOutlines, CenterGuides 등)는 제외하고 순수 렌더링만 수행.
 */
export const RenderCompositionWrapper: React.FC<RenderCompositionWrapperProps> = ({
  tracks: tracksProp,
  items: itemsProp,
  assets: assetsProp,
  fps = 30,
  compositionWidth = 1080,
  compositionHeight = 1920,
}) => {
  const tracks = tracksProp ?? [];
  const items = itemsProp ?? {};
  const assets = assetsProp ?? {};
  return (
    <TracksContext.Provider value={{ tracks }}>
      <AllItemsContext.Provider value={{ items }}>
        <AssetsContext.Provider value={{ assets }}>
          <DimensionsContext.Provider value={{ compositionWidth, compositionHeight }}>
            <FpsContext.Provider value={{ fps }}>
              <AbsoluteFill>
                <Layers tracks={tracks} />
              </AbsoluteFill>
            </FpsContext.Provider>
          </DimensionsContext.Provider>
        </AssetsContext.Provider>
      </AllItemsContext.Provider>
    </TracksContext.Provider>
  );
};
