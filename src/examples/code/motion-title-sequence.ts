import { RemotionExample } from "./index";

export const motionTitleSequenceExample: RemotionExample = {
  id: "motion-title-sequence",
  name: "모션: 타이틀 시퀀스",
  description: "키네틱 타이포 — 큰 글자 spring + blur 등장.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#000000';
const ACCENT = '#f59e0b';
const TEXT = '#ffffff';
const DIM = '#a1a1aa';
const FONT = 'Inter, system-ui, sans-serif';

const LINE_1 = 'CREATIVITY';
const LINE_2 = 'MEETS';
const LINE_3 = 'TECHNOLOGY';
const SUB = 'Where imagination becomes reality';

const TitleReveal = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = [
    { text: LINE_1, delay: 0, color: TEXT, size: 120 },
    { text: LINE_2, delay: 10, color: DIM, size: 80 },
    { text: LINE_3, delay: 20, color: ACCENT, size: 120 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, alignItems: 'center', justifyContent: 'center' }}>
      {lines.map((line, i) => {
        const s = spring({ frame: Math.max(0, frame - line.delay), fps, config: { damping: 10 } });
        const blur = interpolate(s, [0, 1], [20, 0]);
        const y = interpolate(s, [0, 1], [60, 0]);
        return (
          <div key={i} style={{ fontSize: line.size, fontWeight: 900, color: line.color, letterSpacing: line.size > 100 ? 12 : 6, opacity: s, transform: \`translateY(\${y}px)\`, filter: \`blur(\${blur}px)\`, lineHeight: 1.1 }}>{line.text}</div>
        );
      })}
    </AbsoluteFill>
  );
};

const SubReveal = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({ frame, fps, config: { damping: 20 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 120, fontWeight: 900, color: ACCENT, letterSpacing: 12, marginBottom: 40 }}>{LINE_3}</div>
      <div style={{ fontSize: 40, color: DIM, fontWeight: 500, opacity, letterSpacing: 4 }}>{SUB}</div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={150}><TitleReveal /></Series.Sequence>
      <Series.Sequence durationInFrames={150}><SubReveal /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 300,
  fps: 30,
  category: "Text",
};
