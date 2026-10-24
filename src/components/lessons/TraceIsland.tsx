import { useId, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { inline } from './inline';

// Step through a program: the highlighted line has just executed; the table
// shows every variable that is alive at that moment and the output so far.
// The steps are written by hand and checked against the compiled program's
// output in CI (the final output of the trace must equal the .out file).

import type { TraceStep } from '../../data/traces/types';

interface Props {
  html: string;
  title: string;
  steps: TraceStep[];
}

export default function TraceIsland({ html, title, steps }: Props) {
  const [i, setI] = useState(0);
  const uid = useId();
  const cssId = `trace-${uid.replace(/[^a-zA-Z0-9]/g, '')}`;
  const step = steps[i];
  const output = steps
    .slice(0, i + 1)
    .map((s) => s.out ?? '')
    .join('');
  const vars = Object.entries(step.vars ?? {});
  const go = (n: number) => setI(Math.max(0, Math.min(steps.length - 1, n)));
  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), go(i + 1));
    if (e.key === 'ArrowLeft') (e.preventDefault(), go(i - 1));
    if (e.key === 'Home') (e.preventDefault(), go(0));
    if (e.key === 'End') (e.preventDefault(), go(steps.length - 1));
  };
  // Highlight the current line by CSS: the wrapper sets data-current on the code.
  return (
    <section className="trace" aria-labelledby={`${uid}-t`} onKeyDown={onKey}>
      <p className="trace-title" id={`${uid}-t`}>{title}</p>
      <div className="trace-grid">
        <div className="trace-code" data-current={step.line}>
          <style>{`#${cssId} .line[data-line="${step.line}"]{background:color-mix(in srgb,var(--v-terracotta-tint) 55%,transparent);box-shadow:inset 3px 0 0 var(--v-terracotta)}`}</style>
          <div id={cssId} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <div className="trace-state">
          <p className="trace-step">
            Step {i + 1} of {steps.length} · line {step.line}
          </p>
          <p className="trace-note" aria-live="polite">{inline(step.note)}</p>
          <table className="trace-vars">
            <caption className="sr-only">Variables after this step</caption>
            <thead>
              <tr>
                <th scope="col">Variable</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {vars.length ? (
                vars.map(([k, v]) => (
                  <tr key={k}>
                    <td><code>{k}</code></td>
                    <td><code>{v}</code></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="muted">No variables in scope</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="trace-out-label">Output so far</p>
          <pre className="trace-out" role="log" tabIndex={0} aria-label="Program output so far">{output || ' '}</pre>
        </div>
      </div>
      <div className="trace-controls" role="group" aria-label="Step through the program">
        <button type="button" className="btn" onClick={() => go(0)} disabled={i === 0}>Start</button>
        <button type="button" className="btn" onClick={() => go(i - 1)} disabled={i === 0}>← Back</button>
        <button type="button" className="btn" onClick={() => go(i + 1)} disabled={i === steps.length - 1}>Next →</button>
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={i}
          onChange={(e) => go(Number(e.target.value))}
          aria-label="Step"
          className="trace-slider"
        />
      </div>
    </section>
  );
}
