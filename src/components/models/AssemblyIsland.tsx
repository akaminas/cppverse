import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

// Model Assembly View: the components of a complete computational model,
// each linked to its mathematics, its role in the algorithm, the exact C++
// lines that implement it, the concepts it needs, and what goes wrong when
// it is implemented incorrectly.

export interface AssemblyComponentView {
  id: string;
  title: string;
  role: string;
  mathHtml?: string;
  explain: string;
  lines: number[];
  prerequisites: { id: string; title: string; href: string }[];
  mistakes: string[];
  consequence: string;
}

interface Props {
  title: string;
  file: string;
  download: string;
  codeHtml: string;
  components: AssemblyComponentView[];
}

export default function AssemblyIsland({ title, file, download, codeHtml, components }: Props) {
  const uid = useId();
  const [active, setActive] = useState(components[0].id);
  const codeRef = useRef<HTMLDivElement>(null);
  const comp = components.find((c) => c.id === active)!;
  const index = components.findIndex((c) => c.id === active);

  useEffect(() => {
    const root = codeRef.current;
    if (!root) return;
    const lines = new Set(comp.lines);
    let first: HTMLElement | null = null;
    root.querySelectorAll<HTMLElement>('.line').forEach((el) => {
      const on = lines.has(Number(el.dataset.line));
      el.classList.toggle('is-marked', on);
      if (on && !first) first = el;
    });
    const scroller = root.querySelector<HTMLElement>('pre');
    if (first && scroller) {
      const top = (first as HTMLElement).offsetTop - scroller.offsetTop - 24;
      scroller.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }, [comp]);

  // Clicking a code line selects the component that owns it.
  useEffect(() => {
    const root = codeRef.current;
    if (!root) return;
    const owner = new Map<number, string>();
    for (const c of components) for (const l of c.lines) if (!owner.has(l)) owner.set(l, c.id);
    const off: (() => void)[] = [];
    root.querySelectorAll<HTMLElement>('.line').forEach((el) => {
      const id = owner.get(Number(el.dataset.line));
      if (!id) return;
      el.classList.add('asm-line');
      const pick = () => setActive(id);
      el.addEventListener('click', pick);
      off.push(() => el.removeEventListener('click', pick));
    });
    return () => off.forEach((f) => f());
  }, [components]);

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = components[Math.min(components.length - 1, index + 1)];
      setActive(next.id);
      document.getElementById(`${uid}-${next.id}`)?.focus();
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = components[Math.max(0, index - 1)];
      setActive(prev.id);
      document.getElementById(`${uid}-${prev.id}`)?.focus();
    }
  };

  return (
    <section className="assembly" aria-labelledby={`${uid}-t`}>
      <h3 className="assembly-title" id={`${uid}-t`}>{title}</h3>
      <div className="assembly-grid">
        <ol className="assembly-steps" onKeyDown={onKey} aria-label="Components of the model">
          {components.map((c, i) => (
            <li key={c.id} className={c.id === active ? 'is-active' : ''}>
              <button id={`${uid}-${c.id}`} type="button" aria-pressed={c.id === active} onClick={() => setActive(c.id)}>
                <span className="asm-n">{i + 1}</span>
                <span className="asm-name">{c.title}</span>
                {c.lines.length > 0 && <span className="asm-has-code" aria-label="has code">{'{}'}</span>}
              </button>
            </li>
          ))}
        </ol>
        <div className="assembly-detail" aria-live="polite">
          <p className="eyebrow">
            Component {index + 1} of {components.length}
          </p>
          <h4>{comp.title}</h4>
          <p className="asm-role">{comp.role}</p>
          {comp.mathHtml && <div className="asm-math" dangerouslySetInnerHTML={{ __html: comp.mathHtml }} />}
          <p>{comp.explain}</p>
          {comp.prerequisites.length > 0 && (
            <div className="asm-block">
              <p className="asm-label">Builds on</p>
              <ul className="asm-prereqs">
                {comp.prerequisites.map((p) => (
                  <li key={p.id}>
                    <a href={p.href}>{p.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {comp.mistakes.length > 0 && (
            <div className="asm-block">
              <p className="asm-label">Common mistakes</p>
              <ul>
                {comp.mistakes.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="asm-block">
            <p className="asm-label">If it is implemented incorrectly</p>
            <p>{comp.consequence}</p>
          </div>
          {comp.lines.length > 0 ? (
            <p className="asm-lines">
              {file}, line{comp.lines.length > 1 ? 's' : ''} {compress(comp.lines)}
            </p>
          ) : (
            <p className="asm-lines">This component has no lines of code: it is part of the scientific workflow around the program.</p>
          )}
        </div>
        <div className="assembly-code" ref={codeRef}>
          <div className="assembly-code-head">
            <span className="code-name">{file}</span>
            <a href={download} download>
              Download
            </a>
          </div>
          <div dangerouslySetInnerHTML={{ __html: codeHtml }} />
        </div>
      </div>
    </section>
  );
}

/** [3,4,5,9] → "3-5, 9" */
function compress(lines: number[]): string {
  const sorted = [...new Set(lines)].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (const l of sorted.slice(1).concat([Infinity])) {
    if (l === prev + 1) {
      prev = l;
      continue;
    }
    parts.push(start === prev ? String(start) : `${start}-${prev}`);
    start = prev = l;
  }
  return parts.join(', ');
}
