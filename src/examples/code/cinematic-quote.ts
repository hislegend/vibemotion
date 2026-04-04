import { RemotionExample } from "./index";

export const cinematicQuoteExample: RemotionExample = {
  id: "cinematic-quote",
  name: "시네마틱: 명언 인용",
  description: "인용부호 + 명언 + 저자. 어두운 배경. 10초.",
  code: `import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate, Series } from 'remotion';

const BG = '#0a0a0a';
const ACCENT = '#d4a574';
const TEXT = '#f5f0eb';
const DIM = '#8a7e74';
const FONT = 'Inter, system-ui, sans-serif';

const QUOTE_L1 = 'The only way to do';
const QUOTE_L2 = 'great work is to love';
const QUOTE_L3 = 'what you do.';
const AUTHOR = 'Steve Jobs';
const SOURCE = 'Stanford Commencement, 2005';

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const quoteS = spring({ frame, fps, config: { damping: 18 } });
  const lineS = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 16 } });
  const authorS = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 20 } });
  const barW = interpolate(spring({ frame: Math.max(0, frame - 50), fps }), [0, 1], [0, 120]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center', padding: 120 }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', background: \`radial-gradient(ellipse at 30% 40%, \${ACCENT}10, transparent 50%)\` }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 200, color: ACCENT, opacity: 0.15, position: 'absolute', top: -80, left: -40, fontFamily: 'Georgia, serif' }}>"</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.4, opacity: lineS(0), transform: \`translateY(\${interpolate(lineS(0), [0,1], [20,0])}px)\` }}>{QUOTE_L1}</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.4, opacity: lineS(8), transform: \`translateY(\${interpolate(lineS(8), [0,1], [20,0])}px)\` }}>{QUOTE_L2}</div>
        <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.4, color: ACCENT, opacity: lineS(16), transform: \`translateY(\${interpolate(lineS(16), [0,1], [20,0])}px)\` }}>{QUOTE_L3}</div>
        <div style={{ width: barW, height: 3, backgroundColor: ACCENT, marginTop: 48, marginBottom: 32 }} />
        <div style={{ fontSize: 32, fontWeight: 700, opacity: authorS }}>{AUTHOR}</div>
        <div style={{ fontSize: 22, color: DIM, marginTop: 8, opacity: authorS }}>{SOURCE}</div>
      </div>
    </AbsoluteFill>
  );
};`,
  durationInFrames: 300,
  fps: 30,
  category: "Text",
};
