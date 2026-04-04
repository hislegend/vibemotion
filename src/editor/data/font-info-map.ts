import {FontInfo} from '@remotion/google-fonts';
import {getInfo as getRobotoFontInfo} from '@remotion/google-fonts/Roboto';

// 폰트 정보 동적 import 맵
// @remotion/google-fonts 패키지에서 직접 import하여 API 호출 없이 폰트 로드
export const getFontInfoByFamily = async (
	fontFamily: string,
): Promise<FontInfo> => {
	try {
		switch (fontFamily) {
			// ============ 한국어 폰트 - 고딕체 ============
			case 'Noto Sans KR':
				return (await import('@remotion/google-fonts/NotoSansKR')).getInfo();
			case 'Nanum Gothic':
				return (await import('@remotion/google-fonts/NanumGothic')).getInfo();
			case 'Gothic A1':
				return (await import('@remotion/google-fonts/GothicA1')).getInfo();
			case 'IBM Plex Sans KR':
				return (await import('@remotion/google-fonts/IBMPlexSansKR')).getInfo();
			case 'Gowun Dodum':
				return (await import('@remotion/google-fonts/GowunDodum')).getInfo();
			case 'Nanum Gothic Coding':
				return (await import('@remotion/google-fonts/NanumGothicCoding'))
					.getInfo();

			// ============ 한국어 폰트 - 명조체 ============
			case 'Noto Serif KR':
				return (await import('@remotion/google-fonts/NotoSerifKR')).getInfo();
			case 'Nanum Myeongjo':
				return (await import('@remotion/google-fonts/NanumMyeongjo')).getInfo();
			case 'Gowun Batang':
				return (await import('@remotion/google-fonts/GowunBatang')).getInfo();
			case 'Hahmlet':
				return (await import('@remotion/google-fonts/Hahmlet')).getInfo();
			case 'Song Myung':
				return (await import('@remotion/google-fonts/SongMyung')).getInfo();

			// ============ 한국어 폰트 - 손글씨체 ============
			case 'Nanum Pen Script':
				return (await import('@remotion/google-fonts/NanumPenScript'))
					.getInfo();
			case 'Nanum Brush Script':
				return (await import('@remotion/google-fonts/NanumBrushScript'))
					.getInfo();
			case 'Gamja Flower':
				return (await import('@remotion/google-fonts/GamjaFlower')).getInfo();
			case 'Hi Melody':
				return (await import('@remotion/google-fonts/HiMelody')).getInfo();
			case 'Poor Story':
				return (await import('@remotion/google-fonts/PoorStory')).getInfo();
			case 'East Sea Dokdo':
				return (await import('@remotion/google-fonts/EastSeaDokdo')).getInfo();
			case 'Yeon Sung':
				return (await import('@remotion/google-fonts/YeonSung')).getInfo();
			case 'Gaegu':
				return (await import('@remotion/google-fonts/Gaegu')).getInfo();

			// ============ 한국어 폰트 - 디자인/포인트체 ============
			case 'Black Han Sans':
				return (await import('@remotion/google-fonts/BlackHanSans')).getInfo();
			case 'Do Hyeon':
				return (await import('@remotion/google-fonts/DoHyeon')).getInfo();
			case 'Jua':
				return (await import('@remotion/google-fonts/Jua')).getInfo();
			case 'Sunflower':
				return (await import('@remotion/google-fonts/Sunflower')).getInfo();
			case 'Single Day':
				return (await import('@remotion/google-fonts/SingleDay')).getInfo();
			case 'Gasoek One':
				return (await import('@remotion/google-fonts/GasoekOne')).getInfo();
			case 'Gugi':
				return (await import('@remotion/google-fonts/Gugi')).getInfo();
			case 'Cute Font':
				return (await import('@remotion/google-fonts/CuteFont')).getInfo();
			case 'Stylish':
				return (await import('@remotion/google-fonts/Stylish')).getInfo();
			case 'Dokdo':
				return (await import('@remotion/google-fonts/Dokdo')).getInfo();
			case 'Dongle':
				return (await import('@remotion/google-fonts/Dongle')).getInfo();
			case 'Black And White Picture':
				return (await import('@remotion/google-fonts/BlackAndWhitePicture'))
					.getInfo();

			// ============ 주요 International 폰트 ============
			case 'Roboto':
				return (await import('@remotion/google-fonts/Roboto')).getInfo();
			case 'Open Sans':
				return (await import('@remotion/google-fonts/OpenSans')).getInfo();
			case 'Lato':
				return (await import('@remotion/google-fonts/Lato')).getInfo();
			case 'Montserrat':
				return (await import('@remotion/google-fonts/Montserrat')).getInfo();
			case 'Poppins':
				return (await import('@remotion/google-fonts/Poppins')).getInfo();
			case 'Inter':
				return (await import('@remotion/google-fonts/Inter')).getInfo();
			case 'Oswald':
				return (await import('@remotion/google-fonts/Oswald')).getInfo();
			case 'Raleway':
				return (await import('@remotion/google-fonts/Raleway')).getInfo();
			case 'Playfair Display':
				return (await import('@remotion/google-fonts/PlayfairDisplay'))
					.getInfo();
			case 'Merriweather':
				return (await import('@remotion/google-fonts/Merriweather')).getInfo();
			case 'Nunito':
				return (await import('@remotion/google-fonts/Nunito')).getInfo();
			case 'Nunito Sans':
				return (await import('@remotion/google-fonts/NunitoSans')).getInfo();
			case 'PT Sans':
				return (await import('@remotion/google-fonts/PTSans')).getInfo();
			case 'PT Serif':
				return (await import('@remotion/google-fonts/PTSerif')).getInfo();
			case 'Source Sans Pro':
			case 'Source Sans 3':
				return (await import('@remotion/google-fonts/SourceSans3')).getInfo();
			case 'Ubuntu':
				return (await import('@remotion/google-fonts/Ubuntu')).getInfo();
			case 'Work Sans':
				return (await import('@remotion/google-fonts/WorkSans')).getInfo();
			case 'Rubik':
				return (await import('@remotion/google-fonts/Rubik')).getInfo();
			case 'Quicksand':
				return (await import('@remotion/google-fonts/Quicksand')).getInfo();
			case 'Barlow':
				return (await import('@remotion/google-fonts/Barlow')).getInfo();
			case 'Mulish':
				return (await import('@remotion/google-fonts/Mulish')).getInfo();
			case 'Bebas Neue':
				return (await import('@remotion/google-fonts/BebasNeue')).getInfo();
			case 'Fira Sans':
				return (await import('@remotion/google-fonts/FiraSans')).getInfo();
			case 'Karla':
				return (await import('@remotion/google-fonts/Karla')).getInfo();
			case 'Libre Baskerville':
				return (await import('@remotion/google-fonts/LibreBaskerville'))
					.getInfo();
			case 'Lora':
				return (await import('@remotion/google-fonts/Lora')).getInfo();
			case 'Josefin Sans':
				return (await import('@remotion/google-fonts/JosefinSans')).getInfo();
			case 'Cabin':
				return (await import('@remotion/google-fonts/Cabin')).getInfo();
			case 'DM Sans':
				return (await import('@remotion/google-fonts/DMSans')).getInfo();
			case 'Archivo':
				return (await import('@remotion/google-fonts/Archivo')).getInfo();
			case 'Manrope':
				return (await import('@remotion/google-fonts/Manrope')).getInfo();
			case 'Space Grotesk':
				return (await import('@remotion/google-fonts/SpaceGrotesk')).getInfo();
			case 'Lexend':
				return (await import('@remotion/google-fonts/Lexend')).getInfo();
			case 'Plus Jakarta Sans':
				return (await import('@remotion/google-fonts/PlusJakartaSans'))
					.getInfo();
			case 'Outfit':
				return (await import('@remotion/google-fonts/Outfit')).getInfo();
			case 'Sora':
				return (await import('@remotion/google-fonts/Sora')).getInfo();
			case 'Libre Franklin':
				return (await import('@remotion/google-fonts/LibreFranklin'))
					.getInfo();
			case 'Crimson Text':
				return (await import('@remotion/google-fonts/CrimsonText')).getInfo();
			case 'Bitter':
				return (await import('@remotion/google-fonts/Bitter')).getInfo();
			case 'Cormorant Garamond':
				return (await import('@remotion/google-fonts/CormorantGaramond'))
					.getInfo();
			case 'EB Garamond':
				return (await import('@remotion/google-fonts/EBGaramond')).getInfo();
			case 'Dancing Script':
				return (await import('@remotion/google-fonts/DancingScript'))
					.getInfo();
			case 'Pacifico':
				return (await import('@remotion/google-fonts/Pacifico')).getInfo();
			case 'Caveat':
				return (await import('@remotion/google-fonts/Caveat')).getInfo();
			case 'Shadows Into Light':
				return (await import('@remotion/google-fonts/ShadowsIntoLight'))
					.getInfo();
			case 'Comfortaa':
				return (await import('@remotion/google-fonts/Comfortaa')).getInfo();
			case 'Abril Fatface':
				return (await import('@remotion/google-fonts/AbrilFatface')).getInfo();
			case 'Righteous':
				return (await import('@remotion/google-fonts/Righteous')).getInfo();
			case 'Anton':
				return (await import('@remotion/google-fonts/Anton')).getInfo();
			case 'Lobster':
				return (await import('@remotion/google-fonts/Lobster')).getInfo();
			case 'Permanent Marker':
				return (await import('@remotion/google-fonts/PermanentMarker'))
					.getInfo();
			case 'Satisfy':
				return (await import('@remotion/google-fonts/Satisfy')).getInfo();
			case 'Fredoka':
				return (await import('@remotion/google-fonts/Fredoka')).getInfo();
			case 'Titan One':
				return (await import('@remotion/google-fonts/TitanOne')).getInfo();

			default:
				// 커스텀 폰트인 경우 - 이미 @font-face로 로드됨
				// Remotion FontInfo 구조에 맞게 반환 (fonts 값은 URL 문자열)
				return {
					fontFamily,
					importName: fontFamily.replace(/\s+/g, ''),
					version: 'v1',
					url: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}`,
					unicodeRanges: {
						latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
					},
					fonts: {
						normal: {
							'400': {
								latin: '', // 커스텀 폰트는 이미 @font-face로 로드됨
							},
						},
					},
					subsets: ['latin'],
				} as FontInfo;
		}
	} catch (error) {
		console.error(`Failed to load font "${fontFamily}":`, error);
		return getRobotoFontInfo();
	}
};

// 지원되는 폰트 목록 (검증용)
export const SUPPORTED_FONT_FAMILIES = new Set([
	// 한국어 폰트
	'Noto Sans KR',
	'Nanum Gothic',
	'Gothic A1',
	'IBM Plex Sans KR',
	'Gowun Dodum',
	'Nanum Gothic Coding',
	'Noto Serif KR',
	'Nanum Myeongjo',
	'Gowun Batang',
	'Hahmlet',
	'Song Myung',
	'Nanum Pen Script',
	'Nanum Brush Script',
	'Gamja Flower',
	'Hi Melody',
	'Poor Story',
	'East Sea Dokdo',
	'Yeon Sung',
	'Gaegu',
	'Black Han Sans',
	'Do Hyeon',
	'Jua',
	'Sunflower',
	'Single Day',
	'Gasoek One',
	'Gugi',
	'Cute Font',
	'Stylish',
	'Dokdo',
	'Dongle',
	'Black And White Picture',
	// 주요 International 폰트
	'Roboto',
	'Open Sans',
	'Lato',
	'Montserrat',
	'Poppins',
	'Inter',
	'Oswald',
	'Raleway',
	'Playfair Display',
	'Merriweather',
	'Nunito',
	'Nunito Sans',
	'PT Sans',
	'PT Serif',
	'Source Sans 3',
	'Ubuntu',
	'Work Sans',
	'Rubik',
	'Quicksand',
	'Barlow',
	'Mulish',
	'Bebas Neue',
	'Fira Sans',
	'Karla',
	'Libre Baskerville',
	'Lora',
	'Josefin Sans',
	'Cabin',
	'DM Sans',
	'Archivo',
	'Manrope',
	'Space Grotesk',
	'Lexend',
	'Plus Jakarta Sans',
	'Outfit',
	'Sora',
	'Libre Franklin',
	'Crimson Text',
	'Bitter',
	'Cormorant Garamond',
	'EB Garamond',
	'Dancing Script',
	'Pacifico',
	'Caveat',
	'Shadows Into Light',
	'Comfortaa',
	'Abril Fatface',
	'Righteous',
	'Anton',
	'Lobster',
	'Permanent Marker',
	'Satisfy',
	'Fredoka',
	'Titan One',
]);
