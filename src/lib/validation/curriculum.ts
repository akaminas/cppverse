import { concepts } from '../../data/concepts.ts';
import { domains } from '../../data/domains.ts';
import { edges } from '../../data/edges.ts';
import { goals } from '../../data/goals.ts';
import { manualSections } from '../../data/manual.ts';
import type { ConceptNode, Edge } from '../../data/types.ts';
import { EDGE_TYPES } from '../../data/types.ts';
import { buildGraph, dependencyClosure, dependentClosure, findDependencyCycle } from '../graph/graph.ts';

export interface LessonSource {
  slug: string;
  /** Raw file contents (frontmatter + body). */
  source: string;
  /** Manual section ids listed in the lesson's frontmatter. */
  manual: string[];
}

export interface ValidationReport {
  errors: string[];
  warnings: string[];
}

/** The single designated root of the prerequisite graph. */
export const ROOT_IDS = new Set(['programs-and-algorithms']);

export function validateCurriculum(
  lessons: LessonSource[],
  nodes: ConceptNode[] = concepts,
  allEdges: Edge[] = edges,
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  const domainIds = new Set(domains.map((d) => d.id));
  const sectionIds = new Set(manualSections.map((s) => s.id));
  const lessonBySlug = new Map(lessons.map((l) => [l.slug, l]));

  // Nodes
  for (const n of nodes) {
    if (ids.has(n.id)) errors.push(`duplicate node id "${n.id}"`);
    ids.add(n.id);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(n.id)) errors.push(`node id "${n.id}" is not kebab-case`);
    if (!domainIds.has(n.domain)) errors.push(`node "${n.id}" has unknown domain "${n.domain}"`);
    for (const m of n.manual) if (!sectionIds.has(m)) errors.push(`node "${n.id}" cites unknown manual section "${m}"`);
    const needsLesson = n.kind === 'concept' || n.kind === 'integration';
    if (needsLesson && !n.lesson) errors.push(`node "${n.id}" (${n.kind}) has no lesson`);
    if (!needsLesson && n.lesson) errors.push(`node "${n.id}" (${n.kind}) must not point at a lesson`);
    if (n.lesson) {
      const lesson = lessonBySlug.get(n.lesson);
      if (!lesson) errors.push(`node "${n.id}" points at missing lesson "${n.lesson}"`);
      else if (n.anchor && !new RegExp(`<Anchor\\s+id=["']${n.anchor}["']`).test(lesson.source)) {
        errors.push(`node "${n.id}" points at missing anchor "#${n.anchor}" in lesson "${n.lesson}"`);
      }
    }
    if (n.goals.length === 0) warnings.push(`node "${n.id}" has no learning goals`);
  }

  // Edges
  const seenEdges = new Set<string>();
  for (const e of allEdges) {
    const key = `${e.from}->${e.to}:${e.type}`;
    if (seenEdges.has(key)) errors.push(`duplicate edge ${key}`);
    seenEdges.add(key);
    if (!ids.has(e.from)) errors.push(`edge ${key} has unknown source`);
    if (!ids.has(e.to)) errors.push(`edge ${key} has unknown target`);
    if (e.from === e.to) errors.push(`edge ${key} is a self-loop`);
    if (!EDGE_TYPES.includes(e.type)) errors.push(`edge ${key} has unknown type`);
  }
  if (errors.length) return { errors, warnings };

  const g = buildGraph(nodes, allEdges);
  const cycle = findDependencyCycle(g);
  if (cycle) errors.push(`dependency cycle: ${cycle.join(' → ')}`);

  // Roots and reachability
  for (const n of nodes) {
    const deps = (g.incoming.get(n.id) ?? []).filter((e) => e.type !== 'conceptual' && e.type !== 'validation');
    if (deps.length === 0 && !ROOT_IDS.has(n.id)) errors.push(`node "${n.id}" has no dependencies but is not a designated root`);
  }
  if (!cycle) {
    for (const n of nodes) {
      if (n.kind === 'capstone' || n.kind === 'landmark') continue;
      const forward = dependentClosure(g, n.id);
      const reachesLandmark = [...forward].some((id) => g.byId.get(id)!.kind === 'landmark');
      if (!reachesLandmark) errors.push(`node "${n.id}" does not lead to any modelling destination`);
    }
    for (const root of ROOT_IDS) {
      for (const n of nodes) {
        if (ROOT_IDS.has(n.id)) continue;
        if (!dependencyClosure(g, [n.id]).has(root)) errors.push(`node "${n.id}" is unreachable from root "${root}"`);
      }
    }
  }

  // Manual coverage
  const cited = new Set(nodes.flatMap((n) => n.manual));
  for (const s of manualSections) {
    if (s.kind === 'excluded') {
      if (cited.has(s.id)) errors.push(`excluded manual section "${s.id}" is cited by a node`);
      continue;
    }
    if (!cited.has(s.id)) errors.push(`manual section "${s.id}" (${s.title}) is not covered by any atlas node`);
  }

  // Lessons
  const referencedLessons = new Set(nodes.map((n) => n.lesson).filter(Boolean));
  for (const l of lessons) {
    if (!referencedLessons.has(l.slug)) errors.push(`lesson "${l.slug}" is not anchored to any atlas node`);
    for (const m of l.manual) {
      if (!sectionIds.has(m)) errors.push(`lesson "${l.slug}" cites unknown manual section "${m}"`);
      else if (manualSections.find((s) => s.id === m)!.kind === 'excluded') {
        errors.push(`lesson "${l.slug}" cites excluded manual section "${m}"`);
      }
    }
  }

  // Goals
  for (const goal of goals) {
    for (const t of goal.targets) if (!ids.has(t)) errors.push(`goal "${goal.id}" targets unknown node "${t}"`);
  }

  return { errors, warnings };
}
