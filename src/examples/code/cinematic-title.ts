import { RemotionExample } from "./index";

export const cinematicTitleExample: RemotionExample = {
  id: "cinematic-title",
  name: "시네마틱: 영화 타이틀",
  description: "대문자 + 그라데이션 배경 + 파티클 느낌. 10초.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0a0a0a';
const ACCENT = '#dc2626';
const GOLD = '#f59e0b';
const TEXT = '#ffffff';
const DIM = '#71717a';
const FONT = 'Inter, system-ui, sans-serif';

const TITLE = 'THE LAST';
const TITLE2 = 'FRONTIER';
const TAGLINE = 'Beyond the edge of everything';
const YEAR = '2026';

const TitleScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 12 } });
  const s2 = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 12 } });
  const lineW = interpolate(spring({ frame: Math.max(0, frame - 20), fps }), [0, 1], [0, 400]);
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', background: \`radial-gradient(ellipse at 50% 80%, \${ACCENT}15, transparent 60%)\` }} />
      <div style={{ fontSize: 32, letterSpacing: 20, color: DIM, opacity: spring({ frame: Math.max(0, frame - 25), fps }) }}>{YEAR}</div>
      <div style={{ fontSize: 120, fontWeight: 900, letterSpacing: 16, marginTop: 24, opacity: s1, transform: \`translateY(\${interpolate(s1, [0,1], [20,0])}px)\` }}>{TITLE}</div>
      <div style={{ width: lineW, height: 3, backgroundColor: GOLD, marginTop: 16, marginBottom: 16 }} />
      <div style={{ fontSize: 140, fontWeight: 900, letterSpacing: 20, color: ACCENT, opacity: s2, transform: \`translateY(\${interpolate(s2, [0,1], [20,0])}px)\` }}>{TITLE2}</div>
      <div style={{ fontSize: 28, letterSpacing: 8, color: DIM, marginTop: 48, opacity: spring({ frame: Math.max(0, frame - 30), fps }) }}>{TAGLINE}</div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={300}><TitleScene /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 300,
  fps: 30,
  category: "Text",
};
