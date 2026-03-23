# Skill Detection Prompt v2 — 최대 2개 제한

## 변경 포인트
1. 스킬 감지 후 **최대 2개만 주입** (현재: 무제한)
2. 가이던스 스킬 우선, 예제는 가장 관련 높은 1개만
3. 영상 교훈: "컨텍스트가 적을수록 AI가 자유롭게 창작"

## 코드 변경 위치: `src/app/api/generate/route.ts`

### Before (현재)
```typescript
// 감지된 스킬 전부 주입
const skillContent = getCombinedSkillContent(newSkills as SkillName[]);
```

### After (제안)
```typescript
// 최대 2개만: 가이던스 1개 + 예제 1개
const MAX_GUIDANCE_SKILLS = 1;
const MAX_EXAMPLE_SKILLS = 1;

const guidanceSkills = newSkills.filter(s => !s.startsWith('example-'));
const exampleSkills = newSkills.filter(s => s.startsWith('example-'));

const selectedSkills = [
  ...guidanceSkills.slice(0, MAX_GUIDANCE_SKILLS),
  ...exampleSkills.slice(0, MAX_EXAMPLE_SKILLS),
];

const skillContent = getCombinedSkillContent(selectedSkills as SkillName[]);
```

## 스킬 감지 프롬프트 수정
기존 프롬프트 끝에 추가:
```
IMPORTANT: Return at most 2 categories — pick the single most relevant guidance category and the single most relevant example. Quality over quantity.
```
