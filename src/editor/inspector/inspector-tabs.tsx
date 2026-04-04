import React, {memo, useState} from 'react';

interface InspectorTabsProps {
	propertiesContent: React.ReactNode;
	effectsContent: React.ReactNode;
}

const InspectorTabsUnmemoized: React.FC<InspectorTabsProps> = ({
	propertiesContent,
	effectsContent,
}) => {
	const [activeTab, setActiveTab] = useState<'properties' | 'effects'>('properties');

	return (
		<div className="flex flex-col h-full">
			{/* 탭 헤더 */}
			<div className="flex border-b border-white/10">
				<button
					type="button"
					onClick={() => setActiveTab('properties')}
					className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === 'properties'
							? 'text-white border-b-2 border-blue-500 bg-white/5'
							: 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
					}`}
				>
					속성
				</button>
				<button
					type="button"
					onClick={() => setActiveTab('effects')}
					className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === 'effects'
							? 'text-white border-b-2 border-blue-500 bg-white/5'
							: 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
					}`}
				>
					효과
				</button>
			</div>

			{/* 탭 콘텐츠 */}
			<div className="flex-1 overflow-y-auto">
				{activeTab === 'properties' ? propertiesContent : effectsContent}
			</div>
		</div>
	);
};

export const InspectorTabs = memo(InspectorTabsUnmemoized);
