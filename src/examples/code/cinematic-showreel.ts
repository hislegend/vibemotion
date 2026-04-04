import { RemotionExample } from "./index";

export const cinematicShowreelExample: RemotionExample = {
  id: "cinematic-showreel",
  name: "시네마틱: 쇼릴",
  description: "컬러 블록 4개 그리드 → 로고 리빌. 12초.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0a0a0a';
const TEXT = '#ffffff';
const DIM = '#71717a';
const FONT = 'Inter, system-ui, sans-serif';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e'];
const LABELS = ['Design', 'Motion', 'Brand', 'Code'];
const BRAND = 'STUDIO';
const TAGLINE = 'We create digital experiences';

const GridScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, padding: 8 }}>
      {COLORS.map((color, i) => {
        const s = spring({ frame: Math.max(0, frame - i * 8), fps, config: { damping: 12 } });
        return (
          <div key={i} style={{ backgroundColor: color, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s, transform: \`scale(\${interpolate(s, [0,1], [0.8,1])})\` }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: TEXT, letterSpacing: 4 }}>{LABELS[i]}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const LogoScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 10 } });
  const tagS = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 120, fontWeight: 900, letterSpacing: 20, opacity: s, transform: \`translateY(\${interpolate(s, [0,1], [30,0])}px)\` }}>{BRAND}</div>
      <div style={{ fontSize: 28, color: DIM, letterSpacing: 6, marginTop: 24, opacity: tagS }}>{TAGLINE}</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
        {COLORS.map((color, i) => {
          const dotS = spring({ frame: Math.max(0, frame - 25 - i * 5), fps });
          return <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: color, opacity: dotS }} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={180}><GridScene /></Series.Sequence>
      <Series.Sequence durationInFrames={180}><LogoScene /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 360,
  fps: 30,
  category: "Animation",
};
