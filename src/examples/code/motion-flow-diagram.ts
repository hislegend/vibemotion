import { RemotionExample } from "./index";

export const motionFlowDiagramExample: RemotionExample = {
  id: "motion-flow-diagram",
  name: "모션: 플로우 다이어그램",
  description: "4단계 프로세스 노드+화살표 순차 등장.",
  code: `import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0f172a';
const CARD = '#1e293b';
const ACCENT = '#6366f1';
const GREEN = '#22c55e';
const TEXT = '#f8fafc';
const DIM = '#94a3b8';
const FONT = 'Inter, system-ui, sans-serif';

const TITLE = 'How It Works';
const STEPS = [
  { num: '01', title: 'Upload', desc: 'Drop your files', icon: '📁' },
  { num: '02', title: 'Process', desc: 'AI analyzes content', icon: '🧠' },
  { num: '03', title: 'Review', desc: 'Check the results', icon: '✅' },
  { num: '04', title: 'Export', desc: 'Download & share', icon: '🚀' },
];

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const titleS = spring({ frame, fps, config: { damping: 14 } });
  const stepWidth = (width - 160) / 4;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '80px 60px' }}>
      <div style={{ fontSize: 64, fontWeight: 900, textAlign: 'center', marginBottom: 80, opacity: titleS }}>{TITLE}</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0 }}>
        {STEPS.map((step, i) => {
          const delay = 20 + i * 15;
          const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 15 } });
          const y = interpolate(s, [0, 1], [40, 0]);
          const arrowS = spring({ frame: Math.max(0, frame - delay - 8), fps, config: { damping: 18 } });
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: stepWidth - 40, opacity: s, transform: \`translateY(\${y}px)\`, textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>{step.icon}</div>
                <div style={{ backgroundColor: CARD, borderRadius: 20, padding: '32px 24px', borderTop: \`4px solid \${i === STEPS.length - 1 ? GREEN : ACCENT}\` }}>
                  <div style={{ fontSize: 20, color: ACCENT, fontWeight: 800, marginBottom: 8 }}>{step.num}</div>
                  <div style={{ fontSize: 32, fontWeight: 800 }}>{step.title}</div>
                  <div style={{ fontSize: 20, color: DIM, marginTop: 8 }}>{step.desc}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ fontSize: 36, color: ACCENT, opacity: arrowS, margin: '0 8px', paddingTop: 60 }}>→</div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};`,
  durationInFrames: 450,
  fps: 30,
  category: "Other",
};
