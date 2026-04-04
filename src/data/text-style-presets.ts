import { TextStylePreset, CompositeTextTemplate } from '@/types/text-style-preset';

// 기본 제공 텍스트 스타일 프리셋
export const TEXT_STYLE_PRESETS: TextStylePreset[] = [
  {
    id: 'promo-yellow',
    name: '프로모 노란색',
    description: '밝은 노란색 강조 텍스트, 할인/특가 강조용',
    category: 'promo',
    fontSize: 72,
    fontFamily: 'Noto Sans KR',
    fontWeight: '800',
    color: '#FFEB3B',
    align: 'center',
    verticalAlign: 'middle',
    lineHeight: 1.2,
    letterSpacing: 0,
    strokeWidth: 3,
    strokeColor: 'rgba(0, 0, 0, 0.4)',
    shadowEnabled: true,
    shadowColor: 'rgba(0, 0, 0, 0.6)',
    shadowBlur: 8,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    backgroundColor: 'transparent',
    backgroundPadding: 0,
    fadeInDurationInSeconds: 0.3,
    fadeOutDurationInSeconds: 0.3,
    animationType: 'none',
    animationIntensity: 0.5,
    isBold: true,
    isItalic: false,
    isUnderline: false,
  },
  {
    id: 'classic-white',
    name: '클래식 화이트',
    description: '흰색 텍스트 + 검은 외곽선, 가독성 최고',
    category: 'info',
    fontSize: 56,
    fontFamily: 'Noto Sans KR',
    fontWeight: '700',
    color: '#FFFFFF',
    align: 'center',
    verticalAlign: 'middle',
    lineHeight: 1.2,
    letterSpacing: 0,
    strokeWidth: 4,
    strokeColor: '#000000',
    shadowEnabled: false,
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    backgroundColor: 'transparent',
    backgroundPadding: 0,
    fadeInDurationInSeconds: 0.2,
    fadeOutDurationInSeconds: 0.2,
    animationType: 'none',
    animationIntensity: 0.5,
    isBold: true,
    isItalic: false,
    isUnderline: false,
  },
  {
    id: 'cta-button',
    name: 'CTA 버튼',
    description: '클릭 유도 문구용, 배경 포함',
    category: 'cta',
    fontSize: 32,
    fontFamily: 'Noto Sans KR',
    fontWeight: '600',
    color: '#FFFFFF',
    align: 'center',
    verticalAlign: 'middle',
    lineHeight: 1.2,
    letterSpacing: 0,
    strokeWidth: 0,
    strokeColor: 'transparent',
    shadowEnabled: false,
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backgroundPadding: 16,
    fadeInDurationInSeconds: 0.2,
    fadeOutDurationInSeconds: 0.2,
    animationType: 'none',
    animationIntensity: 0.5,
    isBold: false,
    isItalic: false,
    isUnderline: false,
  },
];

// === 가이거 브랜드 프리셋 (이미지 기반) ===

// 서브 텍스트 프리셋: 연한 갈색, 작은 크기
const GAIGER_SUB_PRESET: TextStylePreset = {
  id: 'gaiger-sub',
  name: '가이거 서브',
  description: '서브 헤드라인용 연한 갈색',
  category: 'brand',
  fontSize: 32,
  fontFamily: 'Noto Sans KR',
  fontWeight: '400',
  color: '#8B7355',
  align: 'center',
  verticalAlign: 'middle',
  lineHeight: 1.2,
  letterSpacing: 0,
  strokeWidth: 0,
  strokeColor: 'transparent',
  shadowEnabled: false,
  shadowColor: 'transparent',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  backgroundColor: 'transparent',
  backgroundPadding: 0,
  fadeInDurationInSeconds: 0.2,
  fadeOutDurationInSeconds: 0.2,
  animationType: 'none',
  animationIntensity: 0.5,
  isBold: false,
  isItalic: false,
  isUnderline: false,
};

