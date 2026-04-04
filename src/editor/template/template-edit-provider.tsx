import React, { useState, useCallback, useMemo } from 'react';
import { CompositeTextTemplate, TextLayerConfig } from '@/types/text-style-preset';
import {
  TemplateEditContext,
  TemplateEditState,
  TemplateEditContextValue,
  initialTemplateEditState,
} from './template-edit-state';
import { generateTemplateId, saveCustomTemplate, loadCustomTemplates } from '../utils/template-storage';

interface TemplateEditProviderProps {
  children: React.ReactNode;
  onTemplatesSaved?: () => void;
}

export const TemplateEditProvider: React.FC<TemplateEditProviderProps> = ({
  children,
  onTemplatesSaved,
}) => {
  const [state, setState] = useState<TemplateEditState>(initialTemplateEditState);

  const enterCreateMode = useCallback(() => {
    setState({
      active: true,
      editingTemplateId: null,
      templateName: '새 템플릿',
      layers: [],
    });
  }, []);

  const enterEditMode = useCallback((template: CompositeTextTemplate) => {
    const isBuiltIn = !template.id.startsWith('custom-');
    
    let editId = template.id;
    let editName = template.name;
    let editLayers = template.layers;
    
    if (isBuiltIn) {
      // 이 내장 템플릿을 기반으로 이미 만들어진 커스텀 버전이 있는지 확인
      const customTemplates = loadCustomTemplates();
      const existingCustom = customTemplates.find(
        t => t.name === `${template.name} (편집됨)` || 
             (t.name === template.name && t.isCustom)
      );
      
      if (existingCustom) {
        // 기존 커스텀 버전을 편집
        editId = existingCustom.id;
        editName = existingCustom.name;
        editLayers = existingCustom.layers;
      } else {
        // 새 커스텀 버전 생성
        editId = generateTemplateId();
        editName = `${template.name} (편집됨)`;
      }
    }
    
    setState({
      active: true,
      editingTemplateId: editId,
      templateName: editName,
      layers: editLayers.map(layer => ({ ...layer })), // deep copy
    });
  }, []);

  const exitEditMode = useCallback(() => {
    setState(initialTemplateEditState);
  }, []);

  const updateTemplateName = useCallback((name: string) => {
    setState(prev => ({ ...prev, templateName: name }));
  }, []);

  const addLayer = useCallback((layer: TextLayerConfig) => {
    setState(prev => ({
      ...prev,
      layers: [...prev.layers, layer],
    }));
  }, []);

  const updateLayer = useCallback((layerId: string, updates: Partial<TextLayerConfig>) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      ),
    }));
  }, []);

  const removeLayer = useCallback((layerId: string) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.filter(layer => layer.id !== layerId),
    }));
  }, []);

  const saveTemplate = useCallback((): CompositeTextTemplate | null => {
    if (!state.templateName.trim() || state.layers.length === 0) {
      return null;
    }

    // enterEditMode에서 이미 커스텀 ID가 할당됨 (내장이든 커스텀이든)
    // 따라서 여기서는 단순히 editingTemplateId를 사용하면 됨
    const template: CompositeTextTemplate = {
      id: state.editingTemplateId || generateTemplateId(),
      name: state.templateName.trim(),
      category: 'custom',
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      layers: state.layers,
    };

    saveCustomTemplate(template);
    onTemplatesSaved?.();
    exitEditMode();
    return template;
  }, [state, exitEditMode, onTemplatesSaved]);

  const value = useMemo<TemplateEditContextValue>(
    () => ({
      state,
      enterCreateMode,
      enterEditMode,
      exitEditMode,
      updateTemplateName,
      addLayer,
      updateLayer,
      removeLayer,
      saveTemplate,
    }),
    [state, enterCreateMode, enterEditMode, exitEditMode, updateTemplateName, addLayer, updateLayer, removeLayer, saveTemplate]
  );

  return (
    <TemplateEditContext.Provider value={value}>
      {children}
    </TemplateEditContext.Provider>
  );
};
