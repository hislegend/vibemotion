export interface TextStylePreset {
  id: string;
  name: string;
  description?: string;
  category?: string;
  fontSize: number;
  fontWeight?: number;
  [key: string]: unknown;
}
export interface CompositeTextTemplate {
  id: string;
  name: string;
  layers: TextStylePreset[];
}
