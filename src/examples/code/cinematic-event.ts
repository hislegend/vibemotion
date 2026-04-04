import { RemotionExample } from "./index";

export const cinematicEventExample: RemotionExample = {
  id: "cinematic-event",
  name: "시네마틱: 이벤트 초대장",
  description: "날짜 + 장소 + CTA 이벤트 초대. 15초.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0f0720';
const CARD = '#1e1b4b';
const ACCENT = '#c084fc';
const GOLD = '#fbbf24';
const TEXT = '#f8fafc';
const DIM = '#94a3b8';
const FONT = 'Inter, system-ui, sans-serif';

const EVENT_NAME = 'AI SUMMIT 2026';
const DATE = '2026. 06. 15';
const TIME = 'PM 2:00 - 6:00';
const LOCATION = 'Seoul COEX Hall A';
const SPEAKERS = ['Keynote: AI의 미래', 'Panel: 스타트업 생존기', 'Workshop: 프롬프트 마스터'];
const CTA_T = '참가 신청하기';
const CTA_URL = 'aisummit2026.kr';

const TitleScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', background: \`radial-gradient(ellipse at 50% 50%, \${ACCENT}15, transparent 60%)\` }} />
      <div style={{ fontSize: 28, letterSpacing: 16, color: GOLD, opacity: s(0) }}>{DATE}</div>
      <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: 8, marginTop: 24, opacity: s(8), transform: \`scale(\${interpolate(s(8), [0,1], [0.9,1])})\` }}>{EVENT_NAME}</div>
      <div style={{ fontSize: 32, color: DIM, marginTop: 24, opacity: s(18) }}>{TIME}</div>
      <div style={{ fontSize: 36, color: ACCENT, marginTop: 8, fontWeight: 600, opacity: s(22) }}>{LOCATION}</div>
    </AbsoluteFill>
  );
};

const DetailScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '80px 60px', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {SPEAKERS.map((sp, i) => {
          const s = spring({ frame: Math.max(0, frame - 8 - i * 10), fps, config: { damping: 15 } });
          return (
            <div key={i} style={{ backgroundColor: CARD, borderRadius: 20, padding: '36px 40px', borderLeft: \`6px solid \${ACCENT}\`, opacity: s, transform: \`translateX(\${interpolate(s, [0,1], [-30,0])}px)\` }}>
              <div style={{ fontSize: 34, fontWeight: 700 }}>{sp}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const CtaScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 60, fontWeight: 900, opacity: s(0) }}>{CTA_T}</div>
      <div style={{ marginTop: 40, backgroundColor: ACCENT, padding: '24px 56px', borderRadius: 20, fontSize: 36, fontWeight: 800, color: BG, opacity: s(12) }}>{CTA_URL}</div>
      <div style={{ marginTop: 32, fontSize: 28, color: DIM, opacity: s(20) }}>{DATE} | {LOCATION}</div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={150}><TitleScene /></Series.Sequence>
      <Series.Sequence durationInFrames={150}><DetailScene /></Series.Sequence>
      <Series.Sequence durationInFrames={150}><CtaScene /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 450,
  fps: 30,
  category: "Other",
};
