export interface ViralTemplate { id: string; name: string; scenes: any[]; }
export type TextStylePreset = Record<string, any>;
export const TEXT_STYLE_PRESETS: Record<string, TextStylePreset> = {
  title: { fontSize: 72, fontWeight: 900 },
  subtitle: { fontSize: 48, fontWeight: 600 },
  body: { fontSize: 36, fontWeight: 400 },
  cta: { fontSize: 56, fontWeight: 800 },
};
