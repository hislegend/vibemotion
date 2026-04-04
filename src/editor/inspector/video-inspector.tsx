import React, {useCallback} from 'react';
import {GenerateCaptionSection} from '../captioning/caption-section';
import {
	FEATURE_ALIGNMENT_CONTROL,
	FEATURE_AUDIO_FADE_CONTROL,
	FEATURE_BORDER_RADIUS_CONTROL,
	FEATURE_DIMENSIONS_CONTROL,
	FEATURE_KEN_BURNS_CONTROL,
	FEATURE_OPACITY_CONTROL,
	FEATURE_PLAYBACKRATE_CONTROL,
	FEATURE_POSITION_CONTROL,
	FEATURE_ROTATION_CONTROL,
	FEATURE_SOURCE_CONTROL,
	FEATURE_VISUAL_FADE_CONTROL,
	FEATURE_VOLUME_CONTROL,
} from '../flags';
import {VideoItem} from '../items/video/video-item-type';
import {useAssetFromItem, useWriteContext, useFps, useCurrentStateAsRef} from '../utils/use-context';
import {InspectorLabel} from './components/inspector-label';
import {
	InspectorDivider,
	InspectorSection,
} from './components/inspector-section';
import {AlignmentControls} from './controls/alignment-controls';
import {AudioFadeControls} from './controls/audio-fade-controls';
import {BorderRadiusControl} from './controls/border-radius-controls';
import {DimensionsControls} from './controls/dimensions-controls';
import {FadeControls} from './controls/fade-controls';
import {OpacityControls} from './controls/opacity-controls';
import {PlaybackRateControls} from './controls/playback-rate-controls';
import {PositionControl} from './controls/position-control';
import {RotationControl} from './controls/rotation-controls';
import {SourceControls} from './controls/source-info/source-info';
import {VolumeControls} from './controls/volume-controls';
import {ExtractAudioSection} from './controls/extract-audio-section';
import {InspectorTabs} from './inspector-tabs';
import {KenBurnsControls} from './controls/ken-burns-controls';
import {AutoCutControls} from './controls/auto-cut-controls';
import {TransitionControls} from './controls/transition-controls';
import {OneClickEditControls} from './controls/one-click-edit-controls';
import {TemplateSelector} from './controls/template-selector';
import {BatchVariations, BatchVariation} from './controls/batch-variations';
import {AutoEditStyle} from '../../types/auto-edit';
import {VideoSegmentAnalysis, CutSection} from '../../types/video-segment';
import {ViralTemplate} from '../../types/viral-template';
import {applyAutoCut} from '../state/actions/apply-auto-cut';
import {applyAutoTransitions, applyUniformTransitions} from '../state/actions/apply-auto-transitions';
import {applyAutoTexts} from '../state/actions/apply-auto-texts';
import {applyAutoBGM} from '../state/actions/apply-auto-bgm';
import {applyTemplate} from '../state/actions/apply-template';
import {toast} from 'sonner';

