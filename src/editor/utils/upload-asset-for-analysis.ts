// Stub: Local asset analysis (no Supabase)
export async function uploadAssetForAnalysis(file: File): Promise<string> {
  return URL.createObjectURL(file);
}
