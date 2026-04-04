import React from 'react';

export const KeyboardHints: React.FC = () => {
	const shortcuts = [
		{key: 'E', label: '컷'},
		{key: 'Q', label: '앞삭제'},
		{key: 'W', label: '뒤삭제'},
		{key: 'Space', label: '재생'},
		{key: 'Del', label: '삭제'},
		{key: '⌘Z', label: '실행취소'},
		{key: '⌘⇧Z', label: '다시실행'},
	];

	return (
		<div className="flex items-center gap-3">
			{shortcuts.map(({key, label}) => (
				<div key={key} className="flex items-center gap-1 text-[10px] text-neutral-400">
					<kbd className="rounded bg-neutral-700 px-1.5 py-0.5 font-mono text-[9px] text-neutral-300">
						{key}
					</kbd>
					<span>{label}</span>
				</div>
			))}
		</div>
	);
};
