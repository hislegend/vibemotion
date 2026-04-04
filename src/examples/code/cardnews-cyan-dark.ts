import { RemotionExample } from "./index";

export const cardnewsCyanDarkExample: RemotionExample = {
  id: "cardnews-cyan-dark",
  name: "카드뉴스: 시안 다크",
  description: "2026 개발 트렌드 5선. 시안 악센트 다크 테마.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#1a1a2e';
const CARD = '#0a1628';
const ACCENT = '#00AEEF';
const TEXT = '#ffffff';
const DIM = '#ffffffb3';
const FONT = 'Inter, system-ui, sans-serif';

const BADGE = 'DEV TRENDS 2026';
const T1 = '2026';
const T2 = '개발 트렌드 5선';
const SUB = '올해 반드시 알아야 할 기술';
const ITEMS_1 = [
  { no: '01', title: 'AI 네이티브 앱', desc: 'LLM이 앱의 코어 로직을 담당' },
  { no: '02', title: 'Edge Computing', desc: '서버리스를 넘어 엣지로' },
];
const ITEMS_2 = [
  { no: '03', title: 'WebAssembly 2.0', desc: '브라우저에서 네이티브 성능' },
  { no: '04', title: 'Rust in Production', desc: '시스템 언어의 웹 진출' },
  { no: '05', title: 'Spatial Computing', desc: 'AR/VR 개발의 표준화' },
];
const CTA = '트렌드를 선점하세요';

const s = (frame: number, fps: number, d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });

const Cover = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '100px 48px' }}>
      <div style={{ position: 'absolute', top: '30%', left: -20, fontSize: 280, fontWeight: 900, color: ACCENT, opacity: 0.03, whiteSpace: 'nowrap' }}>2026</div>
      <div style={{ padding: '14px 28px', backgroundColor: ACCENT, borderRadius: 99, fontSize: 26, fontWeight: 800, color: BG, width: 'max-content', opacity: s(frame, fps, 0) }}>{BADGE}</div>
      <div style={{ fontSize: 96, fontWeight: 900, marginTop: 60, lineHeight: 1.2, opacity: s(frame, fps, 5), transform: \`translateY(\${interpolate(s(frame, fps, 5), [0,1], [40,0])}px)\` }}>
        <div style={{ color: ACCENT }}>{T1}</div>
        <div>{T2}</div>
      </div>
      <div style={{ marginTop: 'auto', marginBottom: 60, backgroundColor: CARD, padding: '40px 36px', borderRadius: 20, borderLeft: \`10px solid \${ACCENT}\`, opacity: s(frame, fps, 15) }}>
        <div style={{ fontSize: 34, fontWeight: 600 }}>{SUB}</div>
      </div>
    </AbsoluteFill>
  );
};

const ListSlide = ({ items }: { items: { no: string; title: string; desc: string }[] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '100px 48px' }}>
      <div style={{ backgroundColor: CARD, borderRadius: 28, padding: '48px 40px', flex: 1, display: 'flex', flexDirection: 'column', gap: 36, justifyContent: 'center', borderBottom: \`12px solid \${ACCENT}\` }}>
        {items.map((item, i) => {
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

const Closing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '140px 48px', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 72, fontWeight: 900, textAlign: 'center', opacity: s(frame, fps, 0) }}>{T2}</div>
      <div style={{ marginTop: 80, backgroundColor: ACCENT, padding: '40px 36px', borderRadius: 28, width: '100%', textAlign: 'center', fontSize: 44, fontWeight: 900, color: BG, opacity: s(frame, fps, 15) }}>{CTA}</div>
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
