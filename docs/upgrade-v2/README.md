# Vibemotion Upgrade — SYSTEM_PROMPT 5원칙 + Tier 1 템플릿

> 유튜브 영상 교훈 적용: "규칙은 간결하게, 창의 영역은 AI에게"

## 📦 산출물 목록

### 1. SYSTEM_PROMPT v2 (`system-prompt-v2.md`)
- 기존 ~100줄 → 5가지 핵심 원칙 ~35줄
- 원칙 1-4: 문법/모션/비주얼/출력 (엄격)
- 원칙 5: 나머지 전부 AI 자유 (핵심)

### 2. 스킬 리팩토링 (`skills/`)
- `crabs-brand-v2.md` — 정확한 HEX 나열 → "색상 영역" 방향 가이드
- `app-promo-v2.md` — 코드 패턴 복사 → "느낌" 방향 가이드 + 길이별 씬 구조

### 3. Tier 1 스낵 템플릿 3종 (`examples/`)
- `logo-stinger.tsx` — 로고 스팅어/브랜드 범퍼 (5-8초)
  - 스프링 등장 + 글로우 펄스 + 태그라인 페이드
- `number-impact.tsx` — 숫자 임팩트 (5-8초)
  - 이징 카운트업 + 랜딩 펄스 + 언더라인 리빌
- `product-teaser.tsx` — 제품 한 컷 티저 (7-10초)
  - 3D 틸트 폰 목업 + 플로팅 + 보케 배경 + CTA

### 4. 스킬 감지 제한 (`skill-detection-v2.md`)
- 가이던스 최대 1개 + 예제 최대 1개 = 컨텍스트 다이어트

## 🔧 엔도 작업 목록

1. `src/app/api/generate/route.ts` — SYSTEM_PROMPT를 v2로 교체
2. `src/skills/crabs-brand.md`, `app-promo.md` — v2로 교체
3. `src/skills/index.ts` — 스킬 감지 최대 2개 제한 로직 추가
4. `src/examples/code.ts` — Tier 1 3종 등록
5. 메인 갤러리에 ⏱ 뱃지 표시 (7초 / 25초 / 45초)

## 📊 Before/After 테스트 프롬프트 (검증용)

같은 프롬프트로 v1/v2 비교:
1. "크랩스 로고 인트로 만들어줘"
2. "매출 300% 성장 강조하는 숏폼"
3. "와카숏츠 앱 프로모 10초짜리"
