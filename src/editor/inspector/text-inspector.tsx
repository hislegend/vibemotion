import React from 'react';
import {
	FEATURE_ALIGNMENT_CONTROL,
	FEATURE_COLOR_CONTROL,
	FEATURE_DIMENSIONS_CONTROL,
	FEATURE_FONT_FAMILY_CONTROL,
	FEATURE_FONT_STYLE_CONTROL,
	FEATURE_OPACITY_CONTROL,
	FEATURE_POSITION_CONTROL,
	FEATURE_ROTATION_CONTROL,
	FEATURE_TEXT_ALIGNMENT_CONTROL,
	FEATURE_TEXT_DIRECTION_CONTROL,
	FEATURE_TEXT_FONT_SIZE_CONTROL,
	FEATURE_TEXT_LETTER_SPACING_CONTROL,
	FEATURE_TEXT_LINE_HEIGHT_CONTROL,
	FEATURE_TEXT_STROKE_COLOR_CONTROL,
	FEATURE_TEXT_STROKE_WIDTH_CONTROL,
	FEATURE_TEXT_VALUE_CONTROL,
	FEATURE_VISUAL_FADE_CONTROL,
} from '../flags';
import {TextItem} from '../items/text/text-item-type';
import {InspectorLabel} from './components/inspector-label';
import {
	InspectorDivider,
	InspectorSection,
} from './components/inspector-section';
import {AlignmentControls} from './controls/alignment-controls';
import {AnimationControls} from './controls/animation-controls';
import {QuickColorPicker} from './controls/color-picker/quick-color-picker';
import {DimensionsControls} from './controls/dimensions-controls';
import {FadeControls} from './controls/fade-controls';
import {FontFamilyControl} from './controls/font-family-controls/font-family-controls';
import {FontSizeControls} from './controls/font-size-controls';
import {FontStyleControls} from './controls/font-style-controls/font-style-controls';
import {LetterSpacingControls} from './controls/letter-spacing-controls';
import {LineHeightControls} from './controls/line-height-controls';
import {OpacityControls} from './controls/opacity-controls';
import {PositionControl} from './controls/position-control';
import {RotationControl} from './controls/rotation-controls';
import {ShadowControls} from './controls/shadow-controls';
import {StrokeWidthControls} from './controls/stroke-width-controls';
import {TextAlignmentControls} from './controls/text-alignment-controls';
import {TextBackgroundControls} from './controls/text-background-controls';
import {TextDirectionControls} from './controls/text-direction-controls';
import {TextFormatControls} from './controls/text-format-controls';
import {TextValueControls} from './controls/text-value-controls/text-value-controls';
import {InspectorTabs} from './inspector-tabs';
import {changeItem} from '../state/actions/change-item';
import {useWriteContext} from '../utils/use-context';
import {useCallback} from 'react';

const TextInspectorUnmemoized: React.FC<{
	item: TextItem;
}> = ({item}) => {
	const {setState} = useWriteContext();

	const updateColor = useCallback(
		(colorType: 'color' | 'strokeColor', color: string) => {
			setState({
				update: (state) => {
					return changeItem(state, item.id, (i) => {
						if (i.type !== 'text') return i;
						return {
							...i,
							[colorType]: color,
						};
					});
				},
				commitToUndoStack: true,
			});
		},
		[item.id, setState],
	);

	const propertiesContent = (
		<div>
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
				<InspectorLabel>타이포그래피</InspectorLabel>
				{FEATURE_FONT_FAMILY_CONTROL && (
					<FontFamilyControl fontFamily={item.fontFamily} itemId={item.id} />
				)}
				{FEATURE_FONT_STYLE_CONTROL && (
					<FontStyleControls
						fontFamily={item.fontFamily}
						fontStyle={item.fontStyle}
						itemId={item.id}
					/>
				)}
				{FEATURE_TEXT_FONT_SIZE_CONTROL && (
					<FontSizeControls
						fontSize={item.fontSize}
						itemId={item.id}
						itemType="text"
					/>
				)}
				{/* B/I/U 서식 버튼 */}
				<TextFormatControls
					isBold={item.isBold ?? false}
					isItalic={item.isItalic ?? false}
					isUnderline={item.isUnderline ?? false}
					itemId={item.id}
				/>
				<div className="flex flex-row gap-2">
					{FEATURE_TEXT_LINE_HEIGHT_CONTROL && (
						<LineHeightControls lineHeight={item.lineHeight} itemId={item.id} />
					)}
					{FEATURE_TEXT_LETTER_SPACING_CONTROL && (
						<LetterSpacingControls
							letterSpacing={item.letterSpacing}
							itemId={item.id}
						/>
					)}
				</div>
				{FEATURE_TEXT_VALUE_CONTROL && (
					<TextValueControls
						text={item.text}
						itemId={item.id}
						direction={item.direction}
						align={item.align}
					/>
				)}
				<div className="flex flex-row gap-2">
					{FEATURE_TEXT_ALIGNMENT_CONTROL && (
						<TextAlignmentControls align={item.align} itemId={item.id} />
					)}
					{FEATURE_TEXT_DIRECTION_CONTROL && (
						<TextDirectionControls
							direction={item.direction}
							itemId={item.id}
						/>
					)}
				</div>
			</InspectorSection>
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>색상</InspectorLabel>
				{FEATURE_OPACITY_CONTROL && (
					<OpacityControls opacity={item.opacity} itemId={item.id} />
				)}
				{FEATURE_COLOR_CONTROL && (
					<QuickColorPicker
						color={item.color}
						onChange={(c) => updateColor('color', c)}
						label="채우기"
					/>
				)}
			</InspectorSection>
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>배경 박스</InspectorLabel>
				<TextBackgroundControls
					backgroundColor={item.backgroundColor ?? 'transparent'}
					backgroundPadding={item.backgroundPadding ?? 8}
					itemId={item.id}
				/>
			</InspectorSection>
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>테두리</InspectorLabel>
				{FEATURE_TEXT_STROKE_WIDTH_CONTROL && (
					<StrokeWidthControls
						strokeWidth={item.strokeWidth}
						itemId={item.id}
					/>
				)}
				{FEATURE_TEXT_STROKE_COLOR_CONTROL && (
					<QuickColorPicker
						color={item.strokeColor}
						onChange={(c) => updateColor('strokeColor', c)}
						label="테두리 색상"
					/>
				)}
			</InspectorSection>
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>그림자</InspectorLabel>
				<ShadowControls
					shadowEnabled={item.shadowEnabled ?? false}
					shadowColor={item.shadowColor ?? '#000000'}
					shadowBlur={item.shadowBlur ?? 4}
					shadowOffsetX={item.shadowOffsetX ?? 2}
					shadowOffsetY={item.shadowOffsetY ?? 2}
					itemId={item.id}
				/>
			</InspectorSection>
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
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>애니메이션</InspectorLabel>
				<AnimationControls
					animationType={item.animationType ?? 'none'}
					animationIntensity={item.animationIntensity ?? 0.5}
					itemId={item.id}
				/>
			</InspectorSection>
		</div>
	);

	return (
		<InspectorTabs
			propertiesContent={propertiesContent}
			effectsContent={effectsContent}
		/>
	);
};

export const TextInspector = React.memo(TextInspectorUnmemoized);
