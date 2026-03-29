const STORAGE_KEY = "vibemotion_projects";

export interface Project {
  id: string;
  title: string;
  prompt: string;
  code: string;
  model: string;
  aspectRatio: string;
  duration: number; // seconds
  voiceAudioUrl?: string;
  createdAt: number;
  updatedAt: number;
}

function readAll(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(projects: Project[]) {
  // Keep only latest 20 projects to avoid localStorage quota
  const trimmed = projects.slice(0, 20);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    // Quota exceeded — remove oldest projects and retry
    const minimal = trimmed.slice(0, 10);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
    } catch {
      // Still fails — clear all
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export function saveProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt">,
): Project {
  const now = Date.now();
  const project: Project = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  const projects = readAll();
  projects.push(project);
  writeAll(projects);
  return project;
}

export function updateProject(
  id: string,
  updates: Partial<Project>,
): Project | null {
  const projects = readAll();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...updates, updatedAt: Date.now() };
  writeAll(projects);
  return projects[idx];
}

export function getProjects(): Project[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProject(id: string): Project | null {
  return readAll().find((p) => p.id === id) ?? null;
}

export function deleteProject(id: string): void {
  writeAll(readAll().filter((p) => p.id !== id));
}

export function renameProject(id: string, title: string): void {
  updateProject(id, { title });
}

export function generateTitle(prompt: string): string {
  // Check for template-based prompts
  const templateMatch = prompt.match(/^"(.+?)"\s*템플릿\s*기반으로/);
  if (templateMatch) return templateMatch[1];

  // Take first 30 chars of prompt
  const trimmed = prompt.trim().slice(0, 30);
  return trimmed + (prompt.trim().length > 30 ? "…" : "");
}
