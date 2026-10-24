// The auditable mapping from every section of the Groningen manual to the
// atlas and the lessons. Used by the Sources page and by
// scripts/generate-coverage.ts (docs/STUDENT_MANUAL_COVERAGE.md), so both
// always agree with the data.
import { concepts } from '../data/concepts.ts';
import { manualSections } from '../data/manual.ts';
import type { ManualSection } from '../data/types.ts';

export type CoverageStatus = 'implemented' | 'partial' | 'pending' | 'excluded';

export interface CoverageRow {
  section: ManualSection;
  nodes: { id: string; title: string; level: string; lesson?: string; anchor?: string }[];
  lessons: string[];
  status: CoverageStatus;
  validation: string;
}

/**
 * @param existingLessons slugs of lessons that exist on disk
 * @param lessonFacts per lesson: does it embed compiled C++ examples, checks, figures or labs?
 */
export function coverageRows(
  existingLessons: ReadonlySet<string>,
  lessonFacts: Record<string, { examples: number; checks: number; figures: number; labs: number }> = {},
): CoverageRow[] {
  return manualSections.map((section) => {
    if (section.kind === 'excluded') {
      return { section, nodes: [], lessons: [], status: 'excluded', validation: section.exclusionReason ?? 'Excluded' };
    }
    const nodes = concepts
      .filter((c) => c.manual.includes(section.id))
      .map((c) => ({ id: c.id, title: c.title, level: c.level, lesson: c.lesson, anchor: c.anchor }));
    const lessons = [...new Set(nodes.map((n) => n.lesson).filter((l): l is string => Boolean(l)))];
    const present = lessons.filter((l) => existingLessons.has(l));
    const status: CoverageStatus = lessons.length === 0 ? (nodes.length ? 'implemented' : 'pending') : present.length === lessons.length ? 'implemented' : present.length ? 'partial' : 'pending';
    const facts = present.map((l) => lessonFacts[l]).filter(Boolean);
    const ex = facts.reduce((s, f) => s + f.examples, 0);
    const ch = facts.reduce((s, f) => s + f.checks, 0);
    const fig = facts.reduce((s, f) => s + f.figures + f.labs, 0);
    const parts = ['graph and anchors validated at build'];
    if (ex) parts.push(`${ex} C++ example${ex > 1 ? 's' : ''} compiled and run in CI`);
    if (ch) parts.push(`${ch} knowledge check${ch > 1 ? 's' : ''}`);
    if (fig) parts.push(`${fig} computed figure${fig > 1 ? 's' : ''} or laboratory`);
    if (lessons.length === 0 && nodes.length) parts.push('covered by a destination page');
    return { section, nodes, lessons, status, validation: status === 'pending' ? 'Lesson not yet written' : parts.join('; ') };
  });
}

/** Facts about a lesson's source text. */
export function lessonFactsFrom(source: string) {
  return {
    examples: (source.match(/<Example\b/g) ?? []).length,
    checks: (source.match(/<Check\b/g) ?? []).length,
    figures: (source.match(/<Figure\b/g) ?? []).length,
    labs: (source.match(/<Lab\b/g) ?? []).length,
  };
}
