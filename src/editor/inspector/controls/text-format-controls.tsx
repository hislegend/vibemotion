import React, {memo, useCallback} from 'react';
import {TextItem} from '../../items/text/text-item-type';
import {changeItem} from '../../state/actions/change-item';
import {useWriteContext} from '../../utils/use-context';
import {InspectorSubLabel} from '../components/inspector-label';

interface TextFormatControlsProps {
	isBold: boolean;
	isItalic: boolean;
	isUnderline: boolean;
	itemId: string;
}

const TextFormatControlsUnmemoized: React.FC<TextFormatControlsProps> = ({
	isBold,
	isItalic,
	isUnderline,
	itemId,
}) => {
	const {setState} = useWriteContext();

	const toggleFormat = useCallback(
		(format: 'isBold' | 'isItalic' | 'isUnderline') => {
			setState({
				update: (state) => {
					return changeItem(state, itemId, (item) => {
						if (item.type !== 'text') return item;
						return {
							...item,
							[format]: !(item as TextItem)[format],
						};
					});
				},
				commitToUndoStack: true,
			});
		},
		[itemId, setState],
	);

	const buttonClass = (active: boolean) =>
		`flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors ${
			active
				? 'bg-blue-600 text-white'
				: 'bg-white/5 text-neutral-300 hover:bg-white/10'
		}`;

	return (
		<div>
			<InspectorSubLabel>서식</InspectorSubLabel>
			<div className="flex gap-1">
				<button
					type="button"
					className={buttonClass(isBold)}
					onClick={() => toggleFormat('isBold')}
					title="굵게 (Bold)"
					aria-label="굵게"
					aria-pressed={isBold}
				>
					<span className="font-bold">B</span>
				</button>
				<button
					type="button"
					className={buttonClass(isItalic)}
					onClick={() => toggleFormat('isItalic')}
					title="기울임 (Italic)"
					aria-label="기울임"
					aria-pressed={isItalic}
				>
					<span className="italic">I</span>
				</button>
				<button
					type="button"
					className={buttonClass(isUnderline)}
					onClick={() => toggleFormat('isUnderline')}
					title="밑줄 (Underline)"
					aria-label="밑줄"
					aria-pressed={isUnderline}
				>
					<span className="underline">U</span>
				</button>
			</div>
		</div>
	);
};

export const TextFormatControls = memo(TextFormatControlsUnmemoized);
