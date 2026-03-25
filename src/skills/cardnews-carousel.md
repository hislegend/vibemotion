---
title: Card News Carousel
impact: HIGH
impactDescription: generates Instagram-optimized multi-slide card news with auto layout detection
tags: cardnews, carousel, instagram, slides, infographic, 카드뉴스, 카루셀
---

## Card News Carousel — Direction Guide

인스타그램 카드뉴스(카루셀) 슬라이드를 생성한다.
각 슬라이드는 독립 컴포지션(Composition)으로 렌더링되어 PNG 또는 MP4로 출력된다.

## 핵심 규칙

1. **해상도:** 1080×1350 (4:5, 인스타 피드 기본). 1080×1080(1:1), 1080×1920(9:16) 지원.
2. **슬라이드 최대 20장** (인스타 카루셀 제한).
3. **폰트:** Pretendard Variable (한국어 최적). Inter 폴백.
4. **본문 텍스트 최소 22px** (모바일 축소 시 가독성).

## 3-Tier Layout (슬라이드 역할)

### Cover (표지, 첫 번째 슬라이드)
- **목적:** 스크롤 멈춤 유도. 3초 안에 주제 전달.
- 배경: 그라데이션 or 이미지 + 어두운 오버레이
- 브랜드 마크: 좌상단 (32px 이내)
- 태그/에피소드: 상단 pill badge
- 헤드라인: 56–64px, weight 800, 최대 2줄
- 강조 키워드: accent 색상 박스 하이라이트
- **출력: PNG (정적)** — 첫 장은 정적이 로딩 빠름

### Body (본문, 중간 슬라이드들)
- **목적:** 정보 전달. 비주얼 모드에 따라 레이아웃 자동 결정.
- 상단 바: 브랜드 컬러 스트라이프(4px) + 슬라이드 번호
- 타이틀: 28–36px, weight 700
- 콘텐츠: 비주얼 모드별 상이 (아래 참조)
- 강조 박스: 하단 accent 배경 카드 (선택)
- **출력: MP4 (3초 애니메이션, 30fps, 90프레임)**

### Closing (마무리, 마지막 슬라이드)
- **목적:** CTA + 브랜드 각인
- 중앙 브랜드 로고 (크게)
- CTA: 32px, weight 700
- URL/연락처: 20px, accent color
- 면책: 14px, opacity 0.5
- **출력: PNG (정적)**

## 비주얼 모드 7종 (Body 슬라이드 자동 감지)

콘텐츠 텍스트를 분석하여 최적 모드를 선택한다. `visualMode`로 수동 지정도 가능.

### list (세로 목록) — 기본값
- **트리거:** items 3개 이상, 동일 레벨
- 아이콘 뱃지 (원형 accent + 번호)
- 순차 fade-in + slide-up (0.15초 간격)

### step (단계/프로세스)
- **트리거:** "STEP", "단계", 숫자 접두어
- 가로 또는 세로 스텝 커넥터 (점선/화살표)
- 커넥터 좌→우 draw + 스텝 순차 등장

### split (2열 비교)
- **트리거:** "vs", "비교", "CASE", "전/후", "Before/After"
- 좌: 회색/붉은 톤 (부정), 우: accent 톤 (긍정)
- 구분선 1px, 좌→우 순차 등장

### grid (2×2 그리드)
- **트리거:** items 정확히 4개, 각 30자 이내
- 카드 간격 12px, 4장 동시 scale-up spring

### timeline (타임라인)
- **트리거:** 날짜/연도 패턴 (2024.01, ~년, ~월)
- 좌측 세로선 2px accent + 원형 노드
- 세로선 draw + 노드/텍스트 순차 등장

### focus (단일 강조)
- **트리거:** items 1개 or 긴 인용문
- 큰 인용부호(64px, accent) + 메시지 36–44px 중앙
- 타이핑 효과 or fade-in

### action (카드형 팁)
- **트리거:** "하세요", "tip", "방법", "실천"
- rounded-xl 카드, accent left border 3px
- 카드별 slide-in from right (0.2초 간격)

## 세이프 존

```
상단: 60px (브랜드 마크 + 여백)
하단: 80px (인디케이터 + 플랫폼 UI)
좌우: 48px (인스타 피드 크롭 대비)
```

## 애니메이션 시퀀싱 (Body 슬라이드)

1. 배경/오버레이 → 0프레임
2. 브랜드 마크 → 5프레임
3. 타이틀 (단어별) → 10프레임, 간격 3프레임
4. 아이템 (순차) → 25프레임, 간격 5프레임
5. 강조 박스 → 50프레임
6. 페이지 인디케이터 → 60프레임

## 테마 프리셋

| 테마 | 배경 | Accent | 용도 |
|------|------|--------|------|
| professional | neutral-50 (#fafafa) | blue-500 (#3b82f6) | 비즈니스/정보 |
| dark | #0f172a | blue-600 (#2563eb) | 테크/고급 |
| warm | #FFF8F0 | amber-400 (#fbbf24) | 감성/라이프 |
| vibrant | gradient | violet-500 (#8b5cf6) | 에너지/이벤트 |
| minimal | #ffffff | neutral-400 (#a3a3a3) | 미니멀/에디토리얼 |

## 타이포그래피 스케일

| 역할 | 사이즈 | Weight | 용도 |
|------|--------|--------|------|
| display | 56–64px | 800 | 표지 헤드라인 |
| h1 | 36–44px | 700 | 본문 타이틀 |
| h2 | 28–32px | 600 | 서브 타이틀 |
| body | 22–26px | 400 | 본문 텍스트 |
| caption | 18–20px | 400 | 태그, 출처 |
| small | 14–16px | 300 | 면책, 부가 |

## Spring Config

| 프리셋 | damping | stiffness | 용도 |
|--------|---------|-----------|------|
| snappy | 15 | 200 | 빠른 등장 |
| smooth | 20 | 120 | 부드러운 전환 |
| bouncy | 10 | 180 | 주목 끌기 |
| gentle | 25 | 80 | 배경 움직임 |

## Avoid
- 슬라이드당 정보 과부하 (항목 6개 초과)
- 세이프 존 밖 텍스트 배치
- 22px 미만 본문 텍스트
- 배경과 텍스트 색상 대비 부족 (WCAG AA 4.5:1 미만)
- 표지/마무리에 불필요한 애니메이션
