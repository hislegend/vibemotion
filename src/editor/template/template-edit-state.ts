import { createContext, useContext } from 'react';
import { CompositeTextTemplate, TextLayerConfig } from '@/types/text-style-preset';

export interface TemplateEditState {
  active: boolean;
  editingTemplateId: string | null; // null이면 새 템플릿 생성
  templateName: string;
  layers: TextLayerConfig[];
}

export const initialTemplateEditState: TemplateEditState = {
  active: false,
  editingTemplateId: null,
  templateName: '',
  layers: [],
};

export interface TemplateEditContextValue {
  state: TemplateEditState;
  enterCreateMode: () => void;
  enterEditMode: (template: CompositeTextTemplate) => void;
  exitEditMode: () => void;
  updateTemplateName: (name: string) => void;
  addLayer: (layer: TextLayerConfig) => void;
  updateLayer: (layerId: string, updates: Partial<TextLayerConfig>) => void;
  removeLayer: (layerId: string) => void;
  saveTemplate: () => CompositeTextTemplate | null;
}

export const TemplateEditContext = createContext<TemplateEditContextValue | null>(null);

export function useTemplateEditContext() {
  const context = useContext(TemplateEditContext);
  if (!context) {
    throw new Error('useTemplateEditContext must be used within TemplateEditProvider');
  }
  return context;
}
