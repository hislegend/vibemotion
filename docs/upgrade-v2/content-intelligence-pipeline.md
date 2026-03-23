# Content Intelligence Pipeline — 설계 문서 v1

> 입력(텍스트/URL/PDF) → 분석 → 스타일 선택 → 영상 자동 생성
> 유저는 "넣고 고르면 끝", 뒷단은 정교하게 돌아간다.

---

## Phase 1: 콘텐츠 분석 엔진 (Content Analyzer)

### 입력 타입 감지
```
텍스트 → 직접 분석
URL → fetch → HTML/OG 메타 추출 → 분석
PDF → 텍스트 추출 → 분석
문서(.docx/.hwp) → 텍스트 변환 → 분석
```

### 분석 프롬프트 (AI에게 보내는 시스템 프롬프트)

```typescript
const CONTENT_ANALYSIS_PROMPT = `
You are a content analyst for a video generation platform.
Analyze the given content and return a structured JSON.

## OUTPUT SCHEMA

{
  "contentType": "data-story" | "product-intro" | "news-summary" | "tutorial" | "testimonial" | "brand-story" | "comparison" | "announcement",
  "title": "콘텐츠의 핵심 제목 (1줄)",
  "summary": "3줄 요약",
  "tone": "professional" | "playful" | "dramatic" | "minimal" | "urgent",
  "keyMessages": ["핵심 메시지 1", "핵심 메시지 2", "핵심 메시지 3"],
  "dataPoints": [
    { "label": "매출 성장", "value": "300%", "context": "전년 대비" }
  ],
  "entities": {
    "people": ["이름1"],
    "products": ["제품명1"],
    "companies": ["회사명1"],
    "dates": ["2026-03-23"]
  },
  "visualAssets": {
    "hasImages": true,
    "hasCharts": false,
    "hasLogos": true,
    "imageUrls": ["https://..."]
  },
  "suggestedDuration": {
    "snack": 8,
    "short": 30,
    "medium": 60
  },
  "sceneBreakdown": [
    {
      "order": 1,
      "type": "hook",
      "content": "핵심 수치 또는 질문으로 시작",
      "duration": "3-5초"
    },
    {
      "order": 2,
      "type": "body",
      "content": "주요 내용 전달",
      "duration": "15-30초"
    },
    {
      "order": 3,
      "type": "cta",
      "content": "행동 유도",
      "duration": "3-5초"
    }
  ]
}

## RULES
- dataPoints: 숫자가 있으면 반드시 추출. 없으면 빈 배열.
- sceneBreakdown: 콘텐츠 길이에 맞게 3~7개 씬으로 분할.
- 한국어 콘텐츠는 한국어로 출력, 영어는 영어로.
- 판단이 모호하면 가장 가능성 높은 것으로 결정. 질문하지 않는다.
`;
```

---

## Phase 2: 스타일 라우팅 매트릭스 (Style Router)

### 스타일 5종 정의

| ID | 스타일명 | 설명 | 기술 스택 |
|----|---------|------|----------|
| `infographic` | 📊 데이터 모션 | 숫자/차트/타이포 중심 | Remotion only |
| `presenter` | 🎤 프레젠터 | AI 인물 + 자막/그래픽 | 생성형 영상 + TTS + Remotion 오버레이 |
| `cinematic` | 🎬 시네마틱 | 영상 배경 + 내레이션 + 타이틀 | 생성형 영상 + TTS + Remotion 타이틀 |
| `showcase` | 📱 제품 쇼케이스 | 디바이스 목업 + 앱 화면 | Remotion only |
| `social` | ⚡ SNS 숏폼 | 후킹 텍스트 + 빠른 컷 | Remotion only (Phase 1) |

### 라우팅 규칙

```typescript
const STYLE_ROUTING_PROMPT = `
Based on the content analysis, recommend the top 3 video styles.

## ROUTING LOGIC

contentType → primary style:
- "data-story" → infographic (수치 많으면) or cinematic (스토리 중심이면)
- "product-intro" → showcase (앱/제품이면) or presenter (서비스 설명이면)
- "news-summary" → social (짧으면) or cinematic (깊으면)
- "tutorial" → presenter (단계별이면) or infographic (도식이면)
- "testimonial" → social (한 건이면) or cinematic (스토리이면)
- "brand-story" → cinematic (항상)
- "comparison" → infographic (항상)
- "announcement" → social (짧으면) or infographic (수치 있으면)

