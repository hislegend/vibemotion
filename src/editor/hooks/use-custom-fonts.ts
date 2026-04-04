import { useState, useEffect } from 'react';
// [STUB] supabase import removed

export interface CustomFont {
  id: string;
  font_family: string;
  display_name: string;
  font_url: string;
  font_format: string;
  category: string | null;
}

// 글로벌 캐시 - 한번 로드된 폰트는 다시 로드하지 않음
const loadedCustomFonts = new Set<string>();
let cachedFontList: CustomFont[] | null = null;

export const useCustomFonts = () => {
  const [customFonts, setCustomFonts] = useState<CustomFont[]>(cachedFontList || []);
  const [loaded, setLoaded] = useState(cachedFontList !== null);

  useEffect(() => {
    // 이미 캐시된 경우 스킵
    if (cachedFontList !== null) {
      setLoaded(true);
      return;
    }

    const loadCustomFonts = async () => {
      try {
        // DB에서 커스텀 폰트 목록 조회
        const { data, error } = await supabase
          .from('custom_fonts')
          .select('*')
          .order('display_name');

        if (error) {
          console.error('Failed to load custom fonts:', error);
          setLoaded(true);
          return;
        }

        if (data && data.length > 0) {
          // 각 폰트를 @font-face로 로드
          await Promise.all(
            data.map(async (font) => {
              if (loadedCustomFonts.has(font.font_family)) {
                return; // 이미 로드됨
              }

              try {
                const fontFace = new FontFace(
                  font.font_family,
                  `url(${font.font_url})`,
                  { display: 'swap' }
                );
                await fontFace.load();
                document.fonts.add(fontFace);
                loadedCustomFonts.add(font.font_family);
              } catch (err) {
                console.error(`Failed to load font ${font.font_family}:`, err);
              }
            })
          );

          cachedFontList = data;
          setCustomFonts(data);
        } else {
          cachedFontList = [];
        }
      } catch (err) {
        console.error('Error in loadCustomFonts:', err);
      } finally {
        setLoaded(true);
      }
    };

    loadCustomFonts();
  }, []);

  return { customFonts, loaded };
};

// 캐시 리프레시 (관리자 페이지에서 폰트 추가/삭제 시 호출)
export const refreshCustomFontsCache = () => {
  cachedFontList = null;
  loadedCustomFonts.clear();
};
