import React from 'react';

interface CenterGuidesProps {
	showHorizontal: boolean; // 세로선 (| 모양) - 좌우 중앙 정렬 시 표시
	showVertical: boolean; // 가로선 (— 모양) - 상하 중앙 정렬 시 표시
	compositionWidth: number;
	compositionHeight: number;
}

export const CenterGuides: React.FC<CenterGuidesProps> = ({
	showHorizontal,
	showVertical,
	compositionWidth,
	compositionHeight,
}) => {
	if (!showHorizontal && !showVertical) {
		return null;
	}

	return (
		<>
			{/* 세로 중앙선 - 좌우 정렬 시 표시 */}
			{showHorizontal && (
				<div
					style={{
						position: 'absolute',
						left: compositionWidth / 2,
						top: 0,
						width: 1,
						height: compositionHeight,
						backgroundColor: '#3b82f6', // blue-500
						pointerEvents: 'none',
						zIndex: 1000,
					}}
				/>
			)}
			{/* 가로 중앙선 - 상하 정렬 시 표시 */}
			{showVertical && (
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: compositionHeight / 2,
						width: compositionWidth,
						height: 1,
						backgroundColor: '#3b82f6', // blue-500
						pointerEvents: 'none',
						zIndex: 1000,
					}}
				/>
			)}
		</>
	);
};
