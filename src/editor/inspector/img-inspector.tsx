import React from 'react';
import {
	FEATURE_ALIGNMENT_CONTROL,
	FEATURE_BORDER_RADIUS_CONTROL,
	FEATURE_DIMENSIONS_CONTROL,
	FEATURE_KEN_BURNS_CONTROL,
	FEATURE_OPACITY_CONTROL,
	FEATURE_POSITION_CONTROL,
	FEATURE_ROTATION_CONTROL,
	FEATURE_SOURCE_CONTROL,
	FEATURE_VISUAL_FADE_CONTROL,
} from '../flags';
import {ImageItem} from '../items/image/image-item-type';
import {InspectorLabel} from './components/inspector-label';
import {
	InspectorDivider,
	InspectorSection,
} from './components/inspector-section';
import {AlignmentControls} from './controls/alignment-controls';
import {BorderRadiusControl} from './controls/border-radius-controls';
import {CropControls} from './controls/crop-controls';
import {DimensionsControls} from './controls/dimensions-controls';
import {FadeControls} from './controls/fade-controls';
import {OpacityControls} from './controls/opacity-controls';
import {PositionControl} from './controls/position-control';
import {RotationControl} from './controls/rotation-controls';
import {SourceControls} from './controls/source-info/source-info';
import {KenBurnsControls} from './controls/ken-burns-controls';
import {InspectorTabs} from './inspector-tabs';

const ImgInspectorUnmemoized: React.FC<{
	item: ImageItem;
}> = ({item}) => {
	const propertiesContent = (
		<div>
			{FEATURE_SOURCE_CONTROL && <SourceControls item={item} />}
			<InspectorSection>
				<InspectorLabel>레이아웃</InspectorLabel>
				{FEATURE_ALIGNMENT_CONTROL && <AlignmentControls itemId={item.id} />}
				{FEATURE_POSITION_CONTROL && (
					<PositionControl left={item.left} top={item.top} itemId={item.id} />
				)}
				{FEATURE_DIMENSIONS_CONTROL && (
					<DimensionsControls
						itemId={item.id}
						height={item.height}
						width={item.width}
					/>
				)}
				{FEATURE_ROTATION_CONTROL && (
					<RotationControl rotation={item.rotation} itemId={item.id} />
				)}
			</InspectorSection>
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>채우기</InspectorLabel>
				{FEATURE_OPACITY_CONTROL && (
					<OpacityControls opacity={item.opacity} itemId={item.id} />
				)}
				{FEATURE_BORDER_RADIUS_CONTROL && (
					<BorderRadiusControl
						borderRadius={item.borderRadius}
						itemId={item.id}
					/>
				)}
			</InspectorSection>
			{/* === CROP FEATURE DISABLED - TODO: Re-enable later === */}
			{/* <InspectorDivider />
			<InspectorSection>
				<InspectorLabel>크롭</InspectorLabel>
				<CropControls
					itemId={item.id}
					cropArea={item.cropArea}
				/>
			</InspectorSection> */}
			{/* === END CROP FEATURE === */}
		</div>
	);

	const effectsContent = (
		<div>
			{FEATURE_VISUAL_FADE_CONTROL && (
				<InspectorSection>
					<InspectorLabel>페이드</InspectorLabel>
					<FadeControls
						fadeInDuration={item.fadeInDurationInSeconds}
						fadeOutDuration={item.fadeOutDurationInSeconds}
						itemId={item.id}
						durationInFrames={item.durationInFrames}
					/>
				</InspectorSection>
			)}
		{FEATURE_KEN_BURNS_CONTROL && (
			<>
				<InspectorDivider />
				<InspectorSection>
					<InspectorLabel>Ken Burns 효과</InspectorLabel>
					<KenBurnsControls
						itemId={item.id}
						kenBurnsEffect={item.kenBurnsEffect || 'none'}
						kenBurnsIntensity={item.kenBurnsIntensity ?? 0.15}
					/>
				</InspectorSection>
			</>
		)}
		</div>
	);

	return (
		<InspectorTabs
			propertiesContent={propertiesContent}
			effectsContent={effectsContent}
		/>
	);
};

export const ImgInspector = React.memo(ImgInspectorUnmemoized);