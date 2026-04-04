import React from 'react';
import {formatBytes} from '../utils/format-bytes';

interface ProgressBarProps {
	progress: number; // 0-1 \uc18c\uc218\uac12\uc73c\ub85c \uc608\uc0c1\ub428
	label?: string;
	showBytes?: {
		loaded: number;
		total: number;
	};
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
	progress,
	label,
	showBytes,
}) => {
	// progress가 0과 1 사이에 있도록 보장
	const normalizedProgress = Math.max(0, Math.min(1, progress));
	const percentage = Math.round(normalizedProgress * 100);

	return (
		<div className="text-xs text-white/75">
			{label && <div>{label}</div>}
			<div className="mt-2">
				{showBytes ? (
					<>
						{formatBytes(showBytes.loaded)} / {formatBytes(showBytes.total)} (
						{percentage}%)
					</>
				) : (
					<>{percentage}%</>
				)}
			</div>
			<div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
				<div
					className="h-full bg-white/50 transition-all duration-300"
					style={{width: `${percentage}%`}}
				/>
			</div>
		</div>
	);
};
