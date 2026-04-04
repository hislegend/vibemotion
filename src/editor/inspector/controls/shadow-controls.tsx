import React, {memo, useCallback} from 'react';
import {TextItem} from '../../items/text/text-item-type';
import {changeItem} from '../../state/actions/change-item';
import {useWriteContext} from '../../utils/use-context';
import {InspectorSubLabel} from '../components/inspector-label';
import {QuickColorPicker} from './color-picker/quick-color-picker';

interface ShadowControlsProps {
	shadowEnabled: boolean;
	shadowColor: string;
	shadowBlur: number;
	shadowOffsetX: number;
	shadowOffsetY: number;
	itemId: string;
}

const ShadowControlsUnmemoized: React.FC<ShadowControlsProps> = ({
	shadowEnabled,
	shadowColor,
	shadowBlur,
	shadowOffsetX,
	shadowOffsetY,
	itemId,
}) => {
	const {setState} = useWriteContext();

	const updateShadowProperty = useCallback(
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

	const toggleShadow = useCallback(() => {
		updateShadowProperty('shadowEnabled', !shadowEnabled);
	}, [shadowEnabled, updateShadowProperty]);

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<InspectorSubLabel>그림자</InspectorSubLabel>
				<button
					type="button"
					onClick={toggleShadow}
					className={`relative h-5 w-9 rounded-full transition-colors ${
						shadowEnabled ? 'bg-blue-600' : 'bg-white/20'
					}`}
					aria-label="그림자 토글"
					aria-pressed={shadowEnabled}
				>
					<span
						className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
							shadowEnabled ? 'left-4' : 'left-0.5'
						}`}
					/>
				</button>
			</div>

			{shadowEnabled && (
				<div className="space-y-3 pl-2 border-l-2 border-white/10">
					<QuickColorPicker
						color={shadowColor}
						onChange={(c) => updateShadowProperty('shadowColor', c)}
						label="색상"
					/>

					<div>
						<InspectorSubLabel>흐림</InspectorSubLabel>
						<div className="flex items-center gap-2">
							<input
								type="range"
								min={0}
								max={30}
								value={shadowBlur}
								onChange={(e) =>
									updateShadowProperty('shadowBlur', Number(e.target.value))
								}
								className="flex-1"
							/>
							<span className="w-10 text-right text-xs text-neutral-400">
								{shadowBlur}px
							</span>
						</div>
					</div>

					<div>
						<InspectorSubLabel>X 오프셋</InspectorSubLabel>
						<div className="flex items-center gap-2">
							<input
								type="range"
								min={-20}
								max={20}
								value={shadowOffsetX}
								onChange={(e) =>
									updateShadowProperty('shadowOffsetX', Number(e.target.value))
								}
								className="flex-1"
							/>
							<span className="w-10 text-right text-xs text-neutral-400">
								{shadowOffsetX}px
							</span>
						</div>
					</div>

					<div>
						<InspectorSubLabel>Y 오프셋</InspectorSubLabel>
						<div className="flex items-center gap-2">
							<input
								type="range"
								min={-20}
								max={20}
								value={shadowOffsetY}
								onChange={(e) =>
									updateShadowProperty('shadowOffsetY', Number(e.target.value))
								}
								className="flex-1"
							/>
							<span className="w-10 text-right text-xs text-neutral-400">
								{shadowOffsetY}px
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export const ShadowControls = memo(ShadowControlsUnmemoized);
