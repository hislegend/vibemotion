export interface AutoEditResult { items: any[]; }
export type AutoEditConfig = Record<string, unknown>;
export type AutoEditStyle = 'modern' | 'classic' | 'minimal' | 'dynamic' | 'cta';
export const STYLE_TRANSITION_DURATIONS: Record<AutoEditStyle, number> = {
  modern: 15,
  classic: 20,
  minimal: 10,
  dynamic: 12,
  cta: 18,
};
