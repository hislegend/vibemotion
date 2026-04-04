import React from 'react';

interface InspectorRowProps {
	label: string;
	children: React.ReactNode;
}

export const InspectorRow: React.FC<InspectorRowProps> = ({label, children}) => {
	return (
		<div className="flex items-center justify-between gap-3 py-1">
			<span className="text-xs text-neutral-400 whitespace-nowrap">{label}</span>
			<div className="flex-1">{children}</div>
		</div>
	);
};
