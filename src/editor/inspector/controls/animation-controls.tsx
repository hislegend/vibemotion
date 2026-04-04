import React, {memo, useCallback} from 'react';
import {TextItem, TextAnimationType} from '../../items/text/text-item-type';
import {changeItem} from '../../state/actions/change-item';
import {useWriteContext} from '../../utils/use-context';
import {InspectorSubLabel} from '../components/inspector-label';
import {ANIMATION_TYPES, ANIMATION_TYPE_LABELS} from '../../items/text/text-animation';

interface AnimationControlsProps {
	animationType: TextAnimationType;
	animationIntensity: number;
	itemId: string;
}

const AnimationControlsUnmemoized: React.FC<AnimationControlsProps> = ({
	animationType,
	animationIntensity,
	itemId,
}) => {
	const {setState} = useWriteContext();

	const updateAnimationProperty = useCallback(
		<K extends keyof TextItem>(key: K, value: TextItem[K]) => {
			setState({
				update: (state) => {
					return changeItem(state, itemId, (item) => {
						if (item.type !== 'text') return item;
						return {
							...item,
							[key]: value,
						};
					});
				},
				commitToUndoStack: true,
			});
		},
		[itemId, setState],
	);

	return (
		<div className="space-y-3">
			<div>
				<InspectorSubLabel>애니메이션 효과</InspectorSubLabel>
				<select
					value={animationType}
					onChange={(e) =>
						updateAnimationProperty('animationType', e.target.value as TextAnimationType)
					}
					className="w-full h-8 px-2 text-sm bg-white/5 border border-white/10 rounded text-white"
				>
					{ANIMATION_TYPES.map((type) => (
						<option key={type} value={type} className="bg-neutral-800">
							{ANIMATION_TYPE_LABELS[type]}
						</option>
					))}
				</select>
			</div>

			{animationType !== 'none' && (
				<div>
					<InspectorSubLabel>강도</InspectorSubLabel>
					<div className="flex items-center gap-2">
						<input
							type="range"
							min={0.1}
							max={1}
							step={0.1}
							value={animationIntensity}
							onChange={(e) =>
								updateAnimationProperty('animationIntensity', Number(e.target.value))
							}
							className="flex-1"
						/>
						<span className="w-10 text-right text-xs text-neutral-400">
							{Math.round(animationIntensity * 100)}%
						</span>
					</div>
				</div>
			)}
		</div>
	);
};

export const AnimationControls = memo(AnimationControlsUnmemoized);
