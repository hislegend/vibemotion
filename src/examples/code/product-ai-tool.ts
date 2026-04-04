import { RemotionExample } from "./index";

export const productAiToolExample: RemotionExample = {
  id: "product-ai-tool",
  name: "프로덕트: AI 도구",
  description: "후킹→문제→솔루션→CTA AI 자동 생성 도구.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0a0a0a';
const CARD = '#18181b';
const ACCENT = '#a855f7';
const CYAN = '#22d3ee';
const TEXT = '#ffffff';
const DIM = '#a1a1aa';
const FONT = 'Inter, system-ui, sans-serif';

const HOOK_T1 = '3초 만에';
const HOOK_T2 = '완성';
const PROB_T = '시간 낭비';
const PROB_D = '디자인 시안 하나에 3시간, 수정 요청에 또 3시간';
const SOL_T = 'AI가 대신합니다';
const SOL_STEPS = [
  { label: '입력', desc: '텍스트 한 줄', icon: '✍️' },
  { label: '생성', desc: 'AI 자동 처리', icon: '🧠' },
  { label: '완성', desc: '다운로드', icon: '✅' },
];
const CTA_T = '무료로 체험하세요';
const CTA_URL = 'ai-tool.example.com';

const Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 10 } });
  const s2 = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 100, fontWeight: 900, opacity: s1, transform: \`translateY(\${interpolate(s1, [0,1], [40,0])}px)\` }}>{HOOK_T1}</div>
      <div style={{ fontSize: 120, fontWeight: 900, color: ACCENT, opacity: s2, transform: \`scale(\${interpolate(s2, [0,1], [0.5,1])})\` }}>{HOOK_T2}</div>
    </AbsoluteFill>
  );
};

const Problem = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div style={{ fontSize: 80, fontWeight: 900, opacity: s(0) }}>{PROB_T}</div>
      <div style={{ fontSize: 34, color: DIM, marginTop: 32, textAlign: 'center', lineHeight: 1.5, opacity: s(12) }}>{PROB_D}</div>
    </AbsoluteFill>
  );
};

const Solution = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '80px 60px', justifyContent: 'center' }}>
      <div style={{ fontSize: 56, fontWeight: 900, marginBottom: 60, opacity: spring({ frame, fps }) }}>{SOL_T}</div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        {SOL_STEPS.map((step, i) => {
          const sp = spring({ frame: Math.max(0, frame - 12 - i * 12), fps, config: { damping: 15 } });
          const arrowSp = spring({ frame: Math.max(0, frame - 18 - i * 12), fps });
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ backgroundColor: CARD, borderRadius: 24, padding: '40px 36px', textAlign: 'center', width: 280, borderTop: \`4px solid \${i === 2 ? CYAN : ACCENT}\`, opacity: sp, transform: \`translateY(\${interpolate(sp, [0,1], [20,0])}px)\` }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{step.icon}</div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{step.label}</div>
                <div style={{ fontSize: 22, color: DIM, marginTop: 8 }}>{step.desc}</div>
              </div>
              {i < 2 && <div style={{ fontSize: 40, color: ACCENT, opacity: arrowSp }}>→</div>}
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
      <div style={{ fontSize: 64, fontWeight: 900, opacity: s(0) }}>{CTA_T}</div>
      <div style={{ marginTop: 48, backgroundColor: ACCENT, padding: '24px 48px', borderRadius: 20, fontSize: 32, fontWeight: 800, opacity: s(15) }}>{CTA_URL}</div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={90}><Hook /></Series.Sequence>
      <Series.Sequence durationInFrames={120}><Problem /></Series.Sequence>
      <Series.Sequence durationInFrames={240}><Solution /></Series.Sequence>
      <Series.Sequence durationInFrames={150}><Cta /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 600,
  fps: 30,
  category: "Other",
};
