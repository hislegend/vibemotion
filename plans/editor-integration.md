# vibemotion 에디터 통합 + 예제 코드 계획

## 트랙 1: 예제 코드 20개 (퀄리티 80→90)

### 카드뉴스 5종
1. 다크 프리미엄 (#0A0A0A + #E8A84C) — 핀테크 서비스 소개
2. 클린 화이트 (#FAFAFA + #2563EB) — 헬스케어 앱 5가지 기능
3. 네온 그라데이션 (#0F0720 + #A855F7) — AI 스타트업 소개
4. 시안 다크 (#1a1a2e + #00AEEF) — 기술 트렌드 5선 (기존 테스트 기반)
5. 레드 다크 (#1a1a2e + #ef4444) — 주의사항/경고 콘텐츠

### 모션그래픽 5종
6. 브랜드 인트로 — 로고 spring + 슬로건 fadeIn
7. 데이터 대시보드 — CountUp + BarChart + ProgressRing
8. 타이핑 코드 — CodeBlock + 설명 패널
9. 플로우 다이어그램 — 단계별 노드+화살표
10. 타이틀 시퀀스 — TextReveal + Glow 효과

### 프로덕트 소개 5종 (4단계: 후킹→문제→솔루션→CTA)
11. SaaS 앱 소개 — 스크린샷 목업 + 기능 하이라이트
12. 모바일 앱 소개 — 폰 목업 + 스와이프 전환
13. 이커머스 상품 — 상품 이미지 줌 + 가격 팝업
14. 교육 플랫폼 — 강의 목록 + 수강생 통계
15. AI 도구 소개 — 입력→처리→결과 3단 플로우

### 시네마틱 5종
16. 영화 타이틀 — 대문자 + 그라데이션 배경 + 파티클
17. 카운트다운 — 3-2-1 글로우 + 리빌
18. 명언/인용구 — 인용부호 + 저자 + 배경 블러
19. 이벤트 초대장 — 날짜 + 장소 + RSVP CTA
20. 포트폴리오 쇼릴 — 이미지 그리드 + 트랜지션

---

## 트랙 2: 에디터 통합 (90→95 + 편의성)

### Phase 1: 에디터 코어 추출 (ai-studio → vibemotion)
- [ ] ai-studio/src/editor/ 에서 핵심 모듈 추출
  - timeline/ (타임라인 UI)
  - canvas/ (캔버스 프리뷰)
  - inspector/ (속성 패널)
  - state/ (상태 관리)
  - items/ (Video, Image, Text, Audio, Solid, GIF, Captions)
  - playback-controls/ (재생 컨트롤)
- [ ] Supabase 의존성 제거 → localStorage 또는 in-memory
- [ ] ai-studio 전용 컴포넌트(wecut, platform, admin) 제외

### Phase 2: vibemotion 연동
- [ ] /editor 라우트 추가
- [ ] AI 코드 생성 → Series 씬 자동 분해 → 타임라인 클립 변환
  - Series.Sequence → 개별 클립 아이템
  - 각 클립이 독립 Remotion 컴포넌트
- [ ] 클립 선택 → 채팅 사이드바에서 "이 클립만 수정" 프롬프트
- [ ] 오버레이 기능: 텍스트/이미지를 기존 클립 위에 레이어

### Phase 3: 고급 기능
- [ ] 클립 간 트랜지션 (fade/slide/wipe)
- [ ] 원본 영상 import → 위에 모션그래픽 오버레이
- [ ] 렌더링 (MP4 출력)

---

## 우선순위
1. 예제 코드 20개 (즉시, 1~2일)
2. 에디터 Phase 1: 코어 추출 (3~5일)
3. 에디터 Phase 2: vibemotion 연동 (3~5일)
4. 에디터 Phase 3: 고급 기능 (추후)
