import { CompositeTextTemplate } from '@/types/text-style-preset';

const CUSTOM_TEMPLATES_KEY = 'editor_custom_text_templates';

/**
 * 커스텀 템플릿 저장
 */
export function saveCustomTemplate(template: CompositeTextTemplate): void {
  const existing = loadCustomTemplates();
  const updated = [...existing.filter(t => t.id !== template.id), template];
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save custom template:', error);
  }
}

/**
 * 커스텀 템플릿 목록 불러오기
 */
export function loadCustomTemplates(): CompositeTextTemplate[] {
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load custom templates:', error);
    return [];
  }
}

/**
 * 커스텀 템플릿 삭제
 */
export function deleteCustomTemplate(templateId: string): void {
  const existing = loadCustomTemplates();
  const updated = existing.filter(t => t.id !== templateId);
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete custom template:', error);
  }
}

/**
 * 모든 커스텀 템플릿 삭제
 */
export function clearAllCustomTemplates(): void {
  try {
    localStorage.removeItem(CUSTOM_TEMPLATES_KEY);
  } catch (error) {
    console.error('Failed to clear custom templates:', error);
  }
}

/**
 * 고유 템플릿 ID 생성
 */
export function generateTemplateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 템플릿 복제
 */
export function duplicateCustomTemplate(templateId: string): CompositeTextTemplate | null {
  const templates = loadCustomTemplates();
  const original = templates.find(t => t.id === templateId);
  if (!original) return null;
  
  const duplicated: CompositeTextTemplate = {
    ...original,
    id: generateTemplateId(),
    name: `${original.name} (복사본)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    layers: original.layers.map(layer => ({
      ...layer,
      id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    })),
  };
  
  saveCustomTemplate(duplicated);
  return duplicated;
}
