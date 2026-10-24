// Validates the atlas graph, the manual coverage and the lesson collection.
// Runs before every production build (npm run build) and in CI.
//
//   node --experimental-strip-types scripts/validate-curriculum.ts [--graph-only]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { validateCurriculum, type LessonSource } from '../src/lib/validation/curriculum.ts';

const graphOnly = process.argv.includes('--graph-only');
const dir = join(import.meta.dirname, '..', 'src', 'content', 'lessons');

let lessons: LessonSource[] = [];
try {
  lessons = readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((file) => {
      const source = readFileSync(join(dir, file), 'utf8');
      const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
      const data = fm ? (parse(fm[1]) ?? {}) : {};
      return { slug: file.replace(/\.mdx?$/, ''), source, manual: Array.isArray(data.manual) ? data.manual : [] };
    });
} catch {
  lessons = [];
}

const report = validateCurriculum(lessons);
let errors = report.errors;
if (graphOnly) errors = errors.filter((e) => !/lesson|anchor/.test(e));

for (const w of report.warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
console.log(`curriculum: ${lessons.length} lessons checked, ${errors.length} errors, ${report.warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
