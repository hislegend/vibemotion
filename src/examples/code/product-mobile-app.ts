import { RemotionExample } from "./index";

export const productMobileAppExample: RemotionExample = {
  id: "product-mobile-app",
  name: "프로덕트: 모바일 앱",
  description: "후킹→문제→솔루션→CTA 모바일 앱 소개.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0f172a';
const CARD = '#1e293b';
const ACCENT = '#06b6d4';
const TEXT = '#f8fafc';
const DIM = '#94a3b8';
const FONT = 'Inter, system-ui, sans-serif';

const HOOK_T = '1초면 충분합니다';
const PROB_T = '복잡한 기존 방식';
const PROB_D = '로그인, 메뉴 탐색, 결제... 5단계를 거쳐야 했습니다';
const SOL_T = '원탭으로 끝';
const SOL_ITEMS = ['생체 인증 로그인', '원탭 결제', '자동 배송 추적'];
const CTA_T = '앱스토어에서 다운로드';

const Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 88, fontWeight: 900, textAlign: 'center', opacity: s, transform: \`scale(\${interpolate(s, [0,1], [0.8,1])})\` }}>{HOOK_T}</div>
    </AbsoluteFill>
  );
};

const Problem = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div style={{ fontSize: 72, fontWeight: 900, opacity: s(0) }}>{PROB_T}</div>
      <div style={{ fontSize: 34, color: DIM, marginTop: 32, textAlign: 'center', lineHeight: 1.5, opacity: s(12) }}>{PROB_D}</div>
    </AbsoluteFill>
  );
};

const Solution = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '80px 60px' }}>
      <div style={{ fontSize: 64, fontWeight: 900, marginBottom: 48, opacity: spring({ frame, fps }) }}>{SOL_T}</div>
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
  const s = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 60, fontWeight: 900, textAlign: 'center', opacity: s }}>{CTA_T}</div>
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
