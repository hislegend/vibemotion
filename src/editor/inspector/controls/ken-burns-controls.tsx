import React, {useCallback} from 'react';
import {KenBurnsEffect} from '../../items/image/image-item-type';
import {useWriteContext} from '../../utils/use-context';
import {InspectorRow} from '../components/inspector-row';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {Slider} from '@/components/ui/slider';

const KEN_BURNS_OPTIONS: {value: KenBurnsEffect; label: string}[] = [
	{value: 'none', label: '없음'},
	{value: 'zoom-in', label: '줌 인'},
	{value: 'zoom-out', label: '줌 아웃'},
	{value: 'pan-left', label: '패닝 좌'},
	{value: 'pan-right', label: '패닝 우'},
];

interface KenBurnsControlsProps {
	itemId: string;
	kenBurnsEffect: KenBurnsEffect;
	kenBurnsIntensity: number;
}

export const KenBurnsControls: React.FC<KenBurnsControlsProps> = ({
	itemId,
	kenBurnsEffect,
	kenBurnsIntensity,
}) => {
	const {setState} = useWriteContext();

	const handleEffectChange = useCallback(
		(value: string) => {
			setState({
				update: (state) => ({
					...state,
					undoableState: {
						...state.undoableState,
						items: {
							...state.undoableState.items,
							[itemId]: {
								...state.undoableState.items[itemId],
								kenBurnsEffect: value as KenBurnsEffect,
							},
						},
					},
				}),
				commitToUndoStack: true,
			});
		},
		[itemId, setState],
	);

	const handleIntensityChange = useCallback(
		(values: number[], commitToUndoStack: boolean) => {
			const value = values[0] / 100; // 0-30 => 0-0.3
			setState({
				update: (state) => ({
					...state,
					undoableState: {
						...state.undoableState,
						items: {
							...state.undoableState.items,
							[itemId]: {
								...state.undoableState.items[itemId],
								kenBurnsIntensity: value,
							},
						},
					},
				}),
				commitToUndoStack,
			});
		},
		[itemId, setState],
	);

	return (
		<>
			<InspectorRow label="효과">
				<Select value={kenBurnsEffect} onValueChange={handleEffectChange}>
					<SelectTrigger className="h-7 w-full bg-neutral-800 border-neutral-700 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{KEN_BURNS_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</InspectorRow>
			{kenBurnsEffect !== 'none' && (
				<InspectorRow label="강도">
					<div className="flex items-center gap-2 w-full">
						<Slider
							value={[Math.round(kenBurnsIntensity * 100)]}
							onValueChange={(values) => handleIntensityChange(values, false)}
							onValueCommit={(values) => handleIntensityChange(values, true)}
							min={5}
							max={30}
							step={1}
							className="flex-1"
						/>
						<span className="text-[10px] text-neutral-400 w-8 text-right">
							{Math.round(kenBurnsIntensity * 100)}%
						</span>
					</div>
				</InspectorRow>
			)}
		</>
	);
};
