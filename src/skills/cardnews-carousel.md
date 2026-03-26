---
title: Card News Carousel
impact: HIGH
impactDescription: generates Instagram-optimized multi-slide card news with auto layout detection
tags: cardnews, carousel, instagram, slides, infographic, 카드뉴스, 카루셀
---

## Card News Carousel — Direction Guide

인스타그램 카드뉴스(카루셀) 슬라이드를 생성한다.
`<Series>`로 슬라이드를 순차 연결. 각 슬라이드는 별도 함수 컴포넌트.

## 핵심 규칙

1. **해상도:** 1080×1350 (4:5, 인스타 피드 기본). 1080×1080(1:1), 1080×1920(9:16) 지원.
2. **슬라이드 최대 20장** (인스타 카루셀 제한).
3. **폰트:** Inter, system-ui, sans-serif (기본). Pretendard Variable (한국어 최적).
4. **본문 텍스트 최소 22px** (모바일 축소 시 가독성).
5. **한글은 반드시 const 변수에 넣고 JSX에서 참조.** 템플릿 리터럴 안에 한글 직접 넣지 않는다.
6. **`<Series>`로 슬라이드 연결.** 각 슬라이드 durationInFrames: 90 (3초).

## 3-Tier Layout (슬라이드 역할)

### Cover (표지, 첫 번째 슬라이드)
- **목적:** 스크롤 멈춤 유도. 3초 안에 주제 전달.
- 배경: 그라데이션 or 이미지 + 어두운 오버레이 (opacity 0.6~0.7)
- 브랜드 마크: 좌상단 (18px, letterSpacing 4)
- 태그/에피소드: 상단 pill badge (accent 배경, rounded-full, px-20 py-8)
- 헤드라인: 52–60px, weight 800, 최대 2줄. 강조 키워드는 accent 배경 span
- 서브 카피: 22px, weight 400, rgba(255,255,255,0.65)
- **배경 이미지:** `<Img src={imageUrl} />` + absoluteFill dark overlay. 이미지 없으면 그라데이션 + 미세 그리드 패턴.

### Body (본문, 중간 슬라이드들)
- **목적:** 정보 전달. 비주얼 모드에 따라 레이아웃 자동 결정.
- 상단 바: accent 스트라이프(4px, width 30%) + 슬라이드 번호(16px, accent) + 우측 브랜드명(14px, dim)
- 타이틀: 30–36px, weight 700
- 콘텐츠: 비주얼 모드별 상이 (아래 참조)
- **강조 박스 (필수):** 슬라이드 하단에 accent-light 배경 + accent left-border 4px + 핵심 문장 22px

### Closing (마무리, 마지막 슬라이드)
- **목적:** CTA + 브랜드 각인
- 배경: 표지와 동일 다크 톤
- 중앙 브랜드 로고 (120px 원형, gradient 배경, scale spring)
- 브랜드명: 28px, weight 800, letterSpacing 8
- CTA: 32px, weight 700
- URL: accent pill 버튼 (rounded-full, accent 배경, 20px)
- 면책: 14px, opacity 0.5, 하단 고정

## 비주얼 모드 7종 (Body 슬라이드 자동 감지)

### list (세로 목록) — 기본값
- **트리거:** items 3개 이상
- **각 항목을 색상 바(rounded-xl)로 감싼다.** 항목별 다른 색상:
  - 1번: #ef4444(빨강) → rgba(239,68,68,0.15) 배경
  - 2번: #f97316(주황) → rgba(249,115,22,0.15) 배경
  - 3번: #8b5cf6(보라) → rgba(139,92,246,0.15) 배경
  - 4번: #ec4899(분홍) → rgba(236,72,153,0.15) 배경
  - 5번: #22c55e(초록) → rgba(34,197,94,0.15) 배경
- 바 구조: 좌측 emoji 아이콘 + 라벨, 우측 태그(pill badge)
- 순차 slide-up spring (0.15초 간격)

### step (단계/프로세스)
- **트리거:** "STEP", "단계", 숫자 접두어
- 세로 스텝: 좌측 원형 번호 뱃지(accent) + 세로 점선 커넥터
- 또는 가로 스텝: 번호 원형 → 화살표 → 번호 원형
- 순차 등장 spring

### split (2열 비교)
- **트리거:** "vs", "비교", "전/후"
- 좌: 카드(rounded-xl, red-tinted border), 항목에 ✕ 아이콘
- 우: 카드(rounded-xl, green-tinted border), 항목에 ✓ 아이콘
- 하단에 accent 배경 결론 문장
- 구분선 draw 애니메이션

### grid (2×2 또는 3열 그리드)
- **트리거:** items 3~4개, 각 30자 이내
- 카드(rounded-xl, 각각 다른 어두운 배경) + 상단 emoji 아이콘
- 동시 scale-up spring

### timeline (타임라인)
- **트리거:** 날짜/연도 패턴
- 좌측 세로선 2px accent + 원형 노드
- 순차 등장

### focus (단일 강조)
- **트리거:** items 1개 or 인용문
- 큰 인용부호(64px, accent) + 메시지 36–44px 중앙 정렬
- fade-in 또는 scale spring

### action (카드형 팁/CTA)
- **트리거:** "하세요", "tip", "방법"
- rounded-xl 카드, accent left border 3px
- 또는 "입력 폼" 스타일: 라벨 + placeholder("여기에 적어보세요") 행
- 카드별 slide-in from right

## 세이프 존 (최소한으로)

```
상단: 40px (브랜드 마크)
하단: 48px (페이지 인디케이터)
좌우: 36px (인스타 크롭 대비)
```
세이프 존은 최소한. 콘텐츠가 화면을 **꽉 채워야** 한다. 과도한 여백 금지.

