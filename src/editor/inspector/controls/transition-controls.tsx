// Phase 5A: 전환 효과 컨트롤 UI 컴포넌트

import React, { useCallback } from 'react';
import { TransitionType } from '@/editor/items/video/video-item-type';
import { useWriteContext } from '@/editor/utils/use-context';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/editor/select';
import { Slider } from '@/editor/slider';

const TRANSITION_OPTIONS: { value: TransitionType; label: string }[] = [
	{ value: 'none', label: '없음' },
	{ value: 'fade', label: '페이드' },
	{ value: 'slide-left', label: '슬라이드 좌' },
	{ value: 'slide-right', label: '슬라이드 우' },
	{ value: 'zoom-in', label: '줌 인' },
	{ value: 'zoom-out', label: '줌 아웃' },
];

interface TransitionControlsProps {
	itemId: string;
	transitionIn: TransitionType;
	transitionOut: TransitionType;
	transitionDuration: number;
}

export const TransitionControls: React.FC<TransitionControlsProps> = ({
	itemId,
	transitionIn,
	transitionOut,
	transitionDuration,
}) => {
	const { setState } = useWriteContext();

	const updateTransition = useCallback(
		(
			key: 'transitionIn' | 'transitionOut' | 'transitionDurationInSeconds',
			value: TransitionType | number,
			commitToUndoStack: boolean
		) => {
			setState({
				update: (state) => ({
					...state,
					undoableState: {
						...state.undoableState,
						items: {
							...state.undoableState.items,
							[itemId]: {
								...state.undoableState.items[itemId],
								[key]: value,
							},
						},
					},
				}),
				commitToUndoStack,
			});
		},
		[itemId, setState]
	);

	const handleTransitionInChange = useCallback(
		(value: string) => {
			updateTransition('transitionIn', value as TransitionType, true);
		},
		[updateTransition]
	);

	const handleTransitionOutChange = useCallback(
		(value: string) => {
			updateTransition('transitionOut', value as TransitionType, true);
		},
		[updateTransition]
	);

	const handleDurationChange = useCallback(
		(value: number, commitToUndoStack: boolean) => {
			updateTransition('transitionDurationInSeconds', value, commitToUndoStack);
		},
		[updateTransition]
	);

	return (
		<div className="space-y-3">
			{/* 시작 전환 */}
			<div className="flex items-center justify-between">
				<span className="text-xs text-muted-foreground">시작 전환</span>
				<Select value={transitionIn} onValueChange={handleTransitionInChange}>
					<SelectTrigger size="sm" className="w-28">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{TRANSITION_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* 종료 전환 */}
			<div className="flex items-center justify-between">
				<span className="text-xs text-muted-foreground">종료 전환</span>
				<Select value={transitionOut} onValueChange={handleTransitionOutChange}>
					<SelectTrigger size="sm" className="w-28">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{TRANSITION_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* 지속시간 */}
			<div className="space-y-1">
				<div className="flex items-center justify-between">
					<span className="text-xs text-muted-foreground">지속시간</span>
					<span className="text-xs font-mono">{transitionDuration.toFixed(2)}초</span>
				</div>
				<Slider
					title="전환 지속시간"
					value={transitionDuration}
					min={0.1}
					max={1.0}
					step={0.05}
					onValueChange={handleDurationChange}
				/>
			</div>
		</div>
	);
};
