const STORAGE_KEY = "vibemotion_templates";

export interface SavedTemplate {
  id: string;
  name: string;
  description: string;
  code: string; // React/Remotion 코드 (그대로 렌더링 가능)
  aspectRatio: string;
  durationInFrames: number;
  fps: number;
  thumbnail?: string; // base64 screenshot
  createdAt: number;
}

function readAll(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(templates: SavedTemplate[]) {
  const trimmed = templates.slice(0, 20);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Quota exceeded — keep only 5
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed.slice(0, 5)));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export function saveTemplate(
  data: Omit<SavedTemplate, "id" | "createdAt">,
): SavedTemplate {
  const template: SavedTemplate = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const templates = readAll();
  templates.push(template);
  writeAll(templates);
  return template;
}

export function getTemplates(): SavedTemplate[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function getTemplate(id: string): SavedTemplate | null {
  return readAll().find((t) => t.id === id) ?? null;
}

export function deleteTemplate(id: string): void {
  writeAll(readAll().filter((t) => t.id !== id));
}

export function renameTemplate(id: string, name: string): void {
  const templates = readAll();
  const idx = templates.findIndex((t) => t.id === id);
  if (idx !== -1) {
    templates[idx].name = name;
    writeAll(templates);
  }
}
