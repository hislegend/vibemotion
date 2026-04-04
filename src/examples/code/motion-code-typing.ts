import { RemotionExample } from "./index";

export const motionCodeTypingExample: RemotionExample = {
  id: "motion-code-typing",
  name: "모션: 코드 타이핑",
  description: "좌측 설명 + 우측 코드 한줄씩 타이핑 효과.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0f172a';
const CARD = '#1e293b';
const ACCENT = '#38bdf8';
const GREEN = '#4ade80';
const PURPLE = '#a78bfa';
const TEXT = '#f8fafc';
const DIM = '#94a3b8';
const FONT = 'Inter, system-ui, sans-serif';
const MONO = 'JetBrains Mono, Fira Code, monospace';

const TITLE = 'One Command';
const DESC = 'Deploy your app in seconds';
const CODE_LINES = [
  { text: '$ npx deploy --prod', color: GREEN },
  { text: '', color: TEXT },
  { text: '  Building...  done in 2.3s', color: DIM },
  { text: '  Deploying... done in 1.1s', color: DIM },
  { text: '', color: TEXT },
  { text: '  Live at https://my-app.dev', color: ACCENT },
];

const SplitScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleS = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 60px' }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: TEXT, lineHeight: 1.2, opacity: titleS, transform: \`translateY(\${interpolate(titleS, [0,1], [30,0])}px)\` }}>{TITLE}</div>
        <div style={{ fontSize: 36, color: DIM, marginTop: 24, opacity: spring({ frame: Math.max(0, frame - 10), fps }) }}>{DESC}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
        <div style={{ backgroundColor: CARD, borderRadius: 20, padding: '40px 36px', width: '100%', fontFamily: MONO }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#22c55e' }} />
          </div>
          {CODE_LINES.map((line, i) => {
            const delay = 20 + i * 12;
            const charCount = Math.max(0, Math.floor((frame - delay) * 1.5));
            const visible = frame > delay;
            const displayText = line.text.slice(0, charCount);
            const showCursor = visible && charCount < line.text.length;
            return (
              <div key={i} style={{ fontSize: 22, color: line.color, height: 32, lineHeight: '32px', opacity: visible ? 1 : 0 }}>
                {displayText}{showCursor ? <span style={{ color: ACCENT }}>|</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={450}><SplitScene /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 450,
  fps: 30,
  category: "Other",
};
