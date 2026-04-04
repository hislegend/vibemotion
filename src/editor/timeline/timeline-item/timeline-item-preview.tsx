import React, {ComponentProps, PropsWithChildren} from 'react';
import {EditorStarterAsset, ImageAsset} from '../../assets/assets';
import {useLocalUrls} from '../../caching/load-to-blob-url';
import {ITEM_COLORS} from '../../constants';
import {EditorStarterItem} from '../../items/item-type';
import {SolidItem} from '../../items/solid/solid-item-type';

const SimplePreview = ({children, style}: ComponentProps<'div'>) => {
	return (
		<div
			className="flex h-full w-full flex-nowrap gap-1 p-1 text-xs text-white"
			style={{background: '#FF9843', ...style}}
		>
			{children}
		</div>
	);
};

const Text = ({children}: PropsWithChildren) => {
	return <span className="truncate">{children}</span>;
};

SimplePreview.Text = Text;

const CaptionsPreview: React.FC = () => {
	return (
		<SimplePreview style={{background: '#FF7F50'}}>
			<SimplePreview.Text>Captions</SimplePreview.Text>
		</SimplePreview>
	);
};

const TextItemPreview: React.FC<{
	text: string;
}> = ({text}) => {
	return (
		<SimplePreview style={{background: ITEM_COLORS.text}}>
			<SimplePreview.Text>{text}</SimplePreview.Text>
		</SimplePreview>
	);
};

const ImageItemPreview: React.FC<{
	src: string;
}> = ({src}) => {
	return (
		<div
			className="h-full w-full"
			style={{
				backgroundColor: ITEM_COLORS.image,
				backgroundImage: src ? `url(${src})` : undefined,
				backgroundSize: 'contain',
				backgroundPosition: 'left center',
				backgroundRepeat: 'repeat-x',
			}}
		/>
	);
};

const GifItemPreview: React.FC = () => {
	return <SimplePreview style={{background: ITEM_COLORS.gif}}></SimplePreview>;
};

const VideoItemPreview: React.FC = () => {
	return (
		<SimplePreview
			style={{background: 'var(--color-editor-starter-panel)'}}
		></SimplePreview>
	);
};

const AudioItemPreview: React.FC = () => {
	return (
		<SimplePreview
			style={{background: 'var(--color-editor-starter-panel)'}}
		></SimplePreview>
	);
};

const SolidItemPreview: React.FC<{
	item: SolidItem;
}> = ({item}) => {
	return (
		<SimplePreview style={{background: ITEM_COLORS.solid}}>
			<div
				className={'mt-[1px] h-3 w-3 shrink-0 rounded-full'}
				style={{
					backgroundColor: item.color,
				}}
			></div>
			<SimplePreview.Text>Solid</SimplePreview.Text>
		</SimplePreview>
	);
};

export const TimelineItemPreview: React.FC<{
	item: EditorStarterItem;
	asset?: EditorStarterAsset | null;
}> = ({item, asset}) => {
	const localUrls = useLocalUrls();
	const imageAsset = asset?.type === 'image' ? (asset as ImageAsset) : null;
	const localUrl = imageAsset?.id ? localUrls[imageAsset.id] : null;
	const imageSrc = localUrl || imageAsset?.remoteUrl || '';

	if (item.type === 'text') {
		return <TextItemPreview text={item.text} />;
	}

	if (item.type === 'image') {
		return <ImageItemPreview src={imageSrc} />;
	}

	if (item.type === 'video') {
		return <VideoItemPreview />;
	}

	if (item.type === 'solid') {
		return <SolidItemPreview item={item} />;
	}

	if (item.type === 'captions') {
		return <CaptionsPreview />;
	}

	if (item.type === 'audio') {
		return <AudioItemPreview />;
	}

	if (item.type === 'gif') {
		return <GifItemPreview />;
	}

	throw new Error(`Unknown item type: ${JSON.stringify(item satisfies never)}`);
};