// 메인 텍스트 프리셋: 진한 갈색, 굵은 폰트
const GAIGER_MAIN_PRESET: TextStylePreset = {
  id: 'gaiger-main',
  name: '가이거 메인',
  description: '메인 헤드라인용 진한 갈색',
  category: 'brand',
  fontSize: 52,
  fontFamily: 'Noto Sans KR',
  fontWeight: '700',
  color: '#4A3728',
  align: 'center',
  verticalAlign: 'middle',
  lineHeight: 1.2,
  letterSpacing: 0,
  strokeWidth: 0,
  strokeColor: 'transparent',
  shadowEnabled: false,
  shadowColor: 'transparent',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  backgroundColor: 'transparent',
  backgroundPadding: 0,
  fadeInDurationInSeconds: 0.2,
  fadeOutDurationInSeconds: 0.2,
  animationType: 'none',
  animationIntensity: 0.5,
  isBold: true,
  isItalic: false,
  isUnderline: false,
};

// CTA 버튼 프리셋: 흰색 텍스트 + 반투명 검은 배경
const GAIGER_CTA_PRESET: TextStylePreset = {
  id: 'gaiger-cta',
  name: '가이거 CTA',
  description: '더 알아보기 버튼용',
  category: 'cta',
  fontSize: 24,
  fontFamily: 'Noto Sans KR',
  fontWeight: '500',
  color: '#FFFFFF',
  align: 'center',
  verticalAlign: 'middle',
  lineHeight: 1.2,
  letterSpacing: 0,
  strokeWidth: 0,
  strokeColor: 'transparent',
  shadowEnabled: false,
  shadowColor: 'transparent',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backgroundPadding: 14,
  fadeInDurationInSeconds: 0.2,
  fadeOutDurationInSeconds: 0.2,
  animationType: 'none',
  animationIntensity: 0.5,
  isBold: false,
  isItalic: false,
  isUnderline: false,
};

// 복합 템플릿 목록
export const COMPOSITE_TEMPLATES: CompositeTextTemplate[] = [
  {
    id: 'gaiger-promo',
    name: '가이거 프로모션',
    description: '서브텍스트 + 메인 헤드라인 + CTA 버튼',
    category: 'brand',
    layers: [
      {
        id: 'sub',
        role: 'sub',
        text: '오래 신어도 발이 편한',
        preset: GAIGER_SUB_PRESET,
        position: { top: 40, left: 50, width: 80 },
      },
      {
        id: 'main',
        role: 'main',
        text: '가이거 신년 균일 특가',
        preset: GAIGER_MAIN_PRESET,
        position: { top: 50, left: 50, width: 90 },
      },
      {
        id: 'cta',
        role: 'cta',
        text: '▼ 더 알아보기▼',
        preset: GAIGER_CTA_PRESET,
        position: { top: 65, left: 50, width: 40 },
      },
    ],
  },
];

// 카테고리별 색상
export const getCategoryColor = (category: TextStylePreset['category']): string => {
  switch (category) {
    case 'promo':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'cta':
      return 'bg-green-500/20 text-green-400';
    case 'info':
      return 'bg-blue-500/20 text-blue-400';
    case 'brand':
      return 'bg-purple-500/20 text-purple-400';
    case 'custom':
      return 'bg-neutral-500/20 text-neutral-400';
    default:
      return 'bg-neutral-500/20 text-neutral-400';
  }
};

// 카테고리 한글 이름
export const getCategoryLabel = (category: TextStylePreset['category']): string => {
  switch (category) {
    case 'promo':
      return '프로모션';
    case 'cta':
      return 'CTA';
    case 'info':
      return '정보';
    case 'brand':
      return '브랜드';
    case 'custom':
      return '커스텀';
    default:
      return category;
  }
};

// 단일 프리셋도 export
export { GAIGER_SUB_PRESET, GAIGER_MAIN_PRESET, GAIGER_CTA_PRESET };
