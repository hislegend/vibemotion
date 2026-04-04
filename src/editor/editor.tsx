'use client';

import type {PlayerRef} from '@remotion/player';
import {useRef} from 'react';
import {Toaster} from 'sonner';
import {ActionRow} from './action-row/action-row';
import {DownloadRemoteAssets} from './caching/download-remote-assets';
import {UseLocalCachedAssets} from './caching/use-local-cached-assets';
import {ContextProvider} from './context-provider';
import './editor-starter.css';
import {FEATURE_RESIZE_TIMELINE_PANEL} from './flags';
import {ForceSpecificCursor} from './force-specific-cursor';
import {ClipOrderShortcuts} from './keyboard-shortcuts/clip-order-shortcuts';
import {PlaybackControls} from './playback-controls';
import {PreviewSizeProvider} from './preview-size-provider';
import {TimelineResizer} from './timeline-resizer';
import {Timeline} from './timeline/timeline';
import {TimelineContainer} from './timeline/timeline-container';
import {TopPanel} from './top-panel';
import {WaitForInitialized} from './wait-for-initialized';
import {TemplateEditProvider} from './template/template-edit-provider';
import {TemplateEditOverlay} from './template/template-edit-overlay';

export const Editor: React.FC<{projectId?: string}> = ({projectId}) => {
	const playerRef = useRef<PlayerRef | null>(null);

	return (
		<div className="dark bg-editor-starter-bg flex h-screen w-screen flex-col items-center justify-between">
			<ContextProvider>
				<TemplateEditProvider>
					<WaitForInitialized>
						<PreviewSizeProvider>
							<ActionRow playerRef={playerRef} projectId={projectId} />
							<TopPanel playerRef={playerRef} projectId={projectId} />
						</PreviewSizeProvider>
						<PlaybackControls playerRef={playerRef} />
						{FEATURE_RESIZE_TIMELINE_PANEL && <TimelineResizer />}
						<TimelineContainer playerRef={playerRef}>
							<Timeline playerRef={playerRef} />
						</TimelineContainer>
						<ClipOrderShortcuts />
					</WaitForInitialized>
					<TemplateEditOverlay />
				</TemplateEditProvider>
				<ForceSpecificCursor />
				<DownloadRemoteAssets />
				<UseLocalCachedAssets />
				<Toaster theme="dark" />
			</ContextProvider>
		</div>
	);
};
