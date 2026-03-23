/**
 * 내레이션 스크립트에서 [씬N] 마커를 제거하고 자연스러운 텍스트로 합칩니다.
 */
export function stripSceneMarkers(script: string): string {
  return script
    .split("\n")
    .filter((line) => !/^\[씬\d+\]$/.test(line.trim()))
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(" ");
}
