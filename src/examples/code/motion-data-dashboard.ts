import { RemotionExample } from "./index";

export const motionDataDashboardExample: RemotionExample = {
  id: "motion-data-dashboard",
  name: "모션: 데이터 대시보드",
  description: "CountUp 숫자 3개 + 바 차트 순차 등장.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0f172a';
const CARD = '#1e293b';
const ACCENT = '#38bdf8';
const GREEN = '#22c55e';
const AMBER = '#f59e0b';
const TEXT = '#f8fafc';
const DIM = '#94a3b8';
const FONT = 'Inter, system-ui, sans-serif';

const TITLE = 'Performance Dashboard';
const STATS = [
  { label: 'Monthly Active Users', value: 52847, suffix: '', color: ACCENT },
  { label: 'Revenue Growth', value: 34, suffix: '%', color: GREEN },
  { label: 'Customer Satisfaction', value: 98, suffix: '%', color: AMBER },
];
const BARS = [
  { label: 'Q1', value: 65, color: ACCENT },
  { label: 'Q2', value: 78, color: GREEN },
  { label: 'Q3', value: 92, color: AMBER },
  { label: 'Q4', value: 85, color: ACCENT },
];

const StatsScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '80px 60px' }}>
      <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 60, opacity: spring({ frame, fps }) }}>{TITLE}</div>
      <div style={{ display: 'flex', gap: 40 }}>
        {STATS.map((stat, i) => {
          const progress = spring({ frame: Math.max(0, frame - 15 - i * 10), fps, config: { damping: 25 } });
          const count = Math.round(stat.value * progress);
          return (
            <div key={i} style={{ flex: 1, backgroundColor: CARD, borderRadius: 24, padding: '48px 32px', borderTop: \`6px solid \${stat.color}\`, opacity: progress }}>
              <div style={{ fontSize: 72, fontWeight: 900, color: stat.color }}>{count.toLocaleString()}{stat.suffix}</div>
              <div style={{ fontSize: 24, color: DIM, marginTop: 16 }}>{stat.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ChartScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxH = 400;
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '80px 60px' }}>
      <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 60 }}>Quarterly Revenue</div>
      <div style={{ display: 'flex', gap: 48, alignItems: 'flex-end', height: maxH }}>
        {BARS.map((bar, i) => {
          const h = spring({ frame: Math.max(0, frame - 10 - i * 8), fps, config: { damping: 18 } });
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{bar.value}%</div>
              <div style={{ width: '100%', height: maxH * (bar.value / 100) * h, backgroundColor: bar.color, borderRadius: '12px 12px 0 0' }} />
              <div style={{ fontSize: 24, color: DIM }}>{bar.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={225}><StatsScene /></Series.Sequence>
      <Series.Sequence durationInFrames={225}><ChartScene /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 450,
  fps: 30,
  category: "Charts",
};
