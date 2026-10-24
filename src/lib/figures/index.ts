// Merges every src/lib/figures/<topic>.ts file exporting `figures`.
// Each figure is a function computed at build time from tested model code.
import type { FigureSpec } from './types';
export type { FigureSpec } from './types';

const modules = import.meta.glob<{ figures: Record<string, () => FigureSpec> }>(['./*.ts', '!./index.ts', '!./types.ts'], { eager: true });
const registry: Record<string, () => FigureSpec> = {};
for (const [path, mod] of Object.entries(modules)) {
  if (!mod.figures) continue;
  for (const [id, f] of Object.entries(mod.figures)) {
    if (registry[id]) throw new Error(`Duplicate figure id "${id}" in ${path}`);
    registry[id] = f;
  }
}

export function figureSpec(id: string): FigureSpec {
  const f = registry[id];
  if (!f) throw new Error(`Unknown figure "${id}". Known: ${Object.keys(registry).join(', ')}`);
  return f();
}
