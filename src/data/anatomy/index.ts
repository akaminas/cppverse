// Merges every src/data/anatomy/<lesson>.ts file exporting `anatomies`.
import type { Anatomy } from './types';
export type { Anatomy, AnatomyPart } from './types';

const modules = import.meta.glob<{ anatomies: Record<string, Anatomy> }>(['./*.ts', '!./index.ts', '!./types.ts'], { eager: true });
export const anatomies: Record<string, Anatomy> = {};
for (const [path, mod] of Object.entries(modules)) {
  if (!mod.anatomies) continue;
  for (const [id, a] of Object.entries(mod.anatomies)) {
    if (anatomies[id]) throw new Error(`Duplicate anatomy id "${id}" in ${path}`);
    anatomies[id] = a;
  }
}
