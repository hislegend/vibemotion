import { RemotionExample } from "./index";

export const cardnewsNeonExample: RemotionExample = {
  id: "cardnews-neon",
  name: "카드뉴스: 네온 그라데이션",
  description: "AI 스타트업 생존 전략. 보라빛 네온 테마.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0F0720';
const CARD = '#1E1B4B';
const ACCENT = '#A855F7';
const ACCENT_BG = '#A855F71A';
const TEXT = '#F8FAFC';
const DIM = '#94A3B8';
const FONT = 'Inter, system-ui, sans-serif';

const BADGE = 'AI STARTUP';
const T1 = 'AI 스타트업';
const T2 = '생존 전략';
const SUB = '살아남는 팀의 공통점';

const ITEMS = [
  { no: '01', title: '빠른 MVP 출시', desc: '완벽보다 속도. 2주 안에 첫 버전' },
  { no: '02', title: 'PMF 검증', desc: '만들기 전에 팔 수 있는지 확인' },
  { no: '03', title: '현금 흐름 관리', desc: '런웨이 18개월 이상 확보' },
];

const QUOTE_L1 = '실패는 옵션이 아니라';
const QUOTE_L2 = '과정이다';
const QUOTE_AUTHOR = '실리콘밸리 격언';

const CTA = '다음 유니콘은 당신입니다';

const Cover = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '100px 48px' }}>
      <div style={{ padding: '14px 28px', backgroundColor: ACCENT, borderRadius: 99, fontSize: 26, fontWeight: 800, color: BG, width: 'max-content', opacity: s(0) }}>{BADGE}</div>
      <div style={{ fontSize: 96, fontWeight: 900, marginTop: 60, lineHeight: 1.2, opacity: s(5), transform: \`translateY(\${interpolate(s(5), [0,1], [40,0])}px)\` }}>
        <div>{T1}</div>
        <div style={{ color: ACCENT }}>{T2}</div>
      </div>
      <div style={{ marginTop: 'auto', marginBottom: 60, backgroundColor: CARD, padding: '40px 36px', borderRadius: 20, borderLeft: \`10px solid \${ACCENT}\`, opacity: s(15) }}>
        <div style={{ fontSize: 34, fontWeight: 600 }}>{SUB}</div>
      </div>
    </AbsoluteFill>
  );
};

const ListSlide = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '100px 48px' }}>
      <div style={{ backgroundColor: CARD, borderRadius: 28, padding: '48px 40px', flex: 1, display: 'flex', flexDirection: 'column', gap: 36, justifyContent: 'center', borderBottom: \`12px solid \${ACCENT}\` }}>
        {ITEMS.map((item, i) => {
          const sp = spring({ frame: Math.max(0, frame - 10 - i * 8), fps, config: { damping: 15 } });
          return (
            <div key={i} style={{ display: 'flex', gap: 24, opacity: sp, transform: \`translateY(\${interpolate(sp, [0,1], [20,0])}px)\` }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: ACCENT }}>{item.no}</div>
              <div>
                <div style={{ fontSize: 38, fontWeight: 800 }}>{item.title}</div>
                <div style={{ fontSize: 26, color: DIM, marginTop: 10 }}>{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const QuoteSlide = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '80px 48px', justifyContent: 'center' }}>
      <div style={{ backgroundColor: CARD, padding: '80px 48px', borderRadius: 32, borderLeft: \`10px solid \${ACCENT}\`, transform: \`scale(\${scale})\` }}>
        <div style={{ fontSize: 140, color: ACCENT, opacity: 0.2, lineHeight: 0.5, fontFamily: 'serif', position: 'absolute', top: 40, left: 40 }}>"</div>
        <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.3, position: 'relative', zIndex: 1 }}>
          <div>{QUOTE_L1}</div>
          <div style={{ color: ACCENT }}>{QUOTE_L2}</div>
        </div>
        <div style={{ fontSize: 30, color: DIM, marginTop: 60 }}>{QUOTE_AUTHOR}</div>
      </div>
    </AbsoluteFill>
  );
};

const Closing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '140px 48px', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 80, fontWeight: 900, textAlign: 'center', color: ACCENT, opacity: s(0) }}>{CTA}</div>
      <div style={{ marginTop: 60, padding: '16px 40px', backgroundColor: ACCENT_BG, borderRadius: 99, color: ACCENT, fontSize: 32, fontWeight: 800, opacity: s(15) }}>www.ai-startup.io</div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={90}><Cover /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><ListSlide /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><QuoteSlide /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><Closing /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 360,
  fps: 30,
  category: "Other",
};