## BOOST SIGNALS
- dataPoints 3개 이상 → infographic +2점
- entities.people 있음 → presenter +2점
- tone === "dramatic" → cinematic +2점
- tone === "playful" or "urgent" → social +2점
- entities.products 있음 → showcase +2점

## OUTPUT
Return top 3 styles ranked by score:
[
  { "style": "infographic", "score": 8, "reason": "수치 5개 감지, 차트 적합" },
  { "style": "cinematic", "score": 5, "reason": "브랜드 스토리 요소 있음" },
  { "style": "social", "score": 3, "reason": "짧은 요약 가능" }
]
`;
```

### 유저 인터페이스 (Style Picker)

분석 완료 후 유저에게 보여줄 카드:
```
┌─────────────────────────────────────────┐
│ 📋 "크랩스 2026 Q1 매출 보고서"          │
│ 수치 5개 · 차트 3개 · 제품 2개 감지      │
├─────────────────────────────────────────┤
│                                         │
│  [📊 데이터 모션]  ← 추천               │
│  수치와 차트를 역동적으로                │
│                                         │
│  [🎤 프레젠터]                          │
│  AI 프레젠터가 보고서 설명              │
│                                         │
│  [🎬 시네마틱]                          │
│  내레이션과 함께 드라마틱하게            │
│                                         │
├─────────────────────────────────────────┤
│  ⏱ 8초  ⏱ 30초  ⏱ 60초               │
│  길이도 선택                            │
└─────────────────────────────────────────┘
```

---

## Phase 3: 생성 오케스트레이션 (Generation Orchestrator)

### 스타일별 생성 경로

#### A. `infographic` — Remotion Only (현재 시스템 확장)
```
콘텐츠 분석 JSON
  → 씬별 Remotion 프롬프트 자동 생성
  → 기존 generate API 호출
  → 프리뷰 → 수정 대화 → 렌더링
```

Remotion 프롬프트 자동 생성 예시:
```
분석 결과: { dataPoints: [{label:"매출", value:"300%"}, {label:"유저", value:"10만"}], tone: "professional" }

→ 생성되는 프롬프트:
"Create a data showcase animation.
Scene 1 (0-90f): Dark indigo background. '+300%' counts up from 0 with spring animation. Label '매출 성장' fades in below.
Scene 2 (90-180f): '100,000+' counts up. Label '활성 유저'. Staggered entrance.
Scene 3 (180-240f): Company logo spring entrance with tagline. CTA fade in."
```

#### B. `presenter` — 생성형 영상 + TTS + Remotion 오버레이
```
콘텐츠 분석 JSON
  → 대본 자동 생성 (씬별 나레이션 텍스트)
  → TTS (일레븐랩스) → 음성 파일
  → AI 아바타 영상 생성 (Runway/HeyGen/D-ID)
  → Remotion 오버레이 (자막, 그래픽, 하단 배너) 합성
  → 최종 렌더링
```

#### C. `cinematic` — 생성형 배경 + TTS + Remotion 타이틀
```
콘텐츠 분석 JSON
  → 대본 + 영상 프롬프트 자동 생성
  → TTS (일레븐랩스) → 음성
  → 배경 영상 생성 (Runway/Kling) — 씬별 5-10초 클립
  → Remotion 타이틀/자막/인포그래픽 오버레이
  → 최종 합성
```

#### D. `showcase` — Remotion Only (디바이스 목업 특화)
```
콘텐츠 분석 JSON (products 추출)
  → 앱 스크린샷 URL 감지 or 유저 업로드
  → 디바이스 목업 Remotion 컴포넌트 + 제품 카피 자동 생성
  → 프리뷰 → 수정 → 렌더링
```

#### E. `social` — Remotion Only (빠른 컷 특화)
```
콘텐츠 분석 JSON
  → 후킹 첫 줄 + 핵심 3포인트 + CTA 자동 구성
  → 빠른 전환 Remotion 프롬프트
  → 프리뷰 → 수정 → 렌더링
```

---

## Phase 분리 (구현 우선순위)

