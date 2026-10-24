// Merges every src/data/mathcode/<lesson>.ts file exporting `mathcode`.
import type { MathCode } from './types';
export type { MathCode, MathCodeTerm } from './types';

const modules = import.meta.glob<{ mathcode: Record<string, MathCode> }>(['./*.ts', '!./index.ts', '!./types.ts'], { eager: true });
export const mathcodes: Record<string, MathCode> = {};
for (const [path, mod] of Object.entries(modules)) {
  if (!mod.mathcode) continue;
  for (const [id, m] of Object.entries(mod.mathcode)) {
    if (mathcodes[id]) throw new Error(`Duplicate mathcode id "${id}" in ${path}`);
    mathcodes[id] = m;
  }
}
