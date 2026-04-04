import {useCallback, useMemo, useRef} from 'react';
import {
	FEATURE_CHANGE_FONT_FAMILY_ON_HOVER,
	FEATURE_FONT_FAMILY_DROPDOWN_RENDER_IN_FONT,
} from '../../../flags';
import {CheckIcon} from '../../../icons/check';
import {loadFontFromTextItem} from '../../../utils/text/load-font-from-text-item';
import {makeFontPreviewName} from '../../../utils/text/load-font-preview';

export const FontFamilySelectionItem: React.FC<{
	fontFamily: string;
	displayName?: string;
	isLoaded: boolean;
	start: number;
	size: number;
	isHighlighted: boolean;
	isSelected: boolean;
	applyFontFamily: (fontFamily: string) => void;
	setIsOpen: (isOpen: boolean) => void;
	resetFontFamily: () => void;
	previewFont: (fontFamilyToPreview: string) => Promise<void>;
}> = ({
	fontFamily,
	displayName,
	isLoaded,
	start,
	size,
	isHighlighted,
	isSelected,
	applyFontFamily,
	setIsOpen,
	resetFontFamily,
	previewFont,
}) => {
	const previewedFontRef = useRef<string | null>(null);

	const onClick = useCallback(() => {
		applyFontFamily(fontFamily);
		setIsOpen(false);
	}, [fontFamily, applyFontFamily, setIsOpen]);

	const onMouseEnter = useCallback(async () => {
		previewedFontRef.current = fontFamily;
		await loadFontFromTextItem({
			fontFamily,
			fontVariant: 'normal',
			fontWeight: '400',
			fontInfosDuringRendering: null,
		});
		if (previewedFontRef.current !== fontFamily) {
			return;
		}

		previewFont(fontFamily);
	}, [fontFamily, previewFont]);

	const onMouseLeave = useCallback(() => {
		previewedFontRef.current = null;
		resetFontFamily();
	}, [resetFontFamily]);

	const style = useMemo(() => {
		return {
			height: `${size}px`,
			left: 4,
			right: 4,
			transform: `translateY(${start}px)`,
			fontFamily: FEATURE_FONT_FAMILY_DROPDOWN_RENDER_IN_FONT
				? makeFontPreviewName(fontFamily)
				: 'inherit',
			opacity: isLoaded ? 1 : 0,
		};
	}, [size, start, fontFamily, isLoaded]);

	return (
		<button
			type="button"
			onClick={onClick}
			className={`absolute flex items-center justify-between rounded px-3 py-2 text-left text-xs text-neutral-300 hover:bg-white/5 focus:outline-none ${isHighlighted ? 'bg-white/5' : ''}`}
			style={style}
			onMouseEnter={
				FEATURE_CHANGE_FONT_FAMILY_ON_HOVER ? onMouseEnter : undefined
			}
			onMouseLeave={
				FEATURE_CHANGE_FONT_FAMILY_ON_HOVER ? onMouseLeave : undefined
			}
			aria-label={fontFamily}
		>
			<span>{displayName || fontFamily}</span>
			{isSelected && <CheckIcon className="size-3 text-neutral-300" />}
		</button>
	);
};
