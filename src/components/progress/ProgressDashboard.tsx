import { useRef, useState } from 'react';
import { conceptById } from '../../data/concepts';
import { goalById } from '../../data/goals';
import { actions } from '../../lib/persistence/store';
import { lessonStatus, useLearner, type LessonStatus } from './useLearner';

// The learner's local progress: profile, lessons by status, bookmarks,
// recent concepts, and import/export of the stored data.

interface LessonInfo {
  slug: string;
  title: string;
  domain: string;
  domainTitle: string;
  checks: number;
  optional: boolean;
}

const STATUS_LABEL: Record<LessonStatus, string> = {
  new: 'Not started',
  visited: 'Visited',
  studied: 'Studied',
  demonstrated: 'All checks correct',
};

export default function ProgressDashboard({ lessons, base }: { lessons: LessonInfo[]; base: string }) {
  const { state, ready } = useLearner();
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const b = base.replace(/\/$/, '');
  if (!ready) return <p className="muted">Loading your progress…</p>;

  const statuses = lessons.map((l) => ({ ...l, status: lessonStatus(state, l.slug, l.checks) }));
  const count = (s: LessonStatus) => statuses.filter((x) => x.status === s).length;
  const domainsList = [...new Set(lessons.map((l) => l.domainTitle))];
  const required = statuses.filter((l) => !l.optional);
  const requiredDone = required.filter((l) => l.status === 'studied' || l.status === 'demonstrated').length;
  const { crowned, declined } = state.quest;

  const download = () => {
    const blob = new Blob([actions.exportState()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cpp-atlas-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const upload = async (file: File) => {
    const ok = actions.importState(await file.text());
    setMessage(ok ? 'Progress imported.' : 'That file is not a C++ Atlas progress export.');
  };

  return (
    <div className="progress">
      <section className="pg-block">
        <h2>Your profile</h2>
        {state.profile ? (
          <p>
            Level: <strong>{state.profile.level}</strong> · C++ familiarity {['none', 'basics', 'comfortable'][state.profile.cpp]} · modelling familiarity{' '}
            {['none', 'basics', 'comfortable'][state.profile.modelling]}
            {state.pathway && goalById[state.pathway] && (
              <>
                {' '}
                · current pathway: <a href={`${b}/atlas/?goal=${state.pathway}`}>{goalById[state.pathway].title}</a>
              </>
            )}
          </p>
        ) : (
          <p>No level chosen yet.</p>
        )}
        <a className="btn" href={`${b}/start/`}>
          {state.profile ? 'Change level or goals' : 'Choose a level'}
        </a>
      </section>

      <section className="pg-block">
        <h2>Lessons</h2>
        <p className="muted">
          Visiting a lesson is recorded automatically. “Studied” is your own judgement; “all checks correct” means every knowledge
          check in the lesson was answered correctly.
        </p>
        <dl className="pg-counts">
          {(['demonstrated', 'studied', 'visited', 'new'] as LessonStatus[]).map((s) => (
            <div key={s}>
              <dt>{STATUS_LABEL[s]}</dt>
              <dd>
                {count(s)} <span className="muted">of {lessons.length}</span>
              </dd>
            </div>
          ))}
        </dl>
        {domainsList.map((d) => (
          <details key={d} className="pg-domain">
            <summary>
              {d} · {statuses.filter((x) => x.domainTitle === d && (x.status === 'studied' || x.status === 'demonstrated')).length} of{' '}
              {statuses.filter((x) => x.domainTitle === d).length} studied
            </summary>
            <ul>
              {statuses
                .filter((x) => x.domainTitle === d)
                .map((l) => (
                  <li key={l.slug}>
                    <a href={`${b}/learn/${l.slug}/`}>{l.title}</a> <span className={`tag pg-${l.status}`}>{STATUS_LABEL[l.status]}</span>
                  </li>
                ))}
            </ul>
          </details>
        ))}
      </section>

      <section className="pg-block">
        <h2>The deep</h2>
        {crowned ? (
          <p>
            Crowned on {crowned.date}: your cichlid lake passed every check of the final trial, and the nautilus wears the crown.{' '}
            <a href={`${b}/deep/`}>Return to the deep</a>.
          </p>
        ) : requiredDone >= required.length ? (
          <>
            <p>{declined ? 'You declined the quest; the way stays open.' : 'Every course is finished. A last, optional trial waits in the deep.'}</p>
            <a className="btn" href={`${b}/deep/`} onClick={() => actions.acceptQuest()}>
              Take me to the deep
            </a>
          </>
        ) : (
          <p className="muted">
            Finish every course ({requiredDone} of {required.length} so far) and the nautilus will offer you a last, optional trial.{' '}
            <a href={`${b}/deep/`}>Look ahead</a>.
          </p>
        )}
      </section>

      <section className="pg-block grid grid-2">
        <div>
          <h2>Bookmarks</h2>
          {state.bookmarks.length ? (
            <ul>
              {state.bookmarks.filter((id) => conceptById[id]).map((id) => (
                <li key={id}>
                  <a href={`${b}/atlas/?node=${id}`}>{conceptById[id].title}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Bookmark concepts from the atlas panel.</p>
          )}
        </div>
        <div>
          <h2>Recently explored</h2>
          {state.recent.length ? (
            <ul>
              {state.recent.filter((id) => conceptById[id]).map((id) => (
                <li key={id}>
                  <a href={`${b}/atlas/?node=${id}`}>{conceptById[id].title}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Concepts you select in the atlas appear here.</p>
          )}
        </div>
      </section>

      <section className="pg-block">
        <h2>Your data</h2>
        <p className="muted">
          Everything is stored only in this browser (localStorage). Export it to move to another browser or device, or to keep a
          backup.
        </p>
        <div className="cta-row">
          <button type="button" className="btn" onClick={download}>
            Export progress
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            Import progress
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (window.confirm('Delete all progress, bookmarks and settings stored by C++ Atlas in this browser?')) {
                actions.reset();
                setMessage('All local progress was deleted.');
              }
            }}
          >
            Delete all progress
          </button>
        </div>
        <p role="status" className="muted">{message}</p>
      </section>
    </div>
  );
}
