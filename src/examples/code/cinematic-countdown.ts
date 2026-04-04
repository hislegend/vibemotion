import { RemotionExample } from "./index";

export const cinematicCountdownExample: RemotionExample = {
  id: "cinematic-countdown",
  name: "시네마틱: 카운트다운",
  description: "3-2-1 글로우 숫자 + START 리빌. 8초.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0a0a0a';
const ACCENT = '#f59e0b';
const GLOW = '#f59e0b44';
const TEXT = '#ffffff';
const FONT = 'Inter, system-ui, sans-serif';

const NUMBERS = ['3', '2', '1'];
const REVEAL = 'START';

const CountNum = ({ num }: { num: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 8, stiffness: 150 } });
  const fadeOut = interpolate(frame, [50, 70], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glow = interpolate(frame, [0, 20, 50], [0, 1, 0.3], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', backgroundColor: GLOW, filter: 'blur(60px)', opacity: glow }} />
      <div style={{ fontSize: 280, fontWeight: 900, color: ACCENT, transform: \`scale(\${scale})\`, opacity: fadeOut, textShadow: \`0 0 80px \${ACCENT}\` }}>{num}</div>
    </AbsoluteFill>
  );
};

const Reveal = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 8, stiffness: 100 } });
  const glow = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', backgroundColor: GLOW, filter: 'blur(100px)', opacity: glow }} />
      <div style={{ fontSize: 160, fontWeight: 900, color: TEXT, letterSpacing: 24, transform: \`scale(\${scale})\`, textShadow: \`0 0 60px \${ACCENT}\` }}>{REVEAL}</div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      {NUMBERS.map((n, i) => (
        <Series.Sequence key={i} durationInFrames={60}><CountNum num={n} /></Series.Sequence>
      ))}
      <Series.Sequence durationInFrames={60}><Reveal /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 240,
  fps: 30,
  category: "Animation",
};
