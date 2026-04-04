import {hasBeenAborted, WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import {rotateAndResizeVideoFrame} from '@remotion/webcodecs';
import {extractFramesOnWebWorker} from '@remotion/webcodecs/worker';
import React, {useLayoutEffect, useRef, useState} from 'react';
import {VideoItem} from '../../items/video/video-item-type';
import {usePreferredLocalUrl} from '../../utils/find-asset-by-id';
import {
	clearOldFrames,
	FrameDatabaseKey,
	getFrameFromFrameDatabase,
	getKeysFromFrameDatabase,
	getTimestampFromFrameDatabaseKey,
	setFrameInFrameDatabase,
} from '../../utils/frame-database';
import {getVisibleFrames} from '../../utils/get-visible-frames';
import {useAssetFromItem, useTimelineContext} from '../../utils/use-context';
import {useTimelineSize} from '../utils/use-timeline-size';

// 디스플레이 간 이동 시 버그를 방지하기 위해 component 외부에 이 값을 유지합니다.
const DEVICE_PIXEL_RATIO =
	typeof window !== 'undefined' ? window.devicePixelRatio : 1;

// video item이 있고 audio가 없는 경우 더 높을 수 있으며, 그럴 때 item 높이를 채웁니다.
export const FILMSTRIP_HEIGHT_IF_THERE_IS_AUDIO = 46;

const getDurationOfOneImage = ({
	aspectRatio,
	pxPerSecond,
	height,
}: {
	aspectRatio: number;
	pxPerSecond: number;
	height: number;
}) => {
	const widthOfOneFrame = height * aspectRatio;
	return Math.round((widthOfOneFrame / pxPerSecond) * WEBCODECS_TIMESCALE);
};

const fixRounding = (value: number) => {
	if (value % 1 >= 0.49999999) {
		return Math.ceil(value);
	}

	return Math.floor(value);
};

export const getMaxDistanceInWebCodecsUnits = (durationOfOneImage: number) => {
	return (durationOfOneImage / 2) * 3;
};

const calculateTimestampSlots = ({
	fromSeconds,
	toSeconds,
	aspectRatio,
	height,
	pxPerSecond,
	durationOfOneImage,
}: {
	fromSeconds: number;
	toSeconds: number;
	aspectRatio: number;
	height: number;
	pxPerSecond: number;
	durationOfOneImage: number;
}) => {
	const widthOfOneFrame = height * aspectRatio;
	const width = (toSeconds - fromSeconds) * pxPerSecond;
	const framesFitInWidth = Math.ceil(width / widthOfOneFrame + 0.5) + 1;

	const timestampTargets: number[] = [];

	const getTarget = (i: number) => {
		return fromSeconds * WEBCODECS_TIMESCALE + durationOfOneImage * i;
	};

	const getSnappedToDuration = (i: number) => {
		const target = getTarget(i);
		return fixRounding(target / durationOfOneImage) * durationOfOneImage;
	};

	for (let i = 0; i < framesFitInWidth + 1; i++) {
		const snappedToDuration = getSnappedToDuration(i);
		timestampTargets.push(snappedToDuration + 0.5 * durationOfOneImage);
	}

	return {
		timestampTargets,
		firstIndex: fixRounding(getTarget(0) / durationOfOneImage) - 1,
	};
};

const ensureSlots = ({
	filledSlots,
	timestampTargets,
}: {
	filledSlots: Map<number, number | undefined>;
	timestampTargets: number[];
}) => {
	for (const timestamp of timestampTargets) {
		if (!filledSlots.has(timestamp)) {
			filledSlots.set(timestamp, undefined);
		}
	}
};

const drawSlot = ({
	frame,
	ctx,
	filledSlots,
	timestamp,
	slotIndex,
	setAsFilled,
}: {
	frame: VideoFrame;
	ctx: CanvasRenderingContext2D;
	filledSlots: Map<number, number | undefined>;
	timestamp: number;
	slotIndex: number;
	setAsFilled: boolean;
}) => {
	const left = slotIndex * (frame.displayWidth / DEVICE_PIXEL_RATIO);

	ctx.drawImage(
		frame,
		left,
		0,
		frame.displayWidth / DEVICE_PIXEL_RATIO,
		frame.displayHeight / DEVICE_PIXEL_RATIO,
	);
	if (setAsFilled) {
		filledSlots.set(timestamp, frame.timestamp);
	}
};

const getBestFrameFromDatabase = ({
	keys,
	timestamp,
}: {
	keys: FrameDatabaseKey[];
	timestamp: number;
}) => {
	let bestKey: FrameDatabaseKey | undefined;
	let bestDistance = Infinity;
	for (const key of keys) {
		const distance = Math.abs(
			getTimestampFromFrameDatabaseKey(key) - timestamp,
		);
		if (distance < bestDistance) {
			bestDistance = distance;
			bestKey = key;
		}
	}

	if (!bestKey) {
		return null;
	}
	return {bestKey, bestDistance};
};

const fillWithBestPossibleFrame = ({
	keys,
	timestamp,
	filledSlots,
	ctx,
	slotIndex,
	maxDistanceInWebCodecsUnits,
}: {
	keys: FrameDatabaseKey[];
	timestamp: number;
	filledSlots: Map<number, number | undefined>;
	ctx: CanvasRenderingContext2D;
	slotIndex: number;
	maxDistanceInWebCodecsUnits: number;
}) => {
	const best = getBestFrameFromDatabase({
		keys,
		timestamp,
	});

	if (!best) {
		return;
	}

	const frame = getFrameFromFrameDatabase(best.bestKey);
	if (!frame) {
		throw new Error('Frame not found');
	}

	const alreadyFilled = filledSlots.get(timestamp);

	// 더 가까운 frame이 이미 그려졌으면 채우지 않음
	if (
		alreadyFilled !== undefined &&
		Math.abs(alreadyFilled - timestamp) <=
			Math.abs(frame.frame.timestamp - timestamp)
	) {
		return;
	}

	frame.lastUsed = Date.now();

	drawSlot({
		ctx,
		frame: frame.frame,
		filledSlots,
		timestamp,
		slotIndex,
		setAsFilled: best.bestDistance <= maxDistanceInWebCodecsUnits,
	});
};

const fillWithCachedFrames = ({
	ctx,
	filledSlots,
	src,
	slotsToFill,
	maxDistanceInWebCodecsUnits,
}: {
	ctx: CanvasRenderingContext2D;
	filledSlots: Map<number, number | undefined>;
	src: string;
	slotsToFill: number[];
	maxDistanceInWebCodecsUnits: number;
}) => {
	const keys = getKeysFromFrameDatabase().filter((k) => k.startsWith(src));

	for (const timestamp of slotsToFill) {
		fillWithBestPossibleFrame({
			keys,
			timestamp,
			filledSlots,
			ctx,
			slotIndex: slotsToFill.indexOf(timestamp),
			maxDistanceInWebCodecsUnits,
		});
	}
};

const fillFrameWhereItFits = ({
	frame,
	filledSlots,
	ctx,
	durationOfOneImage,
}: {
	frame: VideoFrame;
	filledSlots: Map<number, number | undefined>;
	ctx: CanvasRenderingContext2D;
	durationOfOneImage: number;
}) => {
	const slots = Array.from(filledSlots.keys());
	const maxDistanceInWebCodecsUnits =
		getMaxDistanceInWebCodecsUnits(durationOfOneImage);

	for (let i = 0; i < slots.length; i++) {
		const slot = slots[i];
		const doesSatisfyMaxTimeDeviation =
			Math.abs(slot - frame.timestamp) <= maxDistanceInWebCodecsUnits;
		if (!doesSatisfyMaxTimeDeviation) {
			continue;
		}

		const filled = filledSlots.get(slot);
		// 더 나은 timestamp가 이미 채워졌으면 채우지 않음
		if (
			filled !== undefined &&
			Math.abs(filled - slot) <= Math.abs(filled - frame.timestamp)
		) {
			continue;
		}

		drawSlot({
			ctx,
			frame,
			filledSlots,
			timestamp: slot,
			slotIndex: i,
			setAsFilled: doesSatisfyMaxTimeDeviation,
		});
	}
};

const saveFrameToDatabase = ({
	frame,
	src,
	scale,
	timestamp,
}: {
	frame: VideoFrame;
	src: string;
	scale: number;
	timestamp: number;
}) => {
	const transformed = rotateAndResizeVideoFrame({
		frame,
		resizeOperation: {
			mode: 'scale',
			scale,
		},
		rotation: 0,
		needsToBeMultipleOfTwo: false,
	});

	if (transformed !== frame) {
		frame.close();
	}

	setFrameInFrameDatabase({
		src,
		timestamp,
		frame: transformed,
	});

	return transformed;
};

export const InnerTimelineItemFilmStrip: React.FC<{
	readonly aspectRatio: number;
	readonly pxPerSecond: number;
	readonly fromSeconds: number;
	readonly toSeconds: number;
	readonly roundedDifference: number;
	readonly height: number;
	readonly src: string;
	durationOfAssetInSeconds: number;
}> = ({
	aspectRatio,
	pxPerSecond,
	fromSeconds,
	toSeconds,
	roundedDifference,
	height,
	src,
	durationOfAssetInSeconds,
}) => {
	const durationOfOneImage = getDurationOfOneImage({
		aspectRatio,
		pxPerSecond,
		height,
	});
	const {timestampTargets, firstIndex} = calculateTimestampSlots({
		fromSeconds,
		aspectRatio,
		pxPerSecond,
		height,
		toSeconds,
		durationOfOneImage,
	});

	const [error, setError] = useState<Error | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	const widthOfOneFrame = Math.round(height * aspectRatio);
	const visualizationWidth = widthOfOneFrame * timestampTargets.length;

	const virtualOffset = firstIndex * widthOfOneFrame;
	const pxOffset = pxPerSecond * fromSeconds;

	const xOfFirstSlot = virtualOffset - pxOffset - roundedDifference;

	const timestampTargetString = timestampTargets.join(',');

	useLayoutEffect(() => {
		if (error) {
			return;
		}

		const {current} = ref;
		if (!current) {
			return;
		}

		const canvas = document.createElement('canvas');
		canvas.width = Math.ceil(visualizationWidth);
		canvas.height = height;
		canvas.style.width = `${Math.ceil(visualizationWidth)}px`;
		canvas.style.height = `${height}px`;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		current.appendChild(canvas);

		// 원하는-timestamp -> 채워진-timestamp
		const filledSlots = new Map<number, number | undefined>();

		const cleanup = () => {
			current.removeChild(canvas);
		};

		const timestampTargetSplit = timestampTargetString.split(',').map(Number);

		ensureSlots({
			filledSlots,
			timestampTargets: timestampTargetSplit,
		});

		const maxDistanceInWebCodecsUnits =
			getMaxDistanceInWebCodecsUnits(durationOfOneImage);

		fillWithCachedFrames({
			ctx,
			filledSlots,
			src,
			slotsToFill: Array.from(filledSlots.keys()),
			maxDistanceInWebCodecsUnits,
		});

		const unfilled = Array.from(filledSlots.keys()).filter(
			(timestamp) => filledSlots.get(timestamp) === undefined,
		);

		// 모든 slot이 채워졌으면 frame을 추출하지 않음
		if (unfilled.length === 0) {
			return cleanup;
		}

		clearOldFrames();

		const controller = new AbortController();

		extractFramesOnWebWorker({
			acknowledgeRemotionLicense: true,
			timestampsInSeconds: () => {
				ensureSlots({
					filledSlots,
					timestampTargets: timestampTargetSplit,
				});

				const unfilledNow = Array.from(filledSlots.keys()).filter(
					(timestamp) => filledSlots.get(timestamp) === undefined,
				);

				return unfilledNow.map((timestamp) =>
					Math.min(timestamp / WEBCODECS_TIMESCALE, durationOfAssetInSeconds),
				);
			},
			src,
			onFrame: (frame) => {
				const scale = (height / frame.displayHeight) * DEVICE_PIXEL_RATIO;

				const transformed = saveFrameToDatabase({
					frame,
					src,
					scale,
					timestamp: frame.timestamp,
				});

				fillFrameWhereItFits({
					ctx,
					filledSlots,
					frame: transformed,
					durationOfOneImage,
				});
			},
			signal: controller.signal,
		})
			.then(() => {
				// 채울 수 없는 몇몇 frame들이 있음, 아마도 화면 녹화이고 timestamp가
				// 목표 timestamp에 충분히 가깝지 않기 때문일 것임.
				const unfilledNow = Array.from(filledSlots.keys()).filter(
					(timestamp) => filledSlots.get(timestamp) === undefined,
				);
				if (unfilledNow.length > 0) {
					const keys = getKeysFromFrameDatabase().filter((k) =>
						k.startsWith(src),
					);

					for (const timestamp of unfilledNow) {
						const best = getBestFrameFromDatabase({
							keys,
							timestamp,
						});

						if (!best) {
							continue;
						}

						const frame = getFrameFromFrameDatabase(best.bestKey);
						if (!frame) {
							throw new Error('Frame not found');
						}

						saveFrameToDatabase({
							frame: frame.frame.clone(),
							src,
							scale: 1,
							timestamp,
						});
					}
				}

				// database에 있는 frame들로 slot들을 채우며, 모든 편차를 허용
				fillWithCachedFrames({
					ctx,
					filledSlots,
					src,
					slotsToFill: Array.from(filledSlots.keys()),
					maxDistanceInWebCodecsUnits,
				});
			})
			.catch((e) => {
				if (hasBeenAborted(e)) {
					return;
				}

				// eslint-disable-next-line no-console
				console.error(`Failed to extract frames for ${src}: ${e}`);

				setError(e);
			})
			.finally(() => {
				clearOldFrames();
			});

		return () => {
			controller.abort();
			cleanup();
		};
	}, [
		aspectRatio,
		error,
		src,
		visualizationWidth,
		height,
		timestampTargetString,
		pxPerSecond,
		widthOfOneFrame,
		durationOfOneImage,
		durationOfAssetInSeconds,
	]);

	const containerStyle = React.useMemo<React.CSSProperties>(
		() => ({
			height,
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			userSelect: 'none',
			pointerEvents: 'none',
			marginLeft: xOfFirstSlot,
		}),
		[height, xOfFirstSlot],
	);

	return <div ref={ref} style={containerStyle} />;
};

export const TimelineItemFilmStrip: React.FC<{
	readonly item: VideoItem;
	readonly startFrom: number;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly roundedDifference: number;
	readonly height: number;
	readonly playbackRate: number;
}> = ({
	startFrom,
	durationInFrames,
	fps,
	roundedDifference,
	height,
	item,
	playbackRate,
}) => {
	const {timelineWidth} = useTimelineSize();
	const {durationInFrames: totalDurationInFrames} = useTimelineContext();
	const visibleFrames = getVisibleFrames({
		fps: fps,
		totalDurationInFrames,
	});
	if (timelineWidth === null) {
		throw new Error('Timeline width is null');
	}

	const fromSeconds = startFrom / fps;
	const toSeconds = (startFrom + durationInFrames * playbackRate) / fps;

	const pxPerSecond = timelineWidth / (visibleFrames / fps) / playbackRate;

	const asset = useAssetFromItem(item);
	const src = usePreferredLocalUrl(asset);
	if (asset.type !== 'video') {
		throw new Error('Asset is not a video');
	}

	return (
		<InnerTimelineItemFilmStrip
			aspectRatio={asset.width / asset.height}
			pxPerSecond={pxPerSecond}
			fromSeconds={fromSeconds}
			toSeconds={toSeconds}
			roundedDifference={roundedDifference}
			height={height}
			src={src}
			durationOfAssetInSeconds={asset.durationInSeconds}
		/>
	);
};
