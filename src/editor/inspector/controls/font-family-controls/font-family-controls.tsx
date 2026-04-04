import * as Popover from '@radix-ui/react-popover';
import {useVirtualizer} from '@tanstack/react-virtual';
import React, {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {flushSync} from 'react-dom';
import {scrollbarStyle} from '../../../constants';
import {GOOGLE_FONTS_LIST} from '../../../data/google-fonts-list';
import {KOREAN_FONTS_LIST} from '../../../data/korean-fonts-list';
import {
	FEATURE_FONT_FAMILY_CONTROLS_PREVIEW_ON_HOVER,
	FEATURE_FONT_FAMILY_DROPDOWN_RENDER_IN_FONT,
} from '../../../flags';
import {useCustomFonts} from '../../../hooks/use-custom-fonts';
import {changeItem} from '../../../state/actions/change-item';
import {editAndRelayoutText} from '../../../state/actions/edit-and-relayout-text';
import {setTextItemHoverPreview} from '../../../state/actions/set-hover-preview';
import {loadFontFromTextItem} from '../../../utils/text/load-font-from-text-item';
import {makeFontPreviewName} from '../../../utils/text/load-font-preview';
import {useFontPreviewLoader} from '../../../utils/text/use-font-preview-loader';
import {useWriteContext} from '../../../utils/use-context';
import {InspectorSubLabel} from '../../components/inspector-label';
import {FontFamilySelectionItem} from './font-family-selection-item';

const FONT_ITEM_HEIGHT = 30;
const SECTION_HEADER_HEIGHT = 28;

// 섹션 헤더 또는 폰트 아이템을 나타내는 타입
type FontListItem = 
	| { type: 'header'; label: string; isKorean: boolean }
	| { type: 'font'; fontFamily: string; displayName?: string; importName: string; isKorean: boolean; isCustom?: boolean };

const FontFamilyControlUnmemoized: React.FC<{
	fontFamily: string;
	itemId: string;
}> = ({fontFamily, itemId}) => {
	const [search, setSearch] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const {loadFontForPreview, loadedFonts} = useFontPreviewLoader();
	const {customFonts} = useCustomFonts();
	const {setState} = useWriteContext();

	// 커스텀 폰트 + 한글 폰트(상단) + 해외 폰트(하단) 목록 - 섹션 헤더 포함
	const extendedFontsList = useMemo((): FontListItem[] => {
		const koreanFonts = KOREAN_FONTS_LIST.filter((f: any) => !f.isCustom);
		const existingFamilies = new Set(GOOGLE_FONTS_LIST.map(f => f.fontFamily));
		const uniqueKoreanFonts = koreanFonts.filter((f: any) => !existingFamilies.has(f.fontFamily));
		
		// 섹션 헤더와 폰트 목록 구성
		const result: FontListItem[] = [];
		
		// 커스텀 폰트 섹션 (있는 경우)
		if (customFonts.length > 0) {
			result.push({ type: 'header', label: '커스텀 폰트', isKorean: true });
			result.push(...customFonts.map((f) => ({
				type: 'font' as const,
				fontFamily: f.font_family,
				displayName: f.display_name,
				importName: f.font_family,
				isKorean: true,
				isCustom: true,
			})));
		}
		
		// 한국어 폰트 섹션
		result.push({ type: 'header', label: '한국어 폰트', isKorean: true });
		result.push(...uniqueKoreanFonts.map((f: any) => ({
			type: 'font' as const,
			fontFamily: f.fontFamily,
			displayName: f.displayName,
			importName: f.importName,
			isKorean: true,
		})));
		
		// International 섹션
		result.push({ type: 'header', label: 'International', isKorean: false });
		result.push(...GOOGLE_FONTS_LIST.map((f: any) => ({
			type: 'font' as const,
			fontFamily: f.fontFamily,
			displayName: undefined,
			importName: f.importName,
			isKorean: false,
		})));
		
		return result;
	}, [customFonts]);

	// 검색 시 헤더 제외하고 폰트만 필터링
	const filteredFonts = useMemo((): FontListItem[] => {
		if (!search) return extendedFontsList;
		
		const lowerSearch = search.toLowerCase();
		return extendedFontsList.filter((item) => {
			if (item.type === 'header') return false; // 검색 시 헤더 제외
			
			// fontFamily(영문) 또는 displayName(한글)으로 검색
			return (
				item.fontFamily.toLowerCase().includes(lowerSearch) ||
				(item.displayName && item.displayName.includes(search))
			);
		});
	}, [search, extendedFontsList]);

	useEffect(() => {
		setHighlightedIndex(-1);
	}, [search]);

	const listRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: filteredFonts.length,
		getScrollElement: () => listRef.current,
		estimateSize: (index) => {
			const item = filteredFonts[index];
			return item?.type === 'header' ? SECTION_HEADER_HEIGHT : FONT_ITEM_HEIGHT;
		},
		overscan: 30,
	});

	const virtualItems = virtualizer.getVirtualItems();

	const selectedFontIndex = useMemo(() => {
		return filteredFonts.findIndex((item) => 
			item.type === 'font' && item.fontFamily === fontFamily
		);
	}, [filteredFonts, fontFamily]);

	useEffect(() => {
		if (!isOpen) return;

		const loadVisibleFonts = async () => {
			const fontsToLoad = virtualItems
				.map((item) => filteredFonts[item.index])
				.filter((item): item is Extract<FontListItem, { type: 'font' }> => item?.type === 'font')
				.map((item) => item.fontFamily);

			await Promise.all(
				fontsToLoad.map((fontFamilyToLoad) =>
					loadFontForPreview(fontFamilyToLoad),
				),
			);
		};

		loadVisibleFonts();
	}, [isOpen, virtualItems, filteredFonts, loadFontForPreview]);

	useEffect(() => {
		loadFontForPreview(fontFamily);
	}, [fontFamily, loadFontForPreview]);

	const fontPreviewStyle = useMemo(() => {
		return {
			fontFamily: FEATURE_FONT_FAMILY_DROPDOWN_RENDER_IN_FONT
				? makeFontPreviewName(fontFamily)
				: 'inherit',
		};
	}, [fontFamily]);

	const applyFontFamily = useCallback(
		(newFontFamily: string) => {
			setState({
				update: (state) => {
					const newState = changeItem(state, itemId, (i) => {
						if (i.type === 'text') {
							return editAndRelayoutText(i, () => {
								if (
									i.fontFamily === newFontFamily &&
									i.fontStyle.variant === 'normal' &&
									i.fontStyle.weight === '400'
								) {
									return i;
								}

								return {
									...i,
									fontFamily: newFontFamily,
									fontStyle: {
										variant: 'normal',
										weight: '400',
									},
								};
							});
						}
						if (i.type === 'captions') {
							if (
								i.fontFamily === newFontFamily &&
								i.fontStyle.variant === 'normal' &&
								i.fontStyle.weight === '400'
							) {
								return i;
							}

							return {
								...i,
								fontFamily: newFontFamily,
								fontStyle: {
									variant: 'normal',
									weight: '400',
								},
							};
						}
						throw new Error(
							'Item type does not implement font change: ' + JSON.stringify(i),
						);
					});

					return setTextItemHoverPreview({
						state: newState,
						hoverPreview: null,
					});
				},
				commitToUndoStack: true,
			});
		},
		[itemId, setState],
	);

	const onFontChange = useCallback(
		async (family: string) => {
			await loadFontFromTextItem({
				fontFamily: family,
				fontVariant: 'normal',
				fontWeight: '400',
				fontInfosDuringRendering: null,
			});
			applyFontFamily(family);
		},
		[applyFontFamily],
	);

	const closePopover = useCallback(() => {
		setIsOpen(false);
	}, [setIsOpen]);

	const handleFontSelect = useCallback(
		(newFontFamily: string) => {
			onFontChange(newFontFamily);
			closePopover();
		},
		[onFontChange, closePopover],
	);

	const handleOpenChange = useCallback(
		(newOpen: boolean) => {
			// virtualizer를 측정하기 전에 popover가 열릴 때까지 먼저 기다립니다
			flushSync(() => setIsOpen(newOpen));

			// 열 때 선택된 font로 스크롤
			if (newOpen) {
				// 스크롤하기 전에 virtualizer가 준비되었는지 확인하기 위해 sync mode에서 virtualizer 측정
				flushSync(() => {
					virtualizer.measure();
				});

				if (selectedFontIndex !== -1) {
					virtualizer.scrollToIndex(selectedFontIndex, {
						align: 'center',
						behavior: 'auto',
					});
					// 선택된 font로 highlighted index 설정
					setHighlightedIndex(selectedFontIndex);
				} else {
					// 선택된 font가 없으면 첫 번째 font를 highlight
					setHighlightedIndex(0);
				}
			} else {
				setState({
					update: (state) => {
						return setTextItemHoverPreview({
							state,
							hoverPreview: null,
						});
					},
					commitToUndoStack: false,
				});

				// 닫을 때 highlighted index 리셋
				setHighlightedIndex(-1);
			}
		},
		[selectedFontIndex, virtualizer, setState],
	);

	const previewedFont = useRef<string | null>(null);

	const previewFont = useCallback(
		async (fontFamilyToPreview: string) => {
			if (!FEATURE_FONT_FAMILY_CONTROLS_PREVIEW_ON_HOVER) {
				return;
			}

			previewedFont.current = fontFamilyToPreview;
			await loadFontFromTextItem({
				fontFamily: fontFamilyToPreview,
				fontVariant: 'normal',
				fontWeight: '400',
				fontInfosDuringRendering: null,
			});

			if (previewedFont.current === fontFamilyToPreview) {
				setState({
					update: (state) => {
						return {
							...state,
							textItemHoverPreview: {
								itemId,
								fontFamily: fontFamilyToPreview,
								type: 'font-family',
							},
						};
					},
					commitToUndoStack: false,
				});
			}
		},
		[itemId, setState],
	);

	// 헤더가 아닌 다음 폰트 인덱스 찾기
	const findNextFontIndex = useCallback((currentIndex: number, direction: 'up' | 'down'): number => {
		const step = direction === 'down' ? 1 : -1;
		let nextIndex = currentIndex + step;
		
		while (nextIndex >= 0 && nextIndex < filteredFonts.length) {
			if (filteredFonts[nextIndex]?.type === 'font') {
				return nextIndex;
			}
			nextIndex += step;
		}
		
		return currentIndex;
	}, [filteredFonts]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!isOpen) return;

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					setHighlightedIndex((prev) => {
						const newIndex = findNextFontIndex(prev === -1 ? -1 : prev, 'down');
						const item = filteredFonts[newIndex];
						if (item?.type === 'font') {
							previewFont(item.fontFamily);
						}
						virtualizer.scrollToIndex(newIndex, {
							align: 'center',
							behavior: 'auto',
						});
						return newIndex;
					});
					break;
				case 'ArrowUp':
					e.preventDefault();
					setHighlightedIndex((prev) => {
						const newIndex = findNextFontIndex(prev === -1 ? filteredFonts.length : prev, 'up');
						const item = filteredFonts[newIndex];
						if (item?.type === 'font') {
							previewFont(item.fontFamily);
						}
						virtualizer.scrollToIndex(newIndex, {
							align: 'center',
							behavior: 'auto',
						});
						return newIndex;
					});
					break;
				case 'Enter':
					e.preventDefault();
					if (
						highlightedIndex >= 0 &&
						highlightedIndex < filteredFonts.length
					) {
						const selectedFont = filteredFonts[highlightedIndex];
						if (selectedFont?.type === 'font') {
							handleFontSelect(selectedFont.fontFamily);
						}
					}
					break;
				case 'Escape':
					e.preventDefault();
					closePopover();
					break;
			}
		},
		[
			isOpen,
			filteredFonts,
			highlightedIndex,
			virtualizer,
			handleFontSelect,
			closePopover,
			previewFont,
			findNextFontIndex,
		],
	);

	const onPointerDownOutside = useCallback(
		(e: CustomEvent<{originalEvent: PointerEvent}>) => {
			closePopover();
			e.stopPropagation();
		},
		[closePopover],
	);

	const resetFontFamily = useCallback(() => {
		setState({
			update: (state) => {
				return setTextItemHoverPreview({
					state,
					hoverPreview: null,
				});
			},
			commitToUndoStack: false,
		});
	}, [setState]);

	// 현재 선택된 폰트의 displayName 또는 fontFamily 찾기
	const currentFontDisplayName = useMemo(() => {
		const koreanFont = KOREAN_FONTS_LIST.find(f => f.fontFamily === fontFamily);
		return koreanFont?.displayName || fontFamily;
	}, [fontFamily]);

	return (
		<div>
			<InspectorSubLabel>Font</InspectorSubLabel>
			<Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
				<Popover.Trigger asChild>
					<button
						type="button"
						className="editor-starter-field w-full truncate px-2 py-2 text-left text-xs text-neutral-300"
						style={fontPreviewStyle}
						aria-label="Font Family"
					>
						{currentFontDisplayName}
					</button>
				</Popover.Trigger>
				<Popover.Portal>
					<>
						<div className="absolute inset-0"></div>
						<Popover.Content
							onPointerDownOutside={onPointerDownOutside}
							side="left"
							sideOffset={5}
							align="start"
							collisionBoundary={null}
							className="bg-editor-starter-panel data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 w-64 overflow-hidden rounded border border-white/10 shadow-xl"
							style={{
								maxHeight: '300px',
							}}
							onKeyDown={handleKeyDown}
						>
							<div className="border-b border-white/10">
								<input
									type="text"
									placeholder="폰트 검색..."
									value={search}
									aria-label="폰트 검색"
									onChange={(e) => setSearch(e.target.value)}
									className="editor-starter-field w-full appearance-none border-none px-3 py-2 text-xs text-neutral-300"
									autoFocus
								/>
							</div>
							<div
								ref={listRef}
								className="overflow-y-scroll"
								style={{
									maxHeight: '240px',
									minHeight: filteredFonts.length > 0 ? '100px' : '0',
									...scrollbarStyle,
								}}
							>
								<div
									style={{
										height: `${virtualizer.getTotalSize() + 8}px`,
										width: '100%',
										position: 'relative',
										paddingTop: 4,
										paddingBottom: 4,
									}}
								>
									{virtualItems.map((virtualItem) => {
										const item = filteredFonts[virtualItem.index];

										if (!item) {
											throw new Error(
												'Item not found for virtual item: ' + virtualItem.index,
											);
										}

										// 섹션 헤더 렌더링
										if (item.type === 'header') {
											return (
												<div
													key={`header-${item.label}`}
													className="absolute left-0 right-0 flex items-center px-3 text-[10px] font-semibold uppercase tracking-wider text-blue-400"
													style={{
														height: `${SECTION_HEADER_HEIGHT}px`,
														transform: `translateY(${virtualItem.start}px)`,
														backgroundColor: 'rgba(59, 130, 246, 0.1)',
													}}
												>
													{item.label}
												</div>
											);
										}

										// 폰트 아이템 렌더링
										const isSelected = fontFamily === item.fontFamily;
										const isHighlighted = highlightedIndex === virtualItem.index;
										const isLoaded = FEATURE_FONT_FAMILY_DROPDOWN_RENDER_IN_FONT
											? loadedFonts.has(item.fontFamily)
											: true;

										return (
											<FontFamilySelectionItem
												fontFamily={item.fontFamily}
												displayName={item.displayName}
												isLoaded={isLoaded}
												start={virtualItem.start}
												size={virtualItem.size}
												isHighlighted={isHighlighted}
												isSelected={isSelected}
												applyFontFamily={applyFontFamily}
												setIsOpen={setIsOpen}
												key={virtualItem.key}
												resetFontFamily={resetFontFamily}
												previewFont={previewFont}
											/>
										);
									})}
								</div>
							</div>
							{filteredFonts.length === 0 && (
								<div className="px-3 py-2 text-sm text-gray-400">
									폰트를 찾을 수 없습니다
								</div>
							)}
						</Popover.Content>
					</>
				</Popover.Portal>
			</Popover.Root>
		</div>
	);
};

export const FontFamilyControl = memo(FontFamilyControlUnmemoized);
