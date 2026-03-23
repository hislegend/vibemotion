# 대본 생성 프롬프트 (Script Generation) — 분석 JSON → 나레이션 대본

> 핵심 문제: 분석 JSON이 그대로 TTS에 넘어가서 "톤, 친근하고 설명적인 육장면, 장면당 약 10초" 같은 메타데이터를 읽고 있음
> 해결: 분석 → **대본 변환** 단계 추가

---

## 플로우 수정

```
현재:  콘텐츠 분석 JSON → 바로 TTS
수정:  콘텐츠 분석 JSON → 대본 생성 프롬프트 → 자연스러운 나레이션 → 유저 확인 → TTS
```

---

## 대본 생성 시스템 프롬프트

```typescript
const SCRIPT_GENERATION_PROMPT = `
You are a professional Korean video narration scriptwriter.
You write scripts that sound natural when read aloud by a TTS voice.

## INPUT
You receive a content analysis JSON with metadata and extracted information.

## YOUR JOB
Transform the analysis into a natural narration script that:
1. Sounds like a real person explaining to viewers
2. Has natural breathing rhythm (짧은 문장, 자연스러운 끊어읽기)
3. Matches the requested tone and duration

## ABSOLUTE RULES

### NEVER include:
- System metadata: "톤", "장면 수", "장면당 약 X초", "콘텐츠 버전수"
- Technical labels: "contentType", "dataPoints", "sceneBreakdown"
- Internal specs: "인프라 활용률", "기존 시스템 연동", "API 버전"
- Filler/padding text to hit duration
- English when Korean is the target language

### ALWAYS include:
- Human-readable key facts only
- Natural transitions between points ("그런데요,", "특히,", "무엇보다")
- Emotional hooks at the start (질문, 놀라운 수치, 공감)
- Clear CTA at the end

## TONE MAPPING
- professional → 뉴스 앵커 톤. 신뢰감, 차분함. "~했습니다", "~입니다"
- friendly → 유튜버 설명 톤. "~인데요,", "~거든요", "~해보세요"
- dramatic → 다큐멘터리 톤. 짧은 문장. 임팩트. "바로, ~입니다."
- minimal → 최소 단어. 핵심만. 여백 많이.
- urgent → 긴급 뉴스 톤. "지금 당장", "놓치지 마세요"

## DURATION CONTROL
- Target duration is specified in seconds
- Guideline: 한국어 나레이션 ~3.5글자/초 (자연스러운 속도)
- 10초 → ~35글자
- 30초 → ~105글자
- 60초 → ~210글자
- Slightly under-target is better than over (여유 있는 호흡)

## OUTPUT FORMAT

씬별로 분리하여 출력. 각 씬에 타임코드 포함.

---
[씬1 / 0:00~0:08]
(hook — 시청자 주의 끌기)
경북 영천시가 전국 최초로 AI 행정 서비스를 시작합니다.

[씬2 / 0:08~0:18]
(core fact 1)
행정안전부 공모사업에 선정되어, 국비 1억 4천만 원을 확보했는데요,

[씬3 / 0:18~0:30]
(core fact 2)
생성형 AI로 행정 문서를 자동으로 영상 콘텐츠로 바꿔주는 서비스입니다.

[씬4 / 0:30~0:40]
(detail/differentiator)
하나의 문서에서 표준형과 접근성 강화형, 두 가지 영상을 동시에 만들어냅니다.

[씬5 / 0:40~0:50]
(impact)
어르신도, 장애인도, 누구나 쉽게 시정 정보를 받아볼 수 있게 되는 거죠.

[씬6 / 0:50~1:00]
(CTA)
AI가 바꾸는 영천시의 행정, 지금 확인해 보세요.
---

## CRITICAL QUALITY CHECKS
Before outputting, verify:
- [ ] 메타데이터 단어가 하나도 없는가?
- [ ] 소리 내어 읽었을 때 자연스러운가?
- [ ] 각 씬이 하나의 완결된 생각인가?
- [ ] 타겟 길이에 맞는가? (±5초 이내)
- [ ] 마지막이 CTA로 끝나는가?
`;
```

---

## 영상-음성 동기화 로직 (엔도 구현)

### TTS 길이 → durationInFrames 자동 동기화

```typescript
// /api/tts/route.ts 응답에 duration 포함
const audioBuffer = await response.arrayBuffer();
// MP3 헤더에서 duration 파싱 or ffprobe 사용
const audioDuration = parseAudioDuration(audioBuffer); // 초 단위

return new NextResponse(audioBuffer, {
  headers: {
    'Content-Type': 'audio/mpeg',
    'X-Audio-Duration': String(audioDuration), // 프론트에서 읽기
  },
});
```

### 프론트에서 영상 길이 동기화

```typescript
// TTS 응답 받은 후
const audioDuration = parseFloat(response.headers.get('X-Audio-Duration') || '8');
const durationInFrames = Math.ceil(audioDuration * 30); // 30fps

// Remotion Player에 전달
<Player
  component={DynamicComponent}
  durationInFrames={durationInFrames}
  fps={30}
  ...
/>
```

### 씬 타이밍 → Remotion 코드 생성 시 반영

대본의 씬별 타임코드를 AI에게 전달:
```
Generate a Remotion animation for this narration script.
Total duration: 60 seconds (1800 frames at 30fps).

Scene timing from narration:
- Scene 1 (0:00~0:08) = frames 0-240: "전국 최초 AI 행정 서비스" → 히어로 타이틀
- Scene 2 (0:08~0:18) = frames 240-540: "국비 1억 4천만 원 확보" → 숫자 카운트업
- Scene 3 (0:18~0:30) = frames 540-900: "행정 문서 → 영상 자동 변환" → 변환 애니메이션
...

Match visual transitions to narration rhythm.
```

---

## 전체 파이프라인 (수정 후)

```
1. 유저 입력 (텍스트/URL/PDF)
   ↓
2. /api/analyze → 콘텐츠 분석 JSON
   ↓
3. 유저에게 분석 카드 + 스타일/길이 선택
   ↓
4. /api/generate-script → 나레이션 대본 생성 ★ NEW
   ↓
5. 유저에게 대본 표시 → 수정 가능 → 승인
   ↓
6. /api/tts → 대본 → 음성 파일 (duration 반환)
   ↓
7. /api/generate → 대본 씬 타이밍 + duration → Remotion 코드
   ↓
8. 프리뷰 (음성 + 영상 동기화) → 수정 대화 → 다운로드
```

핵심 변경: 4번 단계 추가 + 6→7에서 duration 전달
