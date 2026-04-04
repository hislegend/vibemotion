import {FontInfo} from '@remotion/google-fonts';
import {loadFontFromInfo} from '@remotion/google-fonts/from-info';
import {useLayoutEffect, useMemo, useState} from 'react';
import {
	cancelRender,
	continueRender,
	delayRender,
	getRemotionEnvironment,
} from 'remotion';
import {getFontInfoByFamily} from '../../data/font-info-map';
import {FontStyle} from '../../items/text/text-item-type';

const fontInfoPromiseCache: Record<string, Promise<FontInfo>> = {};

export const getFontVariants = (fontInfo: FontInfo) => {
	const styles: FontStyle[][] = [];
	const variants = Object.keys(fontInfo.fonts);

	// "regular"이 먼저 오고 나머지는 알파벳 순으로 정렬
	const sortedVariants = [
		...variants.filter((v) => v.toLowerCase() === 'normal'),
		...variants.filter((v) => v.toLowerCase() !== 'normal').sort(),
	];

	for (const variant of sortedVariants) {
		styles.push([]);
		const weights = Object.keys(fontInfo.fonts[variant]);
		for (const weight of weights) {
			styles[styles.length - 1].push({variant, weight});
		}
	}
	return styles;
};

// API 호출 대신 동적 import 사용
export const loadFontInfoFromApi = async (
	fontFamily: string,
): Promise<FontInfo> => {
	if (!fontInfoPromiseCache[fontFamily]) {
		fontInfoPromiseCache[fontFamily] = getFontInfoByFamily(fontFamily);
	}

	return fontInfoPromiseCache[fontFamily];
};

export const loadFontInfo = async ({
	fontFamily,
	fontInfosDuringRendering,
}: {
	fontFamily: string;
	fontInfosDuringRendering: FontInfo | null;
}) => {
	if (getRemotionEnvironment().isRendering) {
		if (!fontInfosDuringRendering) {
			throw new Error('Need fontInfosDuringRendering in rendering');
		}

		return fontInfosDuringRendering;
	}

	return loadFontInfoFromApi(fontFamily);
};

type LoadFontInfo = {
	fontFamily: string;
	fontVariant: string;
	fontWeight: string;
	fontInfosDuringRendering: FontInfo | null;
};

export const loadFontFromTextItem = async (item: LoadFontInfo) => {
	const fontInfo = await loadFontInfo({
		fontFamily: item.fontFamily,
		fontInfosDuringRendering: item.fontInfosDuringRendering,
	});

	await loadFontFromInfo(fontInfo, item.fontVariant, {
		weights: [item.fontWeight],
	}).waitUntilDone();
};

export const useLoadFontFromTextItem = ({
	fontFamily,
	fontInfosDuringRendering,
	fontVariant,
	fontWeight,
}: LoadFontInfo) => {
	const [loaded, setLoaded] = useState(false);
	const prom = useMemo(() => {
		return loadFontFromTextItem({
			fontFamily,
			fontInfosDuringRendering,
			fontVariant,
			fontWeight,
		});
	}, [fontFamily, fontInfosDuringRendering, fontVariant, fontWeight]);

	useLayoutEffect(() => {
		const handle = delayRender('Loading font');
		prom
			.then(() => {
				continueRender(handle);
				setLoaded(true);
			})
			.catch((err) => {
				cancelRender(err);
			});
	}, [prom, loaded]);

	return loaded;
};
