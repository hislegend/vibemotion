import { RemotionExample } from "./index";

export const productEducationExample: RemotionExample = {
  id: "product-education",
  name: "프로덕트: 교육 플랫폼",
  description: "후킹→문제→솔루션→CTA 교육 서비스.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0f172a';
const CARD = '#1e293b';
const ACCENT = '#8b5cf6';
const GREEN = '#22c55e';
const TEXT = '#f8fafc';
const DIM = '#94a3b8';
const FONT = 'Inter, system-ui, sans-serif';

const HOOK_NUM = '12,847';
const HOOK_LABEL = '명이 이미 수강 중';
const PROB_T = '혼자 공부의 한계';
const PROB_D = '유튜브 강의를 떠돌며 체계 없이 시간만 낭비하고 있다면';
const SOL_T = 'AI 튜터와 함께';
const SOL_ITEMS = ['맞춤 커리큘럼 생성', '실시간 질의응답', '진도율 자동 추적'];
const CTA_T = '첫 강의 무료 체험';

const Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 25 } });
  const count = Math.round(12847 * s).toLocaleString();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 140, fontWeight: 900, color: ACCENT }}>{count}</div>
      <div style={{ fontSize: 44, color: DIM, marginTop: 16, opacity: spring({ frame: Math.max(0, frame - 20), fps }) }}>{HOOK_LABEL}</div>
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
      <div style={{ fontSize: 60, fontWeight: 900, marginBottom: 48, opacity: spring({ frame, fps }) }}>{SOL_T}</div>
      <div style={{ display: 'flex', gap: 32 }}>
        {SOL_ITEMS.map((item, i) => {
          const sp = spring({ frame: Math.max(0, frame - 12 - i * 10), fps, config: { damping: 15 } });
          return (
            <div key={i} style={{ flex: 1, backgroundColor: CARD, borderRadius: 24, padding: '48px 32px', borderTop: \`4px solid \${ACCENT}\`, opacity: sp, transform: \`translateY(\${interpolate(sp, [0,1], [20,0])}px)\` }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: GREEN, marginBottom: 16 }}>{String(i+1).padStart(2,'0')}</div>
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
      <div style={{ fontSize: 64, fontWeight: 900, opacity: s }}>{CTA_T}</div>
      <div style={{ marginTop: 48, backgroundColor: ACCENT, padding: '24px 48px', borderRadius: 20, fontSize: 32, fontWeight: 800, opacity: spring({ frame: Math.max(0, frame - 10), fps }) }}>learn.example.com</div>
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
