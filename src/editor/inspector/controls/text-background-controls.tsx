import React, {memo, useCallback} from 'react';
import {TextItem} from '../../items/text/text-item-type';
import {changeItem} from '../../state/actions/change-item';
import {useWriteContext} from '../../utils/use-context';
import {InspectorSubLabel} from '../components/inspector-label';
import {QuickColorPicker} from './color-picker/quick-color-picker';

interface TextBackgroundControlsProps {
	backgroundColor: string;
	backgroundPadding: number;
	itemId: string;
}

const TextBackgroundControlsUnmemoized: React.FC<TextBackgroundControlsProps> = ({
	backgroundColor,
	backgroundPadding,
	itemId,
}) => {
	const {setState} = useWriteContext();

	const updateProperty = useCallback(
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

	const hasBackground = backgroundColor && backgroundColor !== 'transparent';

	return (
		<div className="space-y-3">
			<QuickColorPicker
				color={backgroundColor}
				onChange={(c) => updateProperty('backgroundColor', c)}
				label="배경"
				allowTransparent
			/>

			{hasBackground && (
				<div>
					<InspectorSubLabel>패딩</InspectorSubLabel>
					<div className="flex items-center gap-2">
						<input
							type="range"
							min={0}
							max={40}
							value={backgroundPadding}
							onChange={(e) =>
								updateProperty('backgroundPadding', Number(e.target.value))
							}
							className="flex-1"
						/>
						<span className="w-10 text-right text-xs text-neutral-400">
							{backgroundPadding}px
						</span>
					</div>
				</div>
			)}
		</div>
	);
};

export const TextBackgroundControls = memo(TextBackgroundControlsUnmemoized);
