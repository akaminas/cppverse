import { useEffect, useMemo } from 'react';
import { conceptById, concepts } from '../../data/concepts';
import { goalById } from '../../data/goals';
import { routeTo } from '../../lib/graph/routes';
import { actions } from '../../lib/persistence/store';
import { completedConcepts, lessonStatus, useLearner } from './useLearner';

interface Props {
  slug: string;
  checkCount: number;
  base: string;
  checkCounts: Record<string, number>;
}

const STATUS_TEXT = {
  new: 'Not started',
  visited: 'Visited, not yet marked as studied',
  studied: 'Studied (self-assessed)',
  demonstrated: 'Every check answered correctly',
} as const;

export default function LessonProgress({ slug, checkCount, base, checkCounts }: Props) {
  const { state, ready } = useLearner();
  useEffect(() => {
    actions.visit(slug);
  }, [slug]);

  const status = lessonStatus(state, slug, checkCount);
  const passed = Object.keys(state.checks).filter((k) => k.startsWith(`${slug}/`)).length;
  const b = base.replace(/\/$/, '');

  const next = useMemo(() => {
    if (!ready || !state.pathway || !goalById[state.pathway]) return null;
    const profile = state.profile ?? { level: 'beginner' as const, cpp: 0 as const, modelling: 0 as const };
    const done = completedConcepts(state, concepts, checkCounts);
    const route = routeTo(goalById[state.pathway].targets, profile, done);
    const step = route.find((s) => s.status === 'next' && conceptById[s.id].lesson !== slug) ?? route.find((s) => s.status === 'todo' && conceptById[s.id].lesson !== slug);
    if (!step) return { goal: goalById[state.pathway].title, done: true as const };
    const c = conceptById[step.id];
    const href = c.kind === 'landmark' ? `${b}/models/${c.domain}/` : c.kind === 'capstone' ? `${b}/capstones/${c.id}/` : `${b}/learn/${c.lesson}/${c.anchor ? `#${c.anchor}` : ''}`;
    return { goal: goalById[state.pathway].title, title: c.title, href, done: false as const };
  }, [ready, state, slug, b, checkCounts]);

  return (
    <div className="lesson-progress">
      <p className="eyebrow">Your progress</p>
      <p className={`lp-status lp-${status}`}>
        <span className="lp-icon" aria-hidden="true">
          {status === 'demonstrated' ? '✓✓' : status === 'studied' ? '✓' : status === 'visited' ? '○' : '·'}
        </span>
        {ready ? STATUS_TEXT[status] : ' '}
      </p>
      {checkCount > 0 && (
        <p className="lp-checks">
          Checks answered correctly: {passed} of {checkCount}
        </p>
      )}
      <label className="lp-toggle">
        <input type="checkbox" checked={Boolean(state.studied[slug])} onChange={(e) => actions.setStudied(slug, e.target.checked)} disabled={!ready} />
        I have studied this lesson
      </label>
      {next && (
        <p className="lp-next">
          <span className="eyebrow">Pathway · {next.goal}</span>
          {next.done ? <span>Every step is studied or assumed.</span> : <a href={next.href}>Next: {next.title}</a>}
        </p>
      )}
    </div>
  );
}
