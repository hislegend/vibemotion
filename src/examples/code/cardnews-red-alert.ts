import { RemotionExample } from "./index";

export const cardnewsRedAlertExample: RemotionExample = {
  id: "cardnews-red-alert",
  name: "카드뉴스: 레드 경고",
  description: "개인정보 보호 5대 수칙. 빨간 경고 테마.",
  code: `import { AbsoluteFill, Series, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BG = '#1a1a2e';
const CARD = '#2d1a1a';
const ACCENT = '#ef4444';
const ACCENT_BG = '#ef44441a';
const TEXT = '#ffffff';
const DIM = '#ffffffb3';
const FONT = 'Inter, system-ui, sans-serif';

const BADGE = 'SECURITY ALERT';
const T1 = '개인정보 보호';
const T2 = '5대 수칙';
const SUB = '당신의 데이터는 안전한가요?';
const WARN_L1 = '모르면 당하는';
const WARN_L2 = '보안 위협';
const ITEMS = [
  { no: '01', title: '2단계 인증 필수', desc: 'SMS가 아닌 앱 인증 사용' },
  { no: '02', title: '공용 Wi-Fi 주의', desc: 'VPN 없이 접속 금지' },
  { no: '03', title: '비밀번호 관리자', desc: '사이트별 고유 비밀번호' },
];
const CTA = '지금 보안 점검하세요';

const Cover = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '100px 48px' }}>
      <div style={{ padding: '14px 28px', backgroundColor: ACCENT, borderRadius: 99, fontSize: 26, fontWeight: 800, color: '#ffffff', width: 'max-content', opacity: s(0) }}>{BADGE}</div>
      <div style={{ fontSize: 96, fontWeight: 900, marginTop: 60, lineHeight: 1.2, opacity: s(5), transform: \`translateY(\${interpolate(s(5), [0,1], [40,0])}px)\` }}>
        <div>{T1}</div>
        <div style={{ color: ACCENT }}>{T2}</div>
      </div>
      <div style={{ marginTop: 'auto', marginBottom: 60, backgroundColor: ACCENT_BG, padding: '40px 36px', borderRadius: 20, borderLeft: \`10px solid \${ACCENT}\`, opacity: s(15) }}>
        <div style={{ fontSize: 34, fontWeight: 600 }}>{SUB}</div>
      </div>
    </AbsoluteFill>
  );
};

const FocusSlide = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '80px 48px', justifyContent: 'center' }}>
      <div style={{ backgroundColor: CARD, padding: '80px 48px', borderRadius: 32, borderLeft: \`10px solid \${ACCENT}\`, transform: \`scale(\${scale})\` }}>
        <div style={{ fontSize: 140, color: ACCENT, opacity: 0.3, position: 'absolute', top: 20, right: 40, fontWeight: 900 }}>!</div>
        <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.3 }}>
          <div>{WARN_L1}</div>
          <div style={{ color: ACCENT }}>{WARN_L2}</div>
        </div>
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

const Closing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, color: TEXT, padding: '140px 48px', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 80, fontWeight: 900, textAlign: 'center', color: ACCENT, opacity: s(0) }}>{CTA}</div>
    </AbsoluteFill>
  );
};

export const MyAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Series>
      <Series.Sequence durationInFrames={90}><Cover /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><FocusSlide /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><ListSlide /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><Closing /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);`,
  durationInFrames: 360,
  fps: 30,
  category: "Other",
};
