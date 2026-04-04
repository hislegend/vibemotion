/**
 * milliseconds를 MM:SS.mmm 형식의 시간 문자열로 변환
 * @param ms - milliseconds 단위의 시간
 * @returns MM:SS.mmm 형식의 시간 문자열
 */
export function millisecondsToTimeString(ms: number): string {
	const totalSeconds = ms / 1000;
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);
	const milliseconds = Math.round(ms % 1000);

	const minutesString = minutes.toString().padStart(2, '0');
	const secondsString = seconds.toString().padStart(2, '0');
	const millisecondsString = milliseconds.toString().padStart(3, '0');

	return `${minutesString}:${secondsString}.${millisecondsString}`;
}

/**
 * MM:SS.mmm 형식의 시간 문자열을 milliseconds로 다시 파싱
 * @param timeString - MM:SS.mmm 형식의 시간 문자열
 * @returns milliseconds 단위의 시간, 또는 잘못된 형식인 경우 null
 */
export function timeStringToMilliseconds(timeString: string): number | null {
	// MM:SS.mmm 형식과 매치 (분과 초는 2자리, milliseconds는 3자리 필요)
	const match = timeString.match(/^(\d{2}):(\d{2})\.(\d{3})$/);

	if (!match) {
		return null;
	}

	const minutes = parseInt(match[1], 10);
	const seconds = parseInt(match[2], 10);
	const milliseconds = parseInt(match[3], 10);

	// 범위 유효성 검사
	if (seconds >= 60 || milliseconds >= 1000) {
		return null;
	}

	return minutes * 60 * 1000 + seconds * 1000 + milliseconds;
}
