import {PlayerRef} from '@remotion/player';
import {useContext} from 'react';
import {AbsoluteFill, getRemotionEnvironment} from 'remotion';
import {CenterSnapContext} from '../context-provider';
import {EditModeContext} from '../edit-mode';
import {SortedOutlines} from '../selection-border/sorted-outlines';
import {isTimelineEmpty} from '../utils/is-timeline-empty';
import {useDimensions, useTracks} from '../utils/use-context';
import {CenterGuides} from './center-guides';
import {EmptyCanvasPlaceholder} from './empty-canvas-placeholder';
import {Layers} from './layers';
import {SolidDrawingTool} from './solid-drawing-tool';
import {TextInsertionTool} from './text-insertion-tool';

export type MainCompositionProps = {
	playerRef: React.RefObject<PlayerRef | null> | null;
};

export const MainComposition: React.FC<MainCompositionProps> = ({
	playerRef,
}) => {
	const {editMode} = useContext(EditModeContext);
	const {tracks} = useTracks();
	const {compositionWidth, compositionHeight} = useDimensions();
	const centerSnap = useContext(CenterSnapContext);

	return (
		<AbsoluteFill>
			<Layers tracks={tracks} />
			{getRemotionEnvironment().isPlayer ? <SortedOutlines /> : null}
			{isTimelineEmpty(tracks) ? <EmptyCanvasPlaceholder /> : null}
			{/* 중앙 정렬 가이드라인 */}
			{centerSnap && (
				<CenterGuides
					showHorizontal={centerSnap.showHorizontalGuide}
					showVertical={centerSnap.showVerticalGuide}
					compositionWidth={compositionWidth}
					compositionHeight={compositionHeight}
				/>
			)}
			{editMode === 'draw-solid' && playerRef ? (
				<SolidDrawingTool playerRef={playerRef} />
			) : null}
			{editMode === 'create-text' && playerRef ? (
				<TextInsertionTool playerRef={playerRef} />
			) : null}
		</AbsoluteFill>
	);
};
