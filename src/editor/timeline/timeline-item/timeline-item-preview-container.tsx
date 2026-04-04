export function TimelineItemPreviewContainer({
	children,
	style,
	isSelected,
}: {
	children: React.ReactNode;
	style: React.CSSProperties;
	isSelected: boolean;
}) {
	return (
		<div
			className={`pointer-events-none absolute box-border rounded-sm select-none ${
				isSelected 
					? 'border-2 border-white shadow-[0_0_0_1px_rgba(255,255,255,0.3)]' 
					: 'border border-black'
			}`}
			style={{...style, overflow: 'hidden'}}
		>
			{children}
		</div>
	);
}
