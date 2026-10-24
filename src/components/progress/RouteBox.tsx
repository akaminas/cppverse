import { useMemo } from 'react';
import { conceptById, concepts } from '../../data/concepts';
import { routeTo } from '../../lib/graph/routes';
import { completedConcepts, useLearner } from './useLearner';

// Personal route to a set of target concepts, computed from the atlas
// prerequisites, the learner's stated level and what they have studied.

interface Props {
  targets: string[];
  base: string;
  checkCounts: Record<string, number>;
  /** Show at most this many upcoming steps. */
  limit?: number;
}

export default function RouteBox({ targets, base, checkCounts, limit = 8 }: Props) {
  const { state, ready } = useLearner();
  const b = base.replace(/\/$/, '');
  const route = useMemo(() => {
    const profile = state.profile ?? { level: 'beginner' as const, cpp: 0 as const, modelling: 0 as const };
    return routeTo(targets, profile, completedConcepts(state, concepts, checkCounts));
  }, [targets, state, checkCounts]);
  const href = (id: string) => {
    const c = conceptById[id];
    if (c.kind === 'landmark') return `${b}/models/${c.domain}/`;
    if (c.kind === 'capstone') return `${b}/capstones/${c.id}/`;
    return `${b}/learn/${c.lesson}/${c.anchor ? `#${c.anchor}` : ''}`;
  };
  const open = route.filter((s) => s.status === 'next' || s.status === 'todo');
  const done = route.filter((s) => s.status === 'done').length;
  const assumed = route.filter((s) => s.status === 'assumed').length;

  return (
    <div className="route-box">
      <p className="route-meta">
        {ready && state.profile
          ? `Your route as a ${state.profile.level} learner: ${route.length} steps including the destination, ${done} studied, ${assumed} assumed from your level, ${open.length} to go.`
          : `${route.length} steps including the destination itself. Choose a level on the start page to skip what you already know.`}
      </p>
      {open.length > 0 ? (
        <ol>
          {open.slice(0, limit).map((s) => (
            <li key={s.id} className={s.status === 'next' ? 'is-next' : ''}>
              <a href={href(s.id)}>{conceptById[s.id].title}</a>
              {s.status === 'next' && <span className="tag" style={{ marginLeft: 8 }}>next</span>}
            </li>
          ))}
          {open.length > limit && <li className="muted">… and {open.length - limit} more</li>}
        </ol>
      ) : (
        <p>Every concept on this route is studied or assumed.</p>
      )}
      <p className="route-meta" style={{ marginTop: 10 }}>
        <a href={`${b}/atlas/?node=${encodeURIComponent(targets[0])}`}>Trace this route in the atlas</a>
        {ready && !state.profile && (
          <>
            {' · '}
            <a href={`${b}/start/`}>Set your level</a>
          </>
        )}
      </p>
    </div>
  );
}
