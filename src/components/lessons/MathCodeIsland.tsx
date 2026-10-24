import { useEffect, useId, useRef, useState } from 'react';
import type { MathCodeTerm } from '../../data/mathcode/types';

// Synchronised mathematics and code: select a term of the equation to see
// the C++ that computes it, or select a line of code to see which term it
// implements. Both sides are rendered at build time; this island only wires
// up selection.

interface Props {
  title: string;
  mathHtml: string;
  codeHtml: string;
  terms: MathCodeTerm[];
  name: string;
}

export default function MathCodeIsland({ title, mathHtml, codeHtml, terms, name }: Props) {
  const uid = useId();
  const [active, setActive] = useState<string>(terms[0]?.id ?? '');
  const mathRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const term = terms.find((t) => t.id === active);

  // Make each marked part of the equation selectable.
  useEffect(() => {
    const root = mathRef.current;
    if (!root) return;
    const cleanups: (() => void)[] = [];
    for (const t of terms) {
      root.querySelectorAll<HTMLElement>(`.mc-${t.id}`).forEach((el) => {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', t.label);
        el.classList.add('mc-term');
        const pick = (e: Event) => {
          e.stopPropagation();
          setActive(t.id);
        };
        const key = (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActive(t.id);
          }
        };
        el.addEventListener('click', pick);
        el.addEventListener('keydown', key);
        cleanups.push(() => {
          el.removeEventListener('click', pick);
          el.removeEventListener('keydown', key);
        });
      });
    }
    return () => cleanups.forEach((f) => f());
  }, [terms]);

  // Make code lines selectable.
  useEffect(() => {
    const root = codeRef.current;
    if (!root) return;
    const lineToTerm = new Map<number, string>();
    for (const t of terms) for (const l of t.lines) if (!lineToTerm.has(l)) lineToTerm.set(l, t.id);
    const handlers: (() => void)[] = [];
    root.querySelectorAll<HTMLElement>('.line').forEach((el) => {
      const n = Number(el.dataset.line);
      const id = lineToTerm.get(n);
      if (!id) return;
      el.classList.add('mc-line');
      const pick = () => setActive(id);
      el.addEventListener('click', pick);
      handlers.push(() => el.removeEventListener('click', pick));
    });
    return () => handlers.forEach((f) => f());
  }, [terms]);

  // Reflect the active term on both sides.
  useEffect(() => {
    mathRef.current?.querySelectorAll<HTMLElement>('.mc-term').forEach((el) => {
      const on = el.classList.contains(`mc-${active}`);
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-pressed', String(on));
    });
    const lines = new Set(term?.lines ?? []);
    codeRef.current?.querySelectorAll<HTMLElement>('.line').forEach((el) => {
      const n = Number(el.dataset.line);
      el.classList.toggle('is-marked', lines.has(n));
    });
  }, [active, term]);

  return (
    <section className="mathcode" aria-labelledby={`${uid}-t`}>
      <p className="mathcode-title" id={`${uid}-t`}>{title}</p>
      <p className="mathcode-hint">Select a part of the equation or a highlighted line of code.</p>
      <div className="mathcode-math" ref={mathRef} dangerouslySetInnerHTML={{ __html: mathHtml }} />
      <div className="mathcode-terms" role="group" aria-label="Terms of the equation">
        {terms.map((t) => (
          <button key={t.id} type="button" className="chip" aria-pressed={t.id === active} onClick={() => setActive(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="mathcode-explain" aria-live="polite">
        {term && (
          <>
            <p className="mathcode-label">{term.label}</p>
            <p>{term.explain}</p>
            <p className="mathcode-lines">
              {name}, line{term.lines.length > 1 ? 's' : ''} {term.lines.join(', ')}
            </p>
          </>
        )}
      </div>
      <div className="mathcode-code" ref={codeRef} dangerouslySetInnerHTML={{ __html: codeHtml }} />
    </section>
  );
}
