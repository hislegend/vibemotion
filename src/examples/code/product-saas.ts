import { RemotionExample } from "./index";

export const productSaasExample: RemotionExample = {
  id: "product-saas",
  name: "프로덕트: SaaS 대시보드",
  description: "후킹→문제→솔루션→CTA 4단계 SaaS 소개.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0a0a0a';
const CARD = '#1a1a1a';
const ACCENT = '#6366f1';
const GREEN = '#22c55e';
const TEXT = '#ffffff';
const DIM = '#a1a1aa';
const FONT = 'Inter, system-ui, sans-serif';

const HOOK_NUM = '340%';
const HOOK_LABEL = '생산성 향상';
const PROBLEM_T = '아직도 수작업?';
const PROBLEM_D = '반복 업무에 하루 3시간을 낭비하고 있습니다';
const SOL_T = '자동화의 힘';
const SOL_ITEMS = ['원클릭 리포트 생성', 'AI 데이터 분석', '실시간 알림 시스템'];
const CTA_T = '지금 무료로 시작하세요';
const CTA_URL = 'app.example.com';

const Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 25 } });
  const count = Math.round(340 * s);
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 180, fontWeight: 900, color: ACCENT }}>{count}%</div>
      <div style={{ fontSize: 48, color: DIM, marginTop: 16, opacity: spring({ frame: Math.max(0, frame - 20), fps }) }}>{HOOK_LABEL}</div>
    </AbsoluteFill>
  );
};

const Problem = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
      <div style={{ fontSize: 80, fontWeight: 900, opacity: s(0), transform: \`translateY(\${interpolate(s(0), [0,1], [30,0])}px)\` }}>{PROBLEM_T}</div>
      <div style={{ fontSize: 36, color: DIM, marginTop: 32, textAlign: 'center', maxWidth: 800, lineHeight: 1.5, opacity: s(15) }}>{PROBLEM_D}</div>
    </AbsoluteFill>
  );
};

const Solution = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleS = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '80px 60px' }}>
      <div style={{ fontSize: 64, fontWeight: 900, marginBottom: 60, opacity: titleS }}>{SOL_T}</div>
      <div style={{ display: 'flex', gap: 32, flex: 1, alignItems: 'center' }}>
        {SOL_ITEMS.map((item, i) => {
          const s = spring({ frame: Math.max(0, frame - 15 - i * 10), fps, config: { damping: 15 } });
          return (
            <div key={i} style={{ flex: 1, backgroundColor: CARD, borderRadius: 24, padding: '48px 32px', borderTop: \`4px solid \${ACCENT}\`, opacity: s, transform: \`translateY(\${interpolate(s, [0,1], [20,0])}px)\` }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: GREEN, marginBottom: 16 }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{item}</div>
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
      <div style={{ fontSize: 64, fontWeight: 900, textAlign: 'center', opacity: s(0) }}>{CTA_T}</div>
      <div style={{ marginTop: 48, backgroundColor: ACCENT, padding: '28px 56px', borderRadius: 20, fontSize: 36, fontWeight: 800, opacity: s(15) }}>{CTA_URL}</div>
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
