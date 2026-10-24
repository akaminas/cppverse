import { domainById } from '../../data/domains.ts';
import { goalById } from '../../data/goals.ts';
import type { ConceptNode, Level } from '../../data/types.ts';
import { dependencyClosure, getGraph, topologicalOrder, type Graph } from './graph.ts';

/**
 * A learner profile. `cpp` and `modelling` are self-assessed familiarity:
 * 0 = none, 1 = beginner-level material is familiar, 2 = beginner and
 * intermediate material is familiar.
 */
export interface Profile {
  level: Level;
  cpp: 0 | 1 | 2;
  modelling: 0 | 1 | 2;
}

export const defaultFamiliarity: Record<Level, Pick<Profile, 'cpp' | 'modelling'>> = {
  beginner: { cpp: 0, modelling: 0 },
  intermediate: { cpp: 1, modelling: 0 },
  seasoned: { cpp: 2, modelling: 1 },
};

const LEVEL_RANK: Record<Level, number> = { beginner: 1, intermediate: 2, seasoned: 3 };

/** Whether a learner with this profile can be assumed to know a concept already. */
export function isAssumedKnown(node: ConceptNode, profile: Profile): boolean {
  if (node.kind === 'capstone' || node.kind === 'landmark' || node.kind === 'integration') return false;
  const kind = domainById[node.domain].kind;
  const familiarity = kind === 'foundation' ? profile.cpp : profile.modelling;
  return LEVEL_RANK[node.level] <= familiarity;
}

export type RouteStatus = 'done' | 'assumed' | 'next' | 'todo';

export interface RouteStep {
  id: string;
  status: RouteStatus;
}

/**
 * Recommended route to a set of target concepts: their dependency closure in
 * topological order, with each step marked as done (completed by the
 * learner), assumed (covered by the learner's stated familiarity), the single
 * next recommendation, or still to do. Optional branches are left out unless
 * they are themselves targets, so seasoned material never blocks a beginner.
 */
export function routeTo(
  targets: string[],
  profile: Profile,
  completed: ReadonlySet<string> = new Set(),
  g: Graph = getGraph(),
): RouteStep[] {
  const closure = dependencyClosure(g, targets);
  for (const t of targets) closure.add(t);
  const included = [...closure].filter((id) => {
    const node = g.byId.get(id)!;
    return !node.optional || targets.includes(id);
  });
  const ordered = topologicalOrder(g, included);
  let nextAssigned = false;
  return ordered.map((id) => {
    const node = g.byId.get(id)!;
    let status: RouteStatus;
    if (completed.has(id)) status = 'done';
    else if (isAssumedKnown(node, profile)) status = 'assumed';
    else if (!nextAssigned) {
      status = 'next';
      nextAssigned = true;
    } else status = 'todo';
    return { id, status };
  });
}

export function routeForGoal(goalId: string, profile: Profile, completed?: ReadonlySet<string>): RouteStep[] {
  const goal = goalById[goalId];
  if (!goal) throw new Error(`Unknown goal ${goalId}`);
  return routeTo(goal.targets, profile, completed);
}

/** Lessons (deduplicated, in route order) that cover the unfinished steps of a route. */
export function lessonsForRoute(route: RouteStep[], g: Graph = getGraph()): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const step of route) {
    if (step.status === 'done' || step.status === 'assumed') continue;
    const lesson = g.byId.get(step.id)?.lesson;
    if (lesson && !seen.has(lesson)) {
      seen.add(lesson);
      out.push(lesson);
    }
  }
  return out;
}