const VideoInspectorUnmemoized: React.FC<{
	item: VideoItem;
}> = ({item}) => {
	const asset = useAssetFromItem(item);
	const {setState} = useWriteContext();
	const {fps} = useFps();
	const stateRef = useCurrentStateAsRef();

	if (asset.type !== 'video') {
		throw new Error('Video inspector not supported for video assets');
	}

	// 자동 컷 적용
	const handleApplyAutoCut = useCallback((sections: CutSection[]) => {
		setState({
			update: (prevState) => applyAutoCut({
				state: prevState,
				videoItemId: item.id,
				sections,
				fps,
			}),
			commitToUndoStack: true,
		});
		toast.success(`${sections.length}개 클립으로 자동 분할 완료`);
	}, [item.id, fps, setState]);

	// 전환효과 적용
	const handleApplyTransitions = useCallback((style: AutoEditStyle, analysis?: VideoSegmentAnalysis) => {
		setState({
			update: (prevState) => {
				if (analysis) {
					return applyAutoTransitions({
						state: prevState,
						analysis,
						style,
						fps,
					});
				}
				return applyUniformTransitions({
					state: prevState,
					style,
					fps,
				});
			},
			commitToUndoStack: true,
		});
		toast.success('전환효과 적용 완료');
	}, [fps, setState]);

	// 텍스트 오버레이 적용
	const handleApplyTexts = useCallback((analysis: VideoSegmentAnalysis) => {
		const width = asset.type === 'video' ? asset.width : 1080;
		const height = asset.type === 'video' ? asset.height : 1920;
		
		setState({
			update: (prevState) => applyAutoTexts({
				state: prevState,
				analysis,
				fps,
				compositionWidth: width,
				compositionHeight: height,
			}),
			commitToUndoStack: true,
		});
		toast.success('텍스트 오버레이 추가 완료');
	}, [fps, asset, setState]);

	// BGM 적용 (비동기)
	const handleApplyBGM = useCallback(async (analysis?: VideoSegmentAnalysis) => {
		const durationSeconds = asset.type === 'video' ? asset.durationInSeconds : 30;
		
		try {
			// 현재 상태 가져오기
			const currentState = stateRef.current;
			
			// 비동기 BGM 적용
			const newState = await applyAutoBGM({
				state: currentState,
				analysis,
				fps,
				totalDurationSeconds: durationSeconds,
			});
			
			// 상태 업데이트 (직접 새 상태 전달)
			setState({
				update: () => newState,
				commitToUndoStack: true,
			});
			toast.success('BGM 추가 완료');
		} catch (error) {
			console.error('BGM 추가 실패:', error);
			toast.error('BGM 추가 실패');
		}
	}, [fps, asset, setState, stateRef]);

	// 템플릿 적용
	const handleSelectTemplate = useCallback((template: ViralTemplate, analysis?: VideoSegmentAnalysis) => {
		if (!analysis) {
			toast.error('먼저 영상 분석이 필요합니다.');
			return;
		}
		
		setState({
			update: (prevState) => applyTemplate({
				state: prevState,
				template,
				analysis,
				fps,
			}),
			commitToUndoStack: true,
		});
		toast.success(`"${template.nameKr}" 템플릿 적용 완료`);
	}, [fps, setState]);

	// 배치 변형 생성
	const handleGenerateBatch = useCallback(async (variations: BatchVariation[]) => {
		// TODO: 배치 생성 - 별도 프로젝트로 저장하거나 내보내기
		console.log('Generate batch:', variations);
		toast.info(`${variations.length}개 변형 생성 예정 (추후 지원)`);
	}, []);

	const propertiesContent = (
		<div>
			{FEATURE_SOURCE_CONTROL && <SourceControls item={item} />}
			<InspectorSection>
				<InspectorLabel>레이아웃</InspectorLabel>
				{FEATURE_ALIGNMENT_CONTROL && <AlignmentControls itemId={item.id} />}
				{FEATURE_POSITION_CONTROL && (
					<PositionControl left={item.left} top={item.top} itemId={item.id} />
				)}
				{FEATURE_DIMENSIONS_CONTROL && (
					<DimensionsControls
						itemId={item.id}
						height={item.height}
						width={item.width}
					/>
				)}
				{FEATURE_ROTATION_CONTROL && (
					<RotationControl rotation={item.rotation} itemId={item.id} />
				)}
			</InspectorSection>
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>채우기</InspectorLabel>
				{FEATURE_OPACITY_CONTROL && (
					<OpacityControls opacity={item.opacity} itemId={item.id} />
				)}
				{FEATURE_BORDER_RADIUS_CONTROL && (
					<BorderRadiusControl
						borderRadius={item.borderRadius}
						itemId={item.id}
					/>
				)}
			</InspectorSection>
		<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>영상</InspectorLabel>
				{FEATURE_PLAYBACKRATE_CONTROL && (
					<PlaybackRateControls
						playbackRate={item.playbackRate}
						itemId={item.id}
						assetId={item.assetId}
					/>
				)}
			</InspectorSection>
			{asset.hasAudioTrack && (
				<>
					<InspectorDivider />
					<InspectorSection>
						<InspectorLabel>오디오</InspectorLabel>
						{FEATURE_VOLUME_CONTROL && (
							<VolumeControls
								decibelAdjustment={item.decibelAdjustment}
								itemId={item.id}
							/>
						)}
					</InspectorSection>
					<InspectorDivider />
					<GenerateCaptionSection item={item} />
				</>
			)}
			<InspectorDivider />
			<ExtractAudioSection item={item} />
			{/* === AUTO EDIT FEATURE DISABLED - TODO: Re-enable when stable ===
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>🎬 AI 자동 편집</InspectorLabel>
				<OneClickEditControls
					item={item}
					onApplyAutoCut={handleApplyAutoCut}
					onApplyTransitions={handleApplyTransitions}
					onApplyTexts={handleApplyTexts}
					onApplyBGM={handleApplyBGM}
					onSelectTemplate={handleSelectTemplate}
					videoUrl={asset.remoteUrl || undefined}
					videoDuration={asset.durationInSeconds}
				/>
			</InspectorSection>
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>자동 분석 편집</InspectorLabel>
				<AutoCutControls item={item} />
			</InspectorSection>
			=== END AUTO EDIT FEATURE DISABLED === */}
		</div>
	);

	const effectsContent = (
		<div>
			{FEATURE_VISUAL_FADE_CONTROL && (
				<InspectorSection>
					<InspectorLabel>영상 페이드</InspectorLabel>
					<FadeControls
						fadeInDuration={item.fadeInDurationInSeconds}
						fadeOutDuration={item.fadeOutDurationInSeconds}
						itemId={item.id}
						durationInFrames={item.durationInFrames}
					/>
				</InspectorSection>
			)}
		{FEATURE_KEN_BURNS_CONTROL && (
			<>
				<InspectorDivider />
				<InspectorSection>
					<InspectorLabel>Ken Burns 효과</InspectorLabel>
					<KenBurnsControls
						itemId={item.id}
						kenBurnsEffect={item.kenBurnsEffect || 'none'}
						kenBurnsIntensity={item.kenBurnsIntensity ?? 0.15}
					/>
				</InspectorSection>
			</>
		)}
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>전환 효과</InspectorLabel>
				<TransitionControls
					itemId={item.id}
					transitionIn={item.transitionIn || 'none'}
					transitionOut={item.transitionOut || 'none'}
					transitionDuration={item.transitionDurationInSeconds ?? 0.3}
				/>
			</InspectorSection>
			{/* === AUTO EDIT FEATURE DISABLED - TODO: Re-enable when stable ===
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>📋 바이럴 템플릿</InspectorLabel>
				<TemplateSelector onSelectTemplate={handleSelectTemplate} />
			</InspectorSection>
			<InspectorDivider />
			<InspectorSection>
				<InspectorLabel>🔄 배치 변형 생성</InspectorLabel>
				<BatchVariations onGenerateBatch={handleGenerateBatch} />
			</InspectorSection>
			=== END AUTO EDIT FEATURE DISABLED === */}
			{asset.hasAudioTrack && FEATURE_AUDIO_FADE_CONTROL && (
				<>
					<InspectorDivider />
					<InspectorSection>
						<InspectorLabel>오디오 페이드</InspectorLabel>
						<AudioFadeControls
							fadeInDuration={item.audioFadeInDurationInSeconds}
							fadeOutDuration={item.audioFadeOutDurationInSeconds}
							itemId={item.id}
							durationInFrames={item.durationInFrames}
						/>
					</InspectorSection>
				</>
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

export const VideoInspector = React.memo(VideoInspectorUnmemoized);
