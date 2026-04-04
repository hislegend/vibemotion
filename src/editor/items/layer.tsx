import React, {useContext, useMemo} from 'react';
import {Sequence, useVideoConfig} from 'remotion';
import {ItemSelectedForCropContext} from '../context-provider';
import {FEATURE_CROP_BACKGROUNDS} from '../flags';
import {getCanCrop} from '../utils/get-crop-from-item';
import {useItem} from '../utils/use-context';
import {InnerLayer} from './inner-layer';

export const Layer: React.FC<{
	itemId: string;
	trackMuted: boolean;
}> = ({itemId, trackMuted}) => {
	const {fps} = useVideoConfig();
	const item = useItem(itemId);
	const itemSelectedForCrop = useContext(ItemSelectedForCropContext);
	const itemIsBeingCropped = item?.id === itemSelectedForCrop && getCanCrop(item);

	const sequenceStyle: React.CSSProperties = useMemo(
		() => ({
			display: 'contents',
			opacity: item.opacity,
		}),
		[item.opacity],
	);

	const styleWhilePremounted: React.CSSProperties = useMemo(
		() => ({
			display: 'block',
		}),
		[],
	);

	return (
		<>
			<Sequence
				key={item.id}
				from={item.from}
				style={sequenceStyle}
				durationInFrames={item.durationInFrames}
				styleWhilePremounted={styleWhilePremounted}
				premountFor={1.5 * fps}
			>
				{/* 크롭 모드일 때: 원본 이미지를 반투명 배경으로 표시 */}
				{itemIsBeingCropped && FEATURE_CROP_BACKGROUNDS ? (
					<InnerLayer item={item} trackMuted={trackMuted} cropBackground={true} />
				) : null}
				{/* 실제 이미지 (크롭 적용) */}
				<InnerLayer item={item} trackMuted={trackMuted} cropBackground={false} />
			</Sequence>
		</>
	);
};
