import { useEffect, useState } from 'react';
import { emptyState, load, subscribe, type LearnerState } from '../../lib/persistence/store';

/**
 * React access to the locally stored learner state. The first render uses
 * an empty state (identical on server and client, so hydration never
 * mismatches); the stored state is loaded right after mounting.
 */
export function useLearner(): { state: LearnerState; ready: boolean } {
  const [state, setState] = useState<LearnerState>(emptyState);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setState(load());
    setReady(true);
    return subscribe(setState);
  }, []);
  return { state, ready };
}

export type LessonStatus = 'new' | 'visited' | 'studied' | 'demonstrated';

/**
 * Visiting a lesson is not competence. A lesson is "studied" when the
 * learner marks it so, and "demonstrated" when every knowledge check in it
 * has been answered correctly.
 */
export function lessonStatus(state: LearnerState, slug: string, checkCount = 0): LessonStatus {
  if (checkCount > 0) {
    const passed = Object.keys(state.checks).filter((k) => k.startsWith(`${slug}/`)).length;
    if (passed >= checkCount) return 'demonstrated';
  }
  if (state.studied[slug]) return 'studied';
  if (state.visited[slug]) return 'visited';
  return 'new';
}

/** Concept ids whose lessons are studied or demonstrated. */
export function completedConcepts(
  state: LearnerState,
  nodes: readonly { id: string; lesson?: string }[],
  checkCounts: Record<string, number> = {},
): Set<string> {
  const done = new Set<string>();
  for (const n of nodes) {
    if (!n.lesson) continue;
    const s = lessonStatus(state, n.lesson, checkCounts[n.lesson] ?? 0);
    if (s === 'studied' || s === 'demonstrated') done.add(n.id);
  }
  return done;
}

export { emptyState };
