import * as Popover from '@radix-ui/react-popover';
import React, {memo, useCallback, useState} from 'react';
import {InspectorSubLabel} from '../../components/inspector-label';

const QUICK_COLORS = [
	'#FFFFFF', '#000000', '#FF0000', '#00FF00',
	'#0000FF', '#fff936', '#FF00FF', '#00FFFF',
	'#FFA500', '#800080', '#008000', '#FFC0CB',
	'#A52A2A', '#808080', '#FFD700', '#4B0082',
];

interface QuickColorPickerProps {
	color: string;
	onChange: (color: string) => void;
	label?: string;
	allowTransparent?: boolean;
}

const QuickColorPickerUnmemoized: React.FC<QuickColorPickerProps> = ({
	color,
	onChange,
	label = '색상',
	allowTransparent = false,
}) => {
	const [showAdvanced, setShowAdvanced] = useState(false);

	const handleQuickColorClick = useCallback(
		(c: string) => {
			onChange(c);
		},
		[onChange],
	);

	const handleAdvancedChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange(e.target.value);
		},
		[onChange],
	);

	const handleTransparentClick = useCallback(() => {
		onChange('transparent');
	}, [onChange]);

	const isTransparent = color === 'transparent';
	const displayColor = isTransparent ? '#FFFFFF' : color;

	return (
		<div>
			<InspectorSubLabel>{label}</InspectorSubLabel>
			<div className="space-y-2">
				{/* 현재 색상 미리보기 + 상세 팔레트 버튼 */}
				<div className="flex items-center gap-2">
					<Popover.Root open={showAdvanced} onOpenChange={setShowAdvanced}>
						<Popover.Trigger asChild>
							<button
								type="button"
								className="relative h-8 w-8 rounded border border-white/20 cursor-pointer hover:border-white/40 transition-colors"
								style={{backgroundColor: displayColor}}
								title="상세 색상 선택"
								aria-label="상세 색상 선택"
							>
								{isTransparent && (
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="w-full h-0.5 bg-red-500 rotate-45 absolute" />
									</div>
								)}
							</button>
						</Popover.Trigger>
						<Popover.Portal>
							<Popover.Content
								side="left"
								sideOffset={8}
								className="z-50 rounded-lg border border-white/10 bg-neutral-900 p-3 shadow-xl"
							>
								<div className="space-y-2">
									<p className="text-xs text-neutral-400">상세 색상 선택</p>
									<input
										type="color"
										value={displayColor}
										onChange={handleAdvancedChange}
										className="h-32 w-32 cursor-pointer rounded border-none bg-transparent"
									/>
									<input
										type="text"
										value={color}
										onChange={(e) => onChange(e.target.value)}
										className="w-full rounded bg-white/5 px-2 py-1 text-xs text-neutral-300"
										placeholder="#FFFFFF"
									/>
								</div>
							</Popover.Content>
						</Popover.Portal>
					</Popover.Root>
					<span className="text-xs text-neutral-400 font-mono">
						{isTransparent ? '투명' : color.toUpperCase()}
					</span>
				</div>

				{/* 16색 퀵 팔레트 */}
				<div className="grid grid-cols-8 gap-1">
					{QUICK_COLORS.map((c) => (
						<button
							key={c}
							type="button"
							className={`h-5 w-5 rounded border transition-transform hover:scale-110 ${
								color === c ? 'border-blue-500 ring-1 ring-blue-500' : 'border-white/20'
							}`}
							style={{backgroundColor: c}}
							onClick={() => handleQuickColorClick(c)}
							title={c}
							aria-label={`색상 ${c}`}
						/>
					))}
				</div>

				{/* 투명 버튼 */}
				{allowTransparent && (
					<button
						type="button"
						onClick={handleTransparentClick}
						className={`w-full rounded px-2 py-1 text-xs transition-colors ${
							isTransparent
								? 'bg-blue-600 text-white'
								: 'bg-white/5 text-neutral-300 hover:bg-white/10'
						}`}
					>
						투명
					</button>
				)}
			</div>
		</div>
	);
};

export const QuickColorPicker = memo(QuickColorPickerUnmemoized);
