import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutTemplate, Clock, Check } from 'lucide-react';
import { VIRAL_TEMPLATES, ViralTemplate } from '../../../types/viral-template';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  onSelectTemplate: (template: ViralTemplate) => void;
  isApplying?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  isApplying = false,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleSelect = (template: ViralTemplate) => {
    setSelectedTemplateId(template.id);
  };

  const handleApply = () => {
    const template = VIRAL_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (template) {
      onSelectTemplate(template);
    }
  };

  const getCategoryColor = (category: ViralTemplate['category']) => {
    switch (category) {
      case 'ad':
        return 'bg-blue-500/20 text-blue-400';
      case 'story':
        return 'bg-purple-500/20 text-purple-400';
      case 'review':
        return 'bg-green-500/20 text-green-400';
      case 'tutorial':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStyleLabel = (style: ViralTemplate['style']) => {
    switch (style) {
      case 'minimal':
        return '미니멀';
      case 'dynamic':
        return '다이나믹';
      case 'cinematic':
        return '시네마틱';
      default:
        return style;
    }
  };

  return (
    <div className="space-y-3">
      <ScrollArea className="h-[280px] pr-2">
        <div className="grid grid-cols-2 gap-2">
          {VIRAL_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={cn(
                'relative p-3 rounded-lg border cursor-pointer transition-all',
                'hover:border-primary/50 hover:bg-accent/50',
                selectedTemplateId === template.id
                  ? 'border-primary bg-accent'
                  : 'border-border bg-card'
              )}
              onClick={() => handleSelect(template)}
            >
              {/* 선택 표시 */}
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}

              {/* 카테고리 배지 */}
              <Badge className={cn('text-[10px] mb-2', getCategoryColor(template.category))}>
                {template.category.toUpperCase()}
              </Badge>

              {/* 템플릿 이름 */}
              <h4 className="text-sm font-medium mb-1">{template.nameKr}</h4>

              {/* 설명 */}
              <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">
                {template.description}
              </p>

              {/* 메타 정보 */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{template.totalDurationTarget}초</span>
                </div>
                <span>•</span>
                <span>{getStyleLabel(template.style)}</span>
              </div>

              {/* 구조 미니 시각화 */}
              <div className="flex gap-0.5 mt-2 h-1.5 rounded-full overflow-hidden">
                {template.structure.map((section, idx) => (
                  <div
                    key={idx}
                    className={cn('h-full', getSectionColor(section.type))}
                    style={{ flex: section.durationRatio }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* 적용 버튼 */}
      <Button
        onClick={handleApply}
        disabled={!selectedTemplateId || isApplying}
        className="w-full"
        size="sm"
      >
        <LayoutTemplate className="w-4 h-4 mr-2" />
        {isApplying ? '적용 중...' : '템플릿 적용'}
      </Button>
    </div>
  );
};

// 세그먼트 타입별 색상
function getSectionColor(type: string): string {
  switch (type) {
    case 'hook':
      return 'bg-red-500';
    case 'feature':
      return 'bg-blue-500';
    case 'demo':
      return 'bg-green-500';
    case 'cta':
      return 'bg-yellow-500';
    case 'testimonial':
      return 'bg-purple-500';
    case 'broll':
      return 'bg-gray-500';
    default:
      return 'bg-muted';
  }
}
