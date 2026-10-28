import { useEffect, useMemo, useState } from 'react';
import { goals } from '../../data/goals';
import type { Level } from '../../data/types';
import { defaultFamiliarity, routeForGoal } from '../../lib/graph/routes';
import { actions, load } from '../../lib/persistence/store';

// First-time onboarding: a level, optional separate familiarity with C++
// and with modelling, and one or more goals. Stored only in this browser.

const LEVELS: { id: Level; title: string; text: string }[] = [
  { id: 'beginner', title: 'Beginner', text: 'Little or no prior programming in C++. You will start from what a program is and how to build one.' },
  { id: 'intermediate', title: 'Intermediate', text: 'You know programming fundamentals and want to learn to implement scientific simulations.' },
  { id: 'seasoned', title: 'Seasoned', text: 'You already know C++ or modelling and want to work with more complex simulation techniques.' },
];
const FAMILIARITY = ['None yet', 'The basics', 'Comfortable'] as const;

export default function Onboarding({ base }: { base: string }) {
  const [level, setLevel] = useState<Level>('beginner');
  const [cpp, setCpp] = useState<0 | 1 | 2>(0);
  const [modelling, setModelling] = useState<0 | 1 | 2>(0);
  const [chosen, setChosen] = useState<string[]>(['discrete-model']);
  const [refine, setRefine] = useState(false);
  const [returning, setReturning] = useState(false);
  const b = base.replace(/\/$/, '');

  useEffect(() => {
    const s = load();
    if (s.profile) {
      setReturning(true);
      setLevel(s.profile.level);
      setCpp(s.profile.cpp);
      setModelling(s.profile.modelling);
      if (s.goals.length) setChosen(s.goals);
    }
  }, []);

  const pickLevel = (l: Level) => {
    setLevel(l);
    setCpp(defaultFamiliarity[l].cpp);
    setModelling(defaultFamiliarity[l].modelling);
  };
  const toggleGoal = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const preview = useMemo(() => {
    if (!chosen.length) return null;
    const route = routeForGoal(chosen[0], { level, cpp, modelling });
    return { total: route.length, skip: route.filter((s) => s.status === 'assumed').length };
  }, [chosen, level, cpp, modelling]);

  const save = () => {
    actions.setProfile({ level, cpp, modelling }, chosen);
    window.location.href = `${b}/atlas/${chosen[0] ? `?goal=${chosen[0]}` : ''}`;
  };

  return (
    <div className="onboarding">
      <fieldset>
        <legend>
          <span className="ob-n">1</span> Where are you starting from?
        </legend>
        <div className="ob-levels">
          {LEVELS.map((l) => (
            <label key={l.id} className={`ob-card${level === l.id ? ' is-on' : ''}`}>
              <input type="radio" name="level" checked={level === l.id} onChange={() => pickLevel(l.id)} />
              <span className="ob-title">{l.title}</span>
              <span className="ob-text">{l.text}</span>
            </label>
          ))}
        </div>
        <button type="button" className="ob-link" aria-expanded={refine} onClick={() => setRefine((r) => !r)}>
          {refine ? 'Hide' : 'Refine'}: rate C++ and modelling separately
        </button>
        {refine && (
          <div className="ob-refine">
            {[
              { label: 'C++ programming', value: cpp, set: setCpp },
              { label: 'Mathematical modelling', value: modelling, set: setModelling },
            ].map((row) => (
              <div key={row.label} className="ob-row">
                <span>{row.label}</span>
                <div className="seg" role="group" aria-label={row.label}>
                  {FAMILIARITY.map((f, i) => (
                    <button key={f} type="button" aria-pressed={row.value === i} onClick={() => row.set(i as 0 | 1 | 2)}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="ob-note">“The basics” skips beginner material in that area; “Comfortable” also skips intermediate material. You can always open any lesson.</p>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>
          <span className="ob-n">2</span> What do you want to be able to do?
        </legend>
        <div className="ob-goals">
          {goals.map((g) => (
            <label key={g.id} className={`ob-goal${chosen.includes(g.id) ? ' is-on' : ''}`}>
              <input type="checkbox" checked={chosen.includes(g.id)} onChange={() => toggleGoal(g.id)} />
              <span>
                <span className="ob-title">{g.title}</span>
                <span className="ob-text">{g.summary}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="ob-actions">
        {preview && (
          <p className="ob-preview" role="status">
            Your first pathway has {preview.total} steps; {preview.skip} are assumed from your answers and marked as such in the atlas.
          </p>
        )}
        <div className="cta-row">
          <button type="button" className="btn-solid" onClick={save}>
            {returning ? 'Save and open the atlas' : 'Open my atlas'}
          </button>
          <a className="btn-outline" href={`${b}/atlas/`}>Skip and explore freely</a>
        </div>
        <p className="ob-note">Stored only in this browser, with no account and no tracking. You can change it at any time on the progress page.</p>
      </div>
    </div>
  );
}
