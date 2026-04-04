import { RemotionExample } from "./index";

export const productEcommerceExample: RemotionExample = {
  id: "product-ecommerce",
  name: "프로덕트: 이커머스",
  description: "후킹→문제→솔루션→CTA 이커머스 플랫폼.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0a0a0a';
const CARD = '#1a1a1a';
const ACCENT = '#f97316';
const TEXT = '#ffffff';
const DIM = '#a1a1aa';
const FONT = 'Inter, system-ui, sans-serif';

const HOOK_NUM = '70';
const HOOK_UNIT = '%';
const HOOK_LABEL = '할인 상품을 놓치고 계십니다';
const PROB_T = '비교의 피로';
const PROB_D = '수십 개 사이트를 돌아다니며 가격 비교하는 데 지쳤나요?';
const SOL_T = 'AI가 찾아드립니다';
const SOL_ITEMS = ['실시간 최저가 알림', 'AI 맞춤 추천', '원클릭 비교'];
const CTA_T = '스마트 쇼핑 시작하기';

const Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 25 } });
  const count = Math.round(70 * s);
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <div style={{ fontSize: 200, fontWeight: 900, color: ACCENT }}>{count}</div>
        <div style={{ fontSize: 100, fontWeight: 900, color: ACCENT }}>{HOOK_UNIT}</div>
      </div>
      <div style={{ fontSize: 40, color: DIM, marginTop: 16, opacity: spring({ frame: Math.max(0, frame - 20), fps }) }}>{HOOK_LABEL}</div>
    </AbsoluteFill>
  );
};

const Problem = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div style={{ fontSize: 76, fontWeight: 900, opacity: s(0) }}>{PROB_T}</div>
      <div style={{ fontSize: 34, color: DIM, marginTop: 32, textAlign: 'center', lineHeight: 1.5, opacity: s(12) }}>{PROB_D}</div>
    </AbsoluteFill>
  );
};

const Solution = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '80px 60px' }}>
      <div style={{ fontSize: 60, fontWeight: 900, marginBottom: 48, opacity: spring({ frame, fps }) }}>{SOL_T}</div>
      <div style={{ display: 'flex', gap: 32 }}>
        {SOL_ITEMS.map((item, i) => {
          const sp = spring({ frame: Math.max(0, frame - 12 - i * 10), fps, config: { damping: 15 } });
          return (
            <div key={i} style={{ flex: 1, backgroundColor: CARD, borderRadius: 24, padding: '48px 32px', borderTop: \`4px solid \${ACCENT}\`, opacity: sp, transform: \`translateY(\${interpolate(sp, [0,1], [20,0])}px)\` }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: ACCENT, marginBottom: 16 }}>{String(i+1).padStart(2,'0')}</div>
              <div style={{ fontSize: 30, fontWeight: 700 }}>{item}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Cta = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 60, fontWeight: 900, opacity: s(0) }}>{CTA_T}</div>
      <div style={{ marginTop: 48, backgroundColor: ACCENT, padding: '24px 48px', borderRadius: 20, fontSize: 32, fontWeight: 800, opacity: s(15) }}>shop.example.com</div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={90}><Hook /></Series.Sequence>
      <Series.Sequence durationInFrames={150}><Problem /></Series.Sequence>
      <Series.Sequence durationInFrames={210}><Solution /></Series.Sequence>
      <Series.Sequence durationInFrames={150}><Cta /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 600,
  fps: 30,
  category: "Other",
};
