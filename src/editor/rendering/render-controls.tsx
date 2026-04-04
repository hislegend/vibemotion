import React, {useState} from 'react';

import {InspectorLabel} from '../inspector/components/inspector-label';
import {InspectorSection} from '../inspector/components/inspector-section';
import {getCompositionDuration} from '../utils/get-composition-duration';
import {useCurrentStateAsRef, useDimensions, useWriteContext} from '../utils/use-context';
import {triggerSupabaseRender} from './trigger-supabase-render';
import {triggerWebRender} from './trigger-web-render';
import {TriggerRenderButton} from './trigger-render-button';
import {getProjectIdForEditor} from '../state/supabase-initial-state';
import {toast} from 'sonner';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../select';

type RendererOption = 'shotstack' | 'browser';

export const RenderControls: React.FC = () => {
	const {setState} = useWriteContext();
	const state = useCurrentStateAsRef();
	const {compositionWidth, compositionHeight} = useDimensions();
	const [renderer, setRenderer] = useState<RendererOption>('shotstack');
	const [isRendering, setIsRendering] = useState(false);

	const onClick = React.useCallback(async () => {
		const {assets, tracks, items, fps} = state.current.undoableState;
		const durationInFrames = getCompositionDuration(Object.values(items));
		const durationInSeconds = durationInFrames / fps;

		const projectId = getProjectIdForEditor();
		if (!projectId) {
			toast.error('프로젝트 ID가 없습니다. 갤러리에서 다시 열어주세요.');
			return;
		}

		if (renderer === 'browser') {
			if (typeof VideoEncoder === 'undefined') {
				toast.error('이 브라우저는 WebCodecs를 지원하지 않습니다. Chrome 94+ 에서 사용해주세요.');
				return;
			}

			setIsRendering(true);
			try {
				await triggerWebRender({
					items,
					tracks,
					assets,
					fps,
					compositionWidth,
					compositionHeight,
					projectId,
					setState,
					durationInSeconds,
				});
			} finally {
				setIsRendering(false);
			}
		} else {
			await triggerSupabaseRender({
				items,
				tracks,
				assets,
				fps,
				projectId,
				setState,
				durationInSeconds,
			});
		}
	}, [setState, state, compositionWidth, compositionHeight, renderer]);

	return (
		<InspectorSection>
			<InspectorLabel>Export</InspectorLabel>
			<div className="h-2"></div>
			<div className="w-full">
				<div className="mb-3">
					<Select
						value={renderer}
						onValueChange={(v) => setRenderer(v as RendererOption)}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="shotstack">
								<span className="text-xs text-neutral-300">Shotstack (서버)</span>
							</SelectItem>
							<SelectItem value="browser">
								<span className="text-xs text-neutral-300">Browser (WebCodecs)</span>
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<TriggerRenderButton onTrigger={onClick} />
				{isRendering && (
					<p className="mt-2 text-xs text-neutral-400 animate-pulse">
						브라우저에서 렌더링 중...
					</p>
				)}
			</div>
		</InspectorSection>
	);
};
