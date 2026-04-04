import { RemotionExample } from "./index";

export const motionBrandIntroExample: RemotionExample = {
  id: "motion-brand-intro",
  name: "모션: 브랜드 인트로",
  description: "로고 spring 등장 + 슬로건 fadeIn. 다크 배경.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0a0a0a';
const ACCENT = '#4f46e5';
const GLOW = '#4f46e566';
const TEXT = '#ffffff';
const DIM = '#94a3b8';
const FONT = 'Inter, system-ui, sans-serif';

const BRAND = 'CRABS';
const SLOGAN = 'Build faster, ship smarter';
const URL_TEXT = 'crabs.studio';

const LogoScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 8, stiffness: 120 } });
  const glow = interpolate(frame, [0, 30, 60], [0, 1, 0.6], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', backgroundColor: GLOW, filter: 'blur(80px)', opacity: glow }} />
      <div style={{ fontSize: 140, fontWeight: 900, color: TEXT, letterSpacing: 16, transform: \`scale(\${scale})\`, textShadow: \`0 0 60px \${ACCENT}\` }}>{BRAND}</div>
    </AbsoluteFill>
  );
};

const SloganScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({ frame, fps, config: { damping: 20 } });
  const y = interpolate(opacity, [0, 1], [30, 0]);
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 120, fontWeight: 900, color: TEXT, letterSpacing: 12 }}>{BRAND}</div>
      <div style={{ fontSize: 48, color: DIM, marginTop: 32, fontWeight: 500, opacity, transform: \`translateY(\${y}px)\` }}>{SLOGAN}</div>
      <div style={{ marginTop: 40, padding: '12px 32px', backgroundColor: '#ffffff1a', borderRadius: 99, fontSize: 28, color: ACCENT, fontWeight: 700, opacity: spring({ frame: Math.max(0, frame - 15), fps }) }}>{URL_TEXT}</div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={150}><LogoScene /></Series.Sequence>
      <Series.Sequence durationInFrames={150}><SloganScene /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 300,
  fps: 30,
  category: "Animation",
};
