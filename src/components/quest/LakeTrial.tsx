import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { actions } from '../../lib/persistence/store';
import { checkLake, type Check, type Group, type LakeNotes } from '../../lib/quest/checks';
import { useLearner } from '../progress/useLearner';

// The checker of the deep trial. Files are read in this browser only; nothing
// is uploaded anywhere. Every required check passing crowns the nautilus.

type FileKey = 'run' | 'foodWeb' | 'cascade';
const FILES: { key: FileKey; label: string; hint: string }[] = [
  { key: 'run', label: 'Baseline run', hint: 'lake_run.csv' },
  { key: 'foodWeb', label: 'Food web', hint: 'food_web.csv' },
  { key: 'cascade', label: 'Cascade run', hint: 'lake_cascade.csv' },
];
const GROUPS: Group[] = ['Run', 'Food web', 'Cascade', 'Notes', 'Bonus'];
const MAX_BYTES = 40 * 1024 * 1024;
const MARK: Record<Check['status'], string> = { pass: '✓', fail: '✗', pending: '○' };

export default function LakeTrial() {
  const { state, ready } = useLearner();
  const [files, setFiles] = useState<Record<FileKey, { name: string; text: string } | null>>({ run: null, foodWeb: null, cascade: null });
  const [error, setError] = useState<string | null>(null);
  // The worked solution, offered to those who open the deep with its passphrase.
  const [offered, setOffered] = useState(false);
  const [provided, setProvided] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setOffered(new URLSearchParams(window.location.search).get('solution') === '1');
  }, []);
  const [chain, setChain] = useState('');
  const [notes, setNotes] = useState<Record<keyof LakeNotes, string>>({ oxygenMinDay: '', dominantFish: '', zooplanktonPeakDay: '', topTrophicLevel: '', interpretation: '' });

  const sub = useDeferredValue({ files, chain, notes });
  const report = useMemo(() => {
    const num = (v: string) => (v.trim() === '' ? undefined : Number(v));
    return checkLake({
      run: sub.files.run?.text,
      foodWeb: sub.files.foodWeb?.text,
      cascade: sub.files.cascade?.text,
      chain: sub.chain,
      notes: {
        oxygenMinDay: num(sub.notes.oxygenMinDay),
        dominantFish: sub.notes.dominantFish || undefined,
        zooplanktonPeakDay: num(sub.notes.zooplanktonPeakDay),
        topTrophicLevel: num(sub.notes.topTrophicLevel),
        interpretation: sub.notes.interpretation,
      },
    });
  }, [sub]);

  const crowned = state.quest.crowned;
  // The crown is for a lake the learner built: the worked solution never earns it.
  useEffect(() => {
    if (ready && report.passed && !crowned && !provided) actions.crown('lake');
  }, [ready, report.passed, crowned, provided]);

  // Tell the nautilus what is failing, so that it can point to the right lesson.
  const failing = report.checks.filter((c) => c.status === 'fail').map((c) => c.id).join(',');
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('deep:failing', { detail: failing ? failing.split(',') : [] }));
  }, [failing]);

  const loadSolution = async () => {
    setLoading(true);
    setError(null);
    try {
      // The model runs here, in the browser, and takes a couple of seconds.
      const { solutionSubmission } = await import('../../lib/quest/reference-lake');
      await new Promise((r) => setTimeout(r, 30));
      const s = solutionSubmission();
      setFiles({
        run: { name: 'lake_run.csv (worked solution)', text: s.run },
        foodWeb: { name: 'food_web.csv (worked solution)', text: s.foodWeb },
        cascade: { name: 'lake_cascade.csv (worked solution)', text: s.cascade },
      });
      setChain(s.chain);
      setNotes({
        oxygenMinDay: String(s.notes.oxygenMinDay),
        dominantFish: s.notes.dominantFish,
        zooplanktonPeakDay: String(s.notes.zooplanktonPeakDay),
        topTrophicLevel: String(s.notes.topTrophicLevel),
        interpretation: s.notes.interpretation,
      });
      setProvided(true);
    } catch {
      setError('The worked solution could not be run in this browser.');
    } finally {
      setLoading(false);
    }
  };

  // Putting in a file of your own clears whatever came from the worked solution.
  const withoutProvided = (f: typeof files) =>
    Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v && !v.name.includes('(worked solution)') ? v : null])) as typeof files;
  const read = (key: FileKey, file: File | undefined) => {
    setError(null);
    setProvided(false);
    if (!file) return setFiles((f) => ({ ...withoutProvided(f), [key]: null }));
    if (file.size > MAX_BYTES) return setError(`${file.name} is larger than 40 MB: write every day or every few days, not every step.`);
    const reader = new FileReader();
    reader.onload = () => setFiles((f) => ({ ...withoutProvided(f), [key]: { name: file.name, text: String(reader.result ?? '') } }));
    reader.onerror = () => setError(`Could not read ${file.name}.`);
    reader.readAsText(file);
  };

  const required = report.checks.filter((c) => c.required);
  const passedCount = required.filter((c) => c.status === 'pass').length;
  const note = (k: keyof LakeNotes) => (e: { target: { value: string } }) => setNotes((n) => ({ ...n, [k]: e.target.value }));

  return (
    <div className="lt">
      {crowned && (
        <div className="lt-crowned" role="status">
          <svg viewBox="0 0 40 26" aria-hidden="true" className="lt-crown">
            <path d="M3,23 L1,6 L11,14 L20,2 L29,14 L39,6 L37,23 Z" />
            <path className="lt-crown-rim" d="M3.6,19 L36.4,19" />
            <circle cx="1" cy="5" r="2" />
            <circle className="lt-crown-pearl" cx="20" cy="1.8" r="2.4" />
            <circle cx="39" cy="5" r="2" />
          </svg>
          <div>
            <p className="lt-crowned-title">Crowned on {crowned.date}</p>
            <p>The nautilus wears the crown of the deep on every page, and in every progress file you export.</p>
          </div>
        </div>
      )}

      {offered && (
        <section className="lt-step lt-provided" aria-labelledby="lt-provided">
          <h3 id="lt-provided">A worked solution is provided</h3>
          <p className="lt-quiet">
            Its C++ is shown above. Run its model here to see every check pass: it is the same model, in TypeScript, running in your browser. Loading it
            does not earn the crown. That is for a lake you built.
          </p>
          <button type="button" className="btn" onClick={loadSolution} disabled={loading}>
            {loading ? 'Running the lake…' : provided ? 'Run it again' : 'Run the worked solution'}
          </button>
          {provided && <p className="lt-quiet" role="status">Loaded. Replace any file with your own to be judged on it.</p>}
        </section>
      )}

      <section className="lt-step" aria-labelledby="lt-files">
        <h3 id="lt-files">1 · Your files</h3>
        <p className="lt-quiet">Read in this browser only: nothing is uploaded.</p>
        <div className="lt-files">
          {FILES.map(({ key, label, hint }) => (
            <label key={key} className={`lt-file${files[key] ? ' is-loaded' : ''}`}>
              <span className="lt-file-label">{label}</span>
              <span className="lt-file-name">{files[key]?.name ?? hint}</span>
              <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" onChange={(e) => read(key, e.target.files?.[0])} />
            </label>
          ))}
        </div>
        {error && <p className="lt-error" role="alert">{error}</p>}
      </section>

      <section className="lt-step" aria-labelledby="lt-claims">
        <h3 id="lt-claims">2 · The cascade and your notes</h3>
        <div className="lt-form">
          <label className="lt-wide">
            <span>The food chain you followed, top predator first</span>
            <input type="text" list="lt-compartments" value={chain} onChange={(e) => setChain(e.target.value)} placeholder="fish_piscivore > fish_planktivore > zooplankton > phytoplankton" spellCheck={false} autoComplete="off" />
            <datalist id="lt-compartments">{report.compartments.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label>
            <span>Day of the year of the oxygen minimum, final year</span>
            <input type="number" min={0} max={365} inputMode="numeric" value={notes.oxygenMinDay} onChange={note('oxygenMinDay')} />
          </label>
          <label>
            <span>Day of the year of the zooplankton maximum, final year</span>
            <input type="number" min={0} max={365} inputMode="numeric" value={notes.zooplanktonPeakDay} onChange={note('zooplanktonPeakDay')} />
          </label>
          <label>
            <span>The guild with the largest mean biomass, final year</span>
            <select value={notes.dominantFish} onChange={note('dominantFish')}>
              <option value="">{report.fish.length ? 'Choose a guild' : 'Add the baseline run first'}</option>
              {report.fish.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label>
            <span>Trophic level of your top predator</span>
            <input type="number" step="0.01" min={1} max={10} inputMode="decimal" value={notes.topTrophicLevel} onChange={note('topTrophicLevel')} />
          </label>
          <label className="lt-wide">
            <span>What the lake taught you: the mechanisms behind what you saw</span>
            <textarea rows={4} value={notes.interpretation} onChange={note('interpretation')} />
          </label>
        </div>
      </section>

      <section className="lt-step" aria-labelledby="lt-results">
        <h3 id="lt-results">3 · What the checks found</h3>
        <p className="lt-summary" aria-live="polite">
          {passedCount} of {required.length} required checks pass{report.passed ? '. The lake lives.' : '.'}
        </p>
        <div className="lt-meter" aria-hidden="true"><span style={{ width: `${(100 * passedCount) / required.length}%` }} /></div>
        {GROUPS.map((g) => {
          const list = report.checks.filter((c) => c.group === g);
          if (!list.length) return null;
          return (
            <div key={g} className="lt-group">
              <h4>{g === 'Bonus' ? 'Bonus (not needed for the crown)' : g}</h4>
              <ul>
                {list.map((c) => (
                  <li key={c.id} className={`lt-check is-${c.status}`}>
                    <span className="lt-mark" aria-label={c.status === 'pass' ? 'Passed' : c.status === 'fail' ? 'Failed' : 'Waiting'}>{MARK[c.status]}</span>
                    <div>
                      <p className="lt-check-label">{c.label}</p>
                      <p className="lt-check-detail">{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
