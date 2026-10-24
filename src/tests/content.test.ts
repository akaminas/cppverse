// Consistency of hand-written lesson data with the C++ example programs.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..', '..');
const examples = join(root, 'cpp-examples');

async function loadRegistry<T>(dir: string, key: string): Promise<Record<string, T>> {
  const out: Record<string, T> = {};
  const folder = join(root, 'src', dir);
  for (const f of readdirSync(folder)) {
    if (!f.endsWith('.ts') || f === 'index.ts' || f === 'types.ts') continue;
    const mod = await import(join(folder, f));
    Object.assign(out, mod[key] ?? {});
  }
  return out;
}

interface TraceLike {
  file?: string;
  steps: { line: number; out?: string }[];
}

describe('step-through traces', async () => {
  const traces = await loadRegistry<TraceLike>('data/traces', 'traces');
  it('the trace registry loads', () => expect(typeof traces).toBe('object'));
  for (const [id, t] of Object.entries(traces)) {
    it(`trace "${id}" refers to valid lines`, () => {
      const code = t.file ? readFileSync(join(examples, t.file), 'utf8') : '';
      const lines = code.split('\n').length;
      for (const s of t.steps) {
        expect(s.line).toBeGreaterThanOrEqual(1);
        if (t.file) expect(s.line).toBeLessThanOrEqual(lines);
      }
    });
    if (t.file && existsSync(join(examples, t.file.replace(/\.cpp$/, '.out')))) {
      it(`trace "${id}" prints exactly what the program prints`, () => {
        const expected = readFileSync(join(examples, t.file!.replace(/\.cpp$/, '.out')), 'utf8').replace(/\r\n/g, '\n');
        expect(t.steps.map((s) => s.out ?? '').join('')).toBe(expected);
      });
    }
  }
});

describe('example programs', () => {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d, { withFileTypes: true })) {
      if (f.isDirectory()) walk(join(d, f.name));
      else if (f.name.endsWith('.cpp')) files.push(join(d, f.name));
    }
  };
  walk(examples);
  it.each(files.map((f) => [f.slice(examples.length + 1).split(String.fromCharCode(92)).join('/')]))('%s declares a title and a standard', (rel) => {
    const code = readFileSync(join(examples, rel), 'utf8');
    expect(code).toMatch(/^\/\/\s*Title:/m);
    expect(code).toMatch(/^\/\/\s*Standard:\s*C\+\+(17|20|23)/m);
    expect(code).not.toMatch(/using namespace std/);
  });
});
