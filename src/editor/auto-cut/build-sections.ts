// Phase 2: 자동 컷 편집 엔진 - buildSections 함수
// CuttingRules를 기반으로 VideoSegmentAnalysis에서 최종 CutSection[] 생성

import {
	VideoSegmentAnalysis,
	VideoSegment,
	CuttingRules,
	CutSection,
	SegmentLabel,
	DEFAULT_CUTTING_RULES,
} from '@/types/video-segment';

/**
 * 분석 결과와 컷팅 룰을 기반으로 최종 컷 섹션을 생성합니다.
 * 
 * @param analysis - AI가 분석한 영상 Segment 정보
 * @param rules - 적용할 컷팅 룰 (기본값: DEFAULT_CUTTING_RULES)
 * @returns 타임라인에 적용할 CutSection 배열
 */
export function buildSections(
	analysis: VideoSegmentAnalysis,
	rules: CuttingRules = DEFAULT_CUTTING_RULES
): CutSection[] {
	const { segments, duration } = analysis;
	
	if (!segments || segments.length === 0) {
		console.warn('[buildSections] 분석된 Segment가 없습니다.');
		return [];
	}

	// 1. 기본 필터링: 제거할 라벨 필터링
	let filteredSegments = segments.filter(seg => {
		// removeLabels에 포함된 라벨 제거
		if (rules.removeLabels.includes(seg.label as SegmentLabel)) {
			return false;
		}
		
		// 어흠/말 더듬 제거 옵션
		if (rules.removeUhmPauses && seg.label === 'uhm') {
			return false;
		}
		
		// 침묵 구간 제거 (threshold 이상인 경우)
		if (seg.label === 'silence') {
			const silenceDuration = seg.end - seg.start;
			if (silenceDuration >= rules.removeSilenceThreshold) {
				return false;
			}
		}
		
		return true;
	});

	// 2. 최소 점수 필터링
	filteredSegments = filteredSegments.filter(seg => 
		seg.score >= rules.minScoreThreshold
	);

	// 3. 앞뒤 트리밍 적용
	filteredSegments = filteredSegments.map((seg, index) => {
		let { start, end } = seg;
		
		// 첫 번째 Segment: 앞 트리밍
		if (index === 0) {
			start = Math.max(0, start + rules.trimFrontSeconds);
		}
		
		// 마지막 Segment: 뒤 트리밍
		if (index === filteredSegments.length - 1) {
			end = Math.max(start + 0.1, end - rules.trimEndSeconds);
		}
		
		return { ...seg, start, end };
	});

	// 4. keep=true인 Segment 우선 선택
	const keepSegments = filteredSegments.filter(seg => seg.keep);
	const maybeSegments = filteredSegments.filter(seg => !seg.keep);

	// 5. 목표 길이가 있으면 score 높은 순으로 채우기
	let resultSegments: VideoSegment[] = [];
	
	if (rules.targetDurationSeconds) {
		// score 높은 순으로 정렬
		const sortedByScore = [...keepSegments].sort((a, b) => b.score - a.score);
		
		let currentDuration = 0;
		
		for (const seg of sortedByScore) {
			const segDuration = seg.end - seg.start;
			if (currentDuration + segDuration <= rules.targetDurationSeconds) {
				resultSegments.push(seg);
				currentDuration += segDuration;
			}
		}
		
		// keep=true로 목표 길이 미달시 maybe Segment 추가
		if (currentDuration < rules.targetDurationSeconds) {
			const sortedMaybe = [...maybeSegments].sort((a, b) => b.score - a.score);
			
			for (const seg of sortedMaybe) {
				const segDuration = seg.end - seg.start;
				if (currentDuration + segDuration <= rules.targetDurationSeconds) {
					resultSegments.push(seg);
					currentDuration += segDuration;
				}
			}
		}
		
		// 시간 순서대로 재정렬
		resultSegments.sort((a, b) => a.start - b.start);
	} else {
		// 목표 길이 없으면 keep=true인 것만 사용
		resultSegments = keepSegments.length > 0 ? keepSegments : filteredSegments;
		resultSegments.sort((a, b) => a.start - b.start);
	}

	// 6. CutSection 형태로 변환
	const cutSections: CutSection[] = resultSegments.map(seg => ({
		start: seg.start,
		end: seg.end,
		durationInSeconds: seg.end - seg.start,
		label: seg.label as SegmentLabel,
		score: seg.score,
		keep: seg.keep,
	}));

	console.log(`[buildSections] 총 ${segments.length}개 중 ${cutSections.length}개 섹션 선택됨`);
	
	return cutSections;
}

/**
 * 컷 섹션의 총 길이를 계산합니다.
 */
export function calculateTotalDuration(sections: CutSection[]): number {
	return sections.reduce((total, sec) => total + sec.durationInSeconds, 0);
}

/**
 * 목표 길이에 맞게 섹션을 조정합니다.
 */
export function adjustToTargetDuration(
	sections: CutSection[],
	targetSeconds: number
): CutSection[] {
	const currentDuration = calculateTotalDuration(sections);
	
	if (currentDuration <= targetSeconds) {
		return sections;
	}
	
	// score 높은 순으로 정렬 후 목표 길이까지만 선택
	const sortedByScore = [...sections].sort((a, b) => b.score - a.score);
	const result: CutSection[] = [];
	let accumulatedDuration = 0;
	
	for (const section of sortedByScore) {
		if (accumulatedDuration + section.durationInSeconds <= targetSeconds) {
			result.push(section);
			accumulatedDuration += section.durationInSeconds;
		}
	}
	
	// 시간 순서대로 재정렬
	return result.sort((a, b) => a.start - b.start);
}
