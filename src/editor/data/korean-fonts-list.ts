// 한국어 폰트 목록 - 카테고리별 분류 포함
export type FontCategory = 'korean-gothic' | 'korean-serif' | 'korean-handwriting' | 'korean-display' | 'international';

export interface FontInfo {
  importName: string;
  fontFamily: string;
  displayName: string; // 한글 표시명
  previewUrl: string;
  category: FontCategory;
  isCustom?: boolean;
}

export const KOREAN_FONTS_LIST: FontInfo[] = [
  // 고딕체 (Sans-serif)
  {
    importName: 'NotoSansKR',
    fontFamily: 'Noto Sans KR',
    displayName: '노토 산스',
    previewUrl: 'Noto+Sans+KR',
    category: 'korean-gothic',
  },
  {
    importName: 'NanumGothic',
    fontFamily: 'Nanum Gothic',
    displayName: '나눔고딕',
    previewUrl: 'Nanum+Gothic',
    category: 'korean-gothic',
  },
  {
    importName: 'GothicA1',
    fontFamily: 'Gothic A1',
    displayName: '고딕 A1',
    previewUrl: 'Gothic+A1',
    category: 'korean-gothic',
  },
  {
    importName: 'IBMPlexSansKR',
    fontFamily: 'IBM Plex Sans KR',
    displayName: 'IBM 플렉스 산스',
    previewUrl: 'IBM+Plex+Sans+KR',
    category: 'korean-gothic',
  },
  {
    importName: 'GowunDodum',
    fontFamily: 'Gowun Dodum',
    displayName: '고운돋움',
    previewUrl: 'Gowun+Dodum',
    category: 'korean-gothic',
  },
  // 명조체 (Serif)
  {
    importName: 'NotoSerifKR',
    fontFamily: 'Noto Serif KR',
    displayName: '노토 세리프',
    previewUrl: 'Noto+Serif+KR',
    category: 'korean-serif',
  },
  {
    importName: 'NanumMyeongjo',
    fontFamily: 'Nanum Myeongjo',
    displayName: '나눔명조',
    previewUrl: 'Nanum+Myeongjo',
    category: 'korean-serif',
  },
  {
    importName: 'GowunBatang',
    fontFamily: 'Gowun Batang',
    displayName: '고운바탕',
    previewUrl: 'Gowun+Batang',
    category: 'korean-serif',
  },
  {
    importName: 'Hahmlet',
    fontFamily: 'Hahmlet',
    displayName: '함렛',
    previewUrl: 'Hahmlet',
    category: 'korean-serif',
  },
  {
    importName: 'SongMyung',
    fontFamily: 'Song Myung',
    displayName: '송명',
    previewUrl: 'Song+Myung',
    category: 'korean-serif',
  },
  // 손글씨체 (Handwriting)
  {
    importName: 'NanumPenScript',
    fontFamily: 'Nanum Pen Script',
    displayName: '나눔펜스크립트',
    previewUrl: 'Nanum+Pen+Script',
    category: 'korean-handwriting',
  },
  {
    importName: 'GamjaFlower',
    fontFamily: 'Gamja Flower',
    displayName: '감자꽃',
    previewUrl: 'Gamja+Flower',
    category: 'korean-handwriting',
  },
  {
    importName: 'HiMelody',
    fontFamily: 'Hi Melody',
    displayName: '하이멜로디',
    previewUrl: 'Hi+Melody',
    category: 'korean-handwriting',
  },
  {
    importName: 'PoorStory',
    fontFamily: 'Poor Story',
    displayName: '푸어스토리',
    previewUrl: 'Poor+Story',
    category: 'korean-handwriting',
  },
  {
    importName: 'EastSeaDokdo',
    fontFamily: 'East Sea Dokdo',
    displayName: '동해독도',
    previewUrl: 'East+Sea+Dokdo',
    category: 'korean-handwriting',
  },
  {
    importName: 'YeonSung',
    fontFamily: 'Yeon Sung',
    displayName: '연성',
    previewUrl: 'Yeon+Sung',
    category: 'korean-handwriting',
  },
  // 포인트/디자인체 (Display) - 배민 스타일 폰트 포함
  {
    importName: 'BlackHanSans',
    fontFamily: 'Black Han Sans',
    displayName: '블랙한산스',
    previewUrl: 'Black+Han+Sans',
    category: 'korean-display',
  },
  {
    importName: 'DoHyeon',
    fontFamily: 'Do Hyeon',
    displayName: '도현',
    previewUrl: 'Do+Hyeon',
    category: 'korean-display',
  },
  {
    importName: 'JuaRegular',
    fontFamily: 'Jua',
    displayName: '주아',
    previewUrl: 'Jua',
    category: 'korean-display',
  },
  {
    importName: 'Sunflower',
    fontFamily: 'Sunflower',
    displayName: '해바라기',
    previewUrl: 'Sunflower',
    category: 'korean-display',
  },
  {
    importName: 'SingleDay',
    fontFamily: 'Single Day',
    displayName: '싱글데이',
    previewUrl: 'Single+Day',
    category: 'korean-display',
  },
  {
    importName: 'GasoekOne',
    fontFamily: 'Gasoek One',
    displayName: '가석원',
    previewUrl: 'Gasoek+One',
    category: 'korean-display',
  },
  {
    importName: 'Gugi',
    fontFamily: 'Gugi',
    displayName: '구기',
    previewUrl: 'Gugi',
    category: 'korean-display',
  },
  {
    importName: 'CuteFont',
    fontFamily: 'Cute Font',
    displayName: '귀여운폰트',
    previewUrl: 'Cute+Font',
    category: 'korean-display',
  },
  {
    importName: 'Stylish',
    fontFamily: 'Stylish',
    displayName: '스타일리쉬',
    previewUrl: 'Stylish',
    category: 'korean-display',
  },
  // 배민 관련 추가 폰트
  {
    importName: 'NanumBrushScript',
    fontFamily: 'Nanum Brush Script',
    displayName: '나눔손글씨 붓',
    previewUrl: 'Nanum+Brush+Script',
    category: 'korean-handwriting',
  },
  {
    importName: 'Dokdo',
    fontFamily: 'Dokdo',
    displayName: '독도',
    previewUrl: 'Dokdo',
    category: 'korean-display',
  },
  {
    importName: 'GaeguRegular',
    fontFamily: 'Gaegu',
    displayName: '개구',
    previewUrl: 'Gaegu',
    category: 'korean-handwriting',
  },
  {
    importName: 'NanumGothicCoding',
    fontFamily: 'Nanum Gothic Coding',
    displayName: '나눔고딕코딩',
    previewUrl: 'Nanum+Gothic+Coding',
    category: 'korean-gothic',
  },
  {
    importName: 'Dongle',
    fontFamily: 'Dongle',
    displayName: '동글',
    previewUrl: 'Dongle',
    category: 'korean-display',
  },
  {
    importName: 'BM_HANNA',
    fontFamily: 'Black And White Picture',
    displayName: '흑백사진',
    previewUrl: 'Black+And+White+Picture',
    category: 'korean-display',
  },
];

// 한국 폰트 fontFamily 목록 (빠른 검색용)
export const KOREAN_FONT_FAMILIES = new Set(KOREAN_FONTS_LIST.map(f => f.fontFamily));

// Google Fonts 목록에 한글 폰트 병합
export function getExtendedFontsList(baseFonts: any[]) {
  const existingFamilies = new Set(baseFonts.map(f => f.fontFamily));
  const newFonts = KOREAN_FONTS_LIST.filter(f => !existingFamilies.has(f.fontFamily));
  
  // 한국 폰트를 먼저, 그 다음 해외 폰트
  return [...newFonts, ...baseFonts];
}
