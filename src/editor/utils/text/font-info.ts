// render를 위한 font 정보를 수집
// editor에서는 사용되지 않으며, font info는 backend endpoint에서 동적으로 로드됩니다

import {FontInfo} from '@remotion/google-fonts';
import {createContext} from 'react';

export type FontInfosContextType = Record<string, FontInfo>;

export const FontInfoContext = createContext<Record<string, FontInfo>>({});
