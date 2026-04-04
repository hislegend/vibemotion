import {useCallback, useMemo, useState} from 'react';
import {GOOGLE_FONTS_LIST} from '../../data/google-fonts-list';
import {KOREAN_FONTS_LIST} from '../../data/korean-fonts-list';
import {FEATURE_FONT_FAMILY_DROPDOWN_RENDER_IN_FONT} from '../../flags';
import {loadFontPreview} from './load-font-preview';

// 전역 font loading 상태
const globalLoadedFonts = new Set<string>();

// 한국 폰트와 Google 폰트를 병합한 목록
const ALL_FONTS_LIST = [...KOREAN_FONTS_LIST, ...GOOGLE_FONTS_LIST];

export const useFontPreviewLoader = () => {
	const [loadedFonts, setLoadedFonts] = useState(
		() => new Set(globalLoadedFonts),
	);

	const loadFontForPreview = useCallback(
		async (fontFamily: string): Promise<boolean> => {
			if (!FEATURE_FONT_FAMILY_DROPDOWN_RENDER_IN_FONT) {
				return true;
			}

			// font가 이미 로드된 경우 즉시 반환
			if (globalLoadedFonts.has(fontFamily)) {
				return true;
			}

			// 한국 폰트와 Google 폰트 모두에서 검색
			const fontInfo = ALL_FONTS_LIST.find(
				(font) => font.fontFamily === fontFamily,
			);

			if (!fontInfo) {
				// 폰트를 찾지 못해도 에러 대신 false 반환 (fallback 폰트 사용)
				console.warn(`Font ${fontFamily} not found in font lists`);
				return false;
			}

			await loadFontPreview(fontInfo.previewUrl, fontInfo.fontFamily);

			// 전역 및 로컬 상태를 업데이트
			globalLoadedFonts.add(fontFamily);
			setLoadedFonts((prev) => new Set([...prev, fontFamily]));

			return true;
		},
		[],
	);

	const memoized = useMemo(
		() => ({
			loadFontForPreview,
			loadedFonts,
		}),
		[loadFontForPreview, loadedFonts],
	);

	return memoized;
};