### Phase 1 — 지금 (Remotion Only 경로)
- [x] 콘텐츠 분석 프롬프트
- [x] 스타일 라우팅 매트릭스
- [ ] `infographic` / `showcase` / `social` 씬 자동 프롬프트 생성
- [ ] 분석 결과 → Remotion 프롬프트 변환 로직
- [ ] 유저 UI: 입력 → 분석 카드 → 스타일 선택 → 생성

### Phase 2 — 다음 (TTS 연동)
- [ ] 일레븐랩스 TTS API 연동
- [ ] 대본 자동 생성 프롬프트
- [ ] 음성 + Remotion 타이밍 동기화
- [ ] `cinematic` 스타일 (Remotion + TTS, 영상 생성 없이)

### Phase 3 — 이후 (생성형 영상 연동)
- [ ] Runway/Kling API 연동
- [ ] AI 아바타 연동 (HeyGen/D-ID)
- [ ] `presenter` 스타일 풀 파이프라인
- [ ] 레이어 합성 엔진

---

## 콘텐츠→프롬프트 변환 예시

### 입력: URL
```
https://blog.crabs.ai/2026-q1-revenue-report
```

### 분석 결과:
```json
{
  "contentType": "data-story",
  "title": "크랩스 2026 Q1 매출 보고서",
  "tone": "professional",
  "keyMessages": ["전년 대비 매출 300% 성장", "활성 유저 10만 돌파", "B2B 고객사 15개 확보"],
  "dataPoints": [
    {"label": "매출 성장", "value": "300%", "context": "YoY"},
    {"label": "활성 유저", "value": "100,000+", "context": "MAU"},
    {"label": "B2B 고객사", "value": "15", "context": "누적"}
  ],
  "entities": {"companies": ["크랩스"], "products": ["WakaShorts", "WakaLab"]}
}
```

### 유저 선택: 📊 데이터 모션 · 30초

### 자동 생성되는 Remotion 프롬프트:
```
Create a professional data story animation for "크랩스 2026 Q1 매출 보고서". 30 seconds, 9:16 vertical.

Scene 1 (0-150f) HOOK: Dark indigo-to-violet gradient. "크랩스" logo spring entrance → "2026 Q1" subtitle fades in below. Bold, confident, minimal.

Scene 2 (150-360f) DATA: Three key metrics appear with staggered count-up animations:
- "+300%" (large, white) with label "매출 성장" and context "전년 대비"
- "100,000+" with label "활성 유저"
- "15" with label "B2B 고객사"
Each metric gets its own beat — spring entrance, count-up, brief hold. Use indigo accent for labels.

Scene 3 (360-600f) PRODUCTS: Two product cards slide in from sides:
- "WakaShorts" with brief tagline
- "WakaLab" with brief tagline
Clean card design, subtle shadows, spring animations.

Scene 4 (600-750f) CLOSER: All metrics summarized in a compact grid. Company logo centered. "AI Video Solutions" tagline fades in. Ambient glow pulse.

Scene 5 (750-900f) CTA: "crabs.ai" with subtle glow. Clean fade out.

Style: Crabs brand (indigo/violet/amber). Inter font. Spring-based motion. Premium, confident, no clutter.
```

---

## 기술 구현 포인트 (엔도 참고)

### 새로운 API 엔드포인트
```
POST /api/analyze     — 콘텐츠 분석 (입력 → JSON)
POST /api/route-style — 스타일 추천 (분석 JSON → 스타일 3개)
POST /api/generate    — 기존 (프롬프트 → Remotion 코드) ← 여기는 변경 없음
```

### 프론트엔드 흐름
```
InputBox (텍스트/URL/파일)
  → /api/analyze → AnalysisCard (요약 표시)
  → /api/route-style → StylePicker (카드 3개)
  → 유저 선택 → 자동 프롬프트 생성 (프론트에서)
  → /api/generate → 기존 프리뷰 화면
```

### 핵심: /api/generate는 건드리지 않는다
- 분석 → 라우팅 → 프롬프트 생성은 전부 "generate 앞단"에서 처리
- generate API는 여전히 프롬프트를 받아 Remotion 코드를 생성하는 역할만
- 기존 시스템과 완전 호환. 유저가 직접 프롬프트 입력하는 기존 방식도 유지
