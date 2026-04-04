export async function extractFrames(_file: File): Promise<string[]> { return []; }

export async function extractFrameAtTime(_url: string, _time: number): Promise<string> { return ''; }
export async function getVideoMetadata(_url: string): Promise<{ duration: number; width: number; height: number }> {
  return { duration: 0, width: 1920, height: 1080 };
}
