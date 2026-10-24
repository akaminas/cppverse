import { Fragment, useId, useState } from 'react';
import type { Anatomy } from '../../data/anatomy/types';

// Code anatomy: every meaningful element of a program is a button. Selecting
// one highlights it (and its other occurrences) and explains its role.

export default function AnatomyIsland({ anatomy }: { anatomy: Anatomy }) {
  const [active, setActive] = useState(anatomy.start);
  const uid = useId();
  const part = anatomy.parts[active];
  const order = anatomy.lines.flat().filter((s): s is [string, string] => Array.isArray(s)).map(([, id]) => id);
  const unique = [...new Set(order)];
  const step = (d: number) => {
    const i = unique.indexOf(active);
    const next = unique[(i + d + unique.length) % unique.length];
    setActive(next);
    document.getElementById(`${uid}-${next}`)?.focus();
  };

  // The first occurrence of each part carries an id so keyboard stepping can focus it.
  const firstSeen = new Set<string>();
  const idFor = (part: string) => (firstSeen.has(part) ? undefined : (firstSeen.add(part), `${uid}-${part}`));

  return (
    <section className="anatomy" aria-labelledby={`${uid}-t`}>
      <p className="anatomy-title" id={`${uid}-t`}>{anatomy.title}</p>
      <p className="anatomy-hint">Select any element of the program. Arrow keys step through them.</p>
      <div className="anatomy-grid">
        <pre
          className="anatomy-code"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') (e.preventDefault(), step(1));
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') (e.preventDefault(), step(-1));
          }}
        >
          <code>
            {anatomy.lines.map((line, li) => (
              <Fragment key={li}>
                <span className="anatomy-line">
                  {line.map((seg, si) =>
                    typeof seg === 'string' ? (
                      <Fragment key={si}>{seg}</Fragment>
                    ) : (
                      <button
                        key={si}
                        type="button"
                        id={idFor(seg[1])}
                        className={`anatomy-tok${seg[1] === active ? ' is-active' : ''}`}
                        aria-pressed={seg[1] === active}
                        aria-label={`${anatomy.parts[seg[1]].label}: ${anatomy.parts[seg[1]].role}`}
                        onClick={() => setActive(seg[1])}
                      >
                        {seg[0]}
                      </button>
                    ),
                  )}
                </span>
                {'\n'}
              </Fragment>
            ))}
          </code>
        </pre>
        <div className="anatomy-explain" aria-live="polite">
          <p className="anatomy-role">{part.role}</p>
          <p className="anatomy-label">
            <code>{part.label}</code>
          </p>
          <p>{part.explain}</p>
          <p className="anatomy-count">
            {unique.indexOf(active) + 1} of {unique.length}
          </p>
        </div>
      </div>
    </section>
  );
}
