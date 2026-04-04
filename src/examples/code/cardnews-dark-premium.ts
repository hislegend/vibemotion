import { RemotionExample } from "./index";

export const cardnewsDarkPremiumExample: RemotionExample = {
  id: "cardnews-dark-premium",
  name: "카드뉴스: 다크 프리미엄",
  description: "핀테크 서비스 혁신 5가지. 금색 악센트 다크 테마.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#0A0A0A';
const CARD = '#1E1A14';
const ACCENT = '#E8A84C';
const TEXT = '#F0EBE3';
const DIM = '#6B5B4E';
const FONT = 'Inter, system-ui, sans-serif';

const TITLE_1 = '핀테크 서비스';
const TITLE_2 = '혁신 5가지';
const SUB = '금융의 미래를 바꾸는 핵심 트렌드';
const BADGE = 'FINTECH 2026';

const ITEMS_1 = [
  { no: '01', title: '임베디드 파이낸스', desc: '비금융 앱에 금융 기능 내장' },
  { no: '02', title: '실시간 결제', desc: '24/7 즉시 송금 인프라' },
];
const ITEMS_2 = [
  { no: '03', title: 'AI 리스크 관리', desc: '실시간 이상거래 탐지' },
  { no: '04', title: '오픈뱅킹 확장', desc: 'API 기반 금융 데이터 공유' },
  { no: '05', title: '디지털 자산', desc: '토큰화된 실물 자산 거래' },
];
const CTA = '지금 트렌드를 확인하세요';

const Cover = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '100px 48px' }}>
      <div style={{ padding: '14px 28px', backgroundColor: ACCENT, borderRadius: 99, fontSize: 26, fontWeight: 800, color: BG, width: 'max-content', opacity: s(0), transform: \`translateY(\${interpolate(s(0), [0,1], [30,0])}px)\` }}>{BADGE}</div>
      <div style={{ fontSize: 96, fontWeight: 900, marginTop: 60, lineHeight: 1.2, letterSpacing: -2, opacity: s(5), transform: \`translateY(\${interpolate(s(5), [0,1], [40,0])}px)\` }}>
        <div>{TITLE_1}</div>
        <div style={{ color: ACCENT }}>{TITLE_2}</div>
      </div>
      <div style={{ marginTop: 'auto', marginBottom: 60, backgroundColor: CARD, padding: '40px 36px', borderRadius: 20, borderLeft: \`10px solid \${ACCENT}\`, opacity: s(15), transform: \`translateY(\${interpolate(s(15), [0,1], [20,0])}px)\` }}>
        <div style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.4 }}>{SUB}</div>
      </div>
    </AbsoluteFill>
  );
};

const ListSlide = ({ items }: { items: { no: string; title: string; desc: string }[] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '100px 48px' }}>
      <div style={{ backgroundColor: CARD, borderRadius: 28, padding: '48px 40px', flex: 1, display: 'flex', flexDirection: 'column', gap: 40, justifyContent: 'center', borderBottom: \`12px solid \${ACCENT}\` }}>
        {items.map((item, i) => {
          const s = spring({ frame: Math.max(0, frame - 10 - i * 8), fps, config: { damping: 15 } });
          return (
            <div key={i} style={{ display: 'flex', gap: 28, opacity: s, transform: \`translateY(\${interpolate(s, [0,1], [20,0])}px)\` }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: ACCENT }}>{item.no}</div>
              <div>
                <div style={{ fontSize: 40, fontWeight: 800 }}>{item.title}</div>
                <div style={{ fontSize: 28, color: DIM, marginTop: 12 }}>{item.desc}</div>
              </div>
            </div>
          );
        })}
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
      <div style={{ fontSize: 72, fontWeight: 900, textAlign: 'center', opacity: s(0) }}>{TITLE_1}</div>
      <div style={{ fontSize: 80, fontWeight: 900, textAlign: 'center', color: ACCENT, marginTop: 12, opacity: s(5) }}>{TITLE_2}</div>
      <div style={{ marginTop: 80, backgroundColor: ACCENT, padding: '40px 36px', borderRadius: 28, width: '100%', textAlign: 'center', fontSize: 44, fontWeight: 900, color: BG, opacity: s(15), transform: \`translateY(\${interpolate(s(15), [0,1], [30,0])}px)\` }}>{CTA}</div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={90}><Cover /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><ListSlide items={ITEMS_1} /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><ListSlide items={ITEMS_2} /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><Closing /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 360,
  fps: 30,
  category: "Other",
};
