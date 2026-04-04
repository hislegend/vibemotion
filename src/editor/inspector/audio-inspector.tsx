import React from 'react';
import {GenerateCaptionSection} from '../captioning/caption-section';
import {
	FEATURE_AUDIO_FADE_CONTROL,
	FEATURE_PLAYBACKRATE_CONTROL,
	FEATURE_SOURCE_CONTROL,
	FEATURE_VOLUME_CONTROL,
} from '../flags';
import {AudioItem} from '../items/audio/audio-item-type';
import {InspectorLabel} from './components/inspector-label';
import {
	InspectorDivider,
	InspectorSection,
} from './components/inspector-section';
import {AudioFadeControls} from './controls/audio-fade-controls';
import {PlaybackRateControls} from './controls/playback-rate-controls';
import {SourceControls} from './controls/source-info/source-info';
import {VolumeControls} from './controls/volume-controls';
import {InspectorTabs} from './inspector-tabs';

const AudioInspectorUnmemoized: React.FC<{
	item: AudioItem;
}> = ({item}) => {
	const propertiesContent = (
		<div>
			{FEATURE_SOURCE_CONTROL && <SourceControls item={item} />}
			<InspectorSection>
				<InspectorLabel>오디오</InspectorLabel>
				{FEATURE_VOLUME_CONTROL && (
					<VolumeControls
						decibelAdjustment={item.decibelAdjustment}
						itemId={item.id}
					/>
				)}
				{FEATURE_PLAYBACKRATE_CONTROL && (
					<PlaybackRateControls
						playbackRate={item.playbackRate}
						itemId={item.id}
						assetId={item.assetId}
					/>
				)}
			</InspectorSection>
			<InspectorDivider />
			<GenerateCaptionSection item={item} />
		</div>
	);

	const effectsContent = (
		<div>
			{FEATURE_AUDIO_FADE_CONTROL && (
				<InspectorSection>
					<InspectorLabel>오디오 페이드</InspectorLabel>
					<AudioFadeControls
						fadeInDuration={item.audioFadeInDurationInSeconds}
						fadeOutDuration={item.audioFadeOutDurationInSeconds}
						itemId={item.id}
						durationInFrames={item.durationInFrames}
					/>
				</InspectorSection>
			)}
		</div>
	);

	return (
		<InspectorTabs
			propertiesContent={propertiesContent}
			effectsContent={effectsContent}
		/>
	);
};

export const AudioInspector = React.memo(AudioInspectorUnmemoized);
