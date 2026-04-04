export const makeFontPreviewName = (fontFamily: string) => {
	// 동일한 font family 이름을 재사용하면 전체 font를 덮어쓸 수 있고
	// 잘못된 계산을 유발할 수 있습니다.
	return `${fontFamily}Preview`;
};

export const loadFontPreview = async (
	previewName: string,
	fontFamily: string,
): Promise<void> => {
	const res = await fetch(
		`https://fonts.googleapis.com/css?family=${previewName}:400&text=${encodeURIComponent(fontFamily)}`,
	);
	if (!res.ok) {
		throw new Error(`Failed to load font preview for ${fontFamily}`);
	}
	const cssText = await res.text();
	const url = cssText.match(/url\((.*)\)\s/)![1];

	const fontFace = new FontFace(
		makeFontPreviewName(fontFamily),
		`url(${url})`,
		{
			weight: '400',
		},
	);
	await fontFace.load();
	document.fonts.add(fontFace);
};
