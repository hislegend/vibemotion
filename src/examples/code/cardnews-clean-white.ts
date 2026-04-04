import { RemotionExample } from "./index";

export const cardnewsCleanWhiteExample: RemotionExample = {
  id: "cardnews-clean-white",
  name: "카드뉴스: 클린 화이트",
  description: "건강 관리 앱 핵심 기능. 깔끔한 화이트 테마.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#FAFAFA';
const CARD = '#FFFFFF';
const ACCENT = '#2563EB';
const TEXT = '#111827';
const DIM = '#6B7280';
const BORDER = '#E5E7EB';
const FONT = 'Inter, system-ui, sans-serif';

const BADGE = 'HEALTH APP';
const TITLE_1 = '건강 관리의';
const TITLE_2 = '새로운 기준';
const SUB = '당신의 건강을 24시간 지켜주는 스마트 솔루션';

const ITEMS_1 = [
  { no: '01', title: '실시간 건강 모니터링', desc: '심박수, 혈압, 수면 패턴 자동 추적' },
  { no: '02', title: 'AI 건강 코칭', desc: '개인 맞춤 운동 및 식단 추천' },
];
const ITEMS_2 = [
  { no: '03', title: '원격 진료 연동', desc: '앱에서 바로 전문의 상담' },
  { no: '04', title: '복약 알림', desc: '시간별 약 복용 리마인더' },
];
const CTA = '건강한 삶을 시작하세요';

const Cover = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '100px 48px' }}>
      <div style={{ padding: '12px 24px', backgroundColor: ACCENT, borderRadius: 99, fontSize: 24, fontWeight: 800, color: '#ffffff', width: 'max-content', opacity: s(0) }}>{BADGE}</div>
      <div style={{ fontSize: 92, fontWeight: 900, marginTop: 60, lineHeight: 1.2, letterSpacing: -2, opacity: s(5), transform: \`translateY(\${interpolate(s(5), [0,1], [40,0])}px)\` }}>
        <div>{TITLE_1}</div>
        <div style={{ color: ACCENT }}>{TITLE_2}</div>
      </div>
      <div style={{ marginTop: 'auto', marginBottom: 60, backgroundColor: CARD, padding: '40px 36px', borderRadius: 20, border: \`2px solid \${BORDER}\`, borderLeft: \`8px solid \${ACCENT}\`, opacity: s(15) }}>
        <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.4, color: DIM }}>{SUB}</div>
      </div>
    </AbsoluteFill>
  );
};

const ListSlide = ({ items }: { items: { no: string; title: string; desc: string }[] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '100px 48px' }}>
      <div style={{ backgroundColor: CARD, borderRadius: 28, padding: '48px 40px', flex: 1, display: 'flex', flexDirection: 'column', gap: 40, justifyContent: 'center', border: \`2px solid \${BORDER}\`, borderBottom: \`8px solid \${ACCENT}\` }}>
        {items.map((item, i) => {
          const sp = spring({ frame: Math.max(0, frame - 10 - i * 8), fps, config: { damping: 15 } });
          return (
            <div key={i} style={{ display: 'flex', gap: 28, opacity: sp, transform: \`translateY(\${interpolate(sp, [0,1], [20,0])}px)\` }}>
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
      <div style={{ marginTop: 80, backgroundColor: ACCENT, padding: '40px 36px', borderRadius: 28, width: '100%', textAlign: 'center', fontSize: 44, fontWeight: 900, color: '#ffffff', opacity: s(15) }}>{CTA}</div>
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