## 콘텐츠 밀도 (CRITICAL)

- **네거티브 스페이스: 25~35%.** 40% 초과하면 허전해 보인다.
- 본문 슬라이드의 콘텐츠 영역은 화면의 **65~75%**를 차지해야 한다.
- 항목 사이 간격: 12~16px (과도한 간격 금지)
- 항목 바/카드의 높이: 최소 60px (내용이 있어 보여야 함)
- 타이틀 바로 아래에 콘텐츠 시작 (불필요한 빈 공간 없이)

## 면적 분할 (각 슬라이드)

```
상단 20% — 상단 바 + 타이틀 (컴팩트하게)
중앙 60% — 콘텐츠 영역 (항목 바/카드/비교 등. 꽉 채운다)
하단 20% — 강조 박스 + 페이지 인디케이터
```

## 테마 프리셋

### professional (기본)
- 배경(cover/closing): linear-gradient(170deg, #1e293b, #0f172a)
- 배경(body): #fafafa
- accent: #3b82f6
- text: #ffffff(dark bg) / #171717(light bg)

### taejeong (태정 스타일 — IP Insight 레퍼런스)
- 배경(전체): 다크 차콜 #1a1a2e ~ #2d2d44 (파란빛 다크)
- accent: 시안 #00AEEF
- accent-light: #E0F7FF (포인트 박스 배경)
- text: #ffffff
- 강조 키워드: accent 배경 pill (#00AEEF)
- 항목 바: 각각 다른 gradient 색상 (위 list 모드 참조)
- 표지: 실사 이미지 + rgba(0,0,0,0.55) 오버레이
- 마무리: 큰 로고 + accent pill URL 버튼

### dark
- 배경: #0f172a
- accent: #2563eb

### warm
- 배경: #FFF8F0
- accent: #fbbf24

### minimal
- 배경: #ffffff
- accent: #a3a3a3

## 타이포그래피 스케일

| 역할 | 사이즈 | Weight | 용도 |
|------|--------|--------|------|
| display | 52–60px | 800 | 표지 헤드라인 |
| h1 | 30–36px | 700 | 본문 타이틀 |
| h2 | 24–28px | 600 | 서브 타이틀 |
| body | 20–24px | 400 | 항목 텍스트 |
| caption | 16–18px | 400 | 태그, 출처 |
| small | 14px | 300 | 면책, 부가 |
| brand | 18px | 700 | 브랜드 마크 (letterSpacing 4) |
| number | 16px | 600 | 슬라이드 번호 (letterSpacing 2) |

## Spring Config

| 프리셋 | damping | stiffness | 용도 |
|--------|---------|-----------|------|
| snappy | 15 | 200 | 빠른 등장 |
| smooth | 20 | 120 | 부드러운 전환 |

## 애니메이션 시퀀싱 (Body 슬라이드)

1. 배경 → 0프레임
2. 상단 바 (스트라이프 width 애니메이션) → 0~15프레임
3. 슬라이드 번호 → 5프레임 (spring snappy)
4. 타이틀 → 10프레임 (spring + translateY 20→0)
5. 아이템 (순차) → 25프레임 시작, 간격 5프레임 (spring smooth + translateY 25→0)
6. 강조 박스 → 50프레임 (spring + scale 0.95→1)

## 배경 이미지 처리

표지에서 배경 이미지를 사용할 때:
```tsx
// 이미지 있을 때
<AbsoluteFill>
  <Img src={IMAGE_URL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  <AbsoluteFill style={{ background: 'rgba(0,0,0,0.55)' }} />
  {/* 콘텐츠 */}
</AbsoluteFill>

// 이미지 없을 때 (폴백)
<AbsoluteFill style={{ background: 'linear-gradient(145deg, #1a1a2e, #2d2d44)' }}>
  {/* 미세 그리드 패턴 */}
  <AbsoluteFill style={{ opacity: 0.06, backgroundImage: 'linear-gradient(accent 1px, transparent 1px), linear-gradient(90deg, accent 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
  {/* 콘텐츠 */}
</AbsoluteFill>
```

## 디자인 원칙 (DESIGN.md 기반)

1. **3초 룰** — 각 슬라이드의 핵심 메시지가 3초 안에 보여야 한다
2. **시각 위계 3단계** — 타이틀(30-36px) > 항목 텍스트(20-24px) > 캡션(14-16px). 4단계 이상 금지
3. **색상 규칙** — 메인 배경 1 + 악센트 1 + 항목별 색상(리스트에서만). 강조색은 전체 면적의 10% 이내
4. **정렬 일관성** — 한 축(좌정렬) 고정. 같은 슬라이드에서 좌정렬과 중앙정렬 혼용 금지
5. **같은 역할 = 같은 스타일** — 항목 바는 모두 같은 높이/radius/패딩. 들쭉날쭉 금지
6. **이미지 위 텍스트** — 반드시 반투명 오버레이. 직접 올리기 금지
7. **CTA** — 마무리 슬라이드에 1개. 동사로 시작 ("시작하세요", "확인하기")
8. **한글 자간** — 제목 letterSpacing: -0.5px, 본문: 0 (기본)

## Avoid
- **과도한 여백** — 콘텐츠가 화면의 60% 미만이면 허전. 65~75% 채울 것
- 단일 accent 색상으로 모든 항목 처리 (항목별 다른 색상 필수)
- 22px 미만 본문 텍스트
- 강조 박스 없는 본문 슬라이드
- 번호 뱃지만 있고 emoji 아이콘 없는 리스트
- 항목 간 과도한 간격 (16px 초과)
- 템플릿 리터럴 안에 한글 직접 넣기 (const 변수 사용)
- 불필요한 padding/margin으로 콘텐츠를 축소시키는 것
