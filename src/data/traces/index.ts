// Merges every src/data/traces/<lesson>.ts file exporting `traces`.
import type { Trace } from './types';
export type { Trace, TraceStep } from './types';

const modules = import.meta.glob<{ traces: Record<string, Trace> }>(['./*.ts', '!./index.ts', '!./types.ts'], { eager: true });
export const traces: Record<string, Trace> = {};
for (const [path, mod] of Object.entries(modules)) {
  if (!mod.traces) continue;
  for (const [id, t] of Object.entries(mod.traces)) {
    if (traces[id]) throw new Error(`Duplicate trace id "${id}" in ${path}`);
    traces[id] = t;
  }
}
