import { useEffect, useRef, useState } from 'react';

// Highlighted C++ (rendered at build time) with copy, download and an
// optional in-browser editor. The editor is loaded only on request. Code is
// never compiled or executed here: the site says so plainly and shows the
// command that builds the program on the reader's own machine.

interface Props {
  html: string;
  code: string;
  name: string;
  title?: string;
  standard: string;
  download?: string;
  build?: string;
  expected?: string;
  stdin?: string;
  expectCompileError?: boolean;
  editable?: boolean;
}

export default function CodeBlock({ html, code, name, title, standard, download, build, expected, stdin, expectCompileError, editable = true }: Props) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dirty, setDirty] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<{ destroy(): void; state: { doc: { toString(): string } }; dispatch(tr: unknown): void } | null>(null);
  const currentCode = () => viewRef.current?.state.doc.toString() ?? code;

  useEffect(() => {
    if (!editing || !hostRef.current) return;
    let cancelled = false;
    import('./editor').then(({ createEditor }) => {
      if (cancelled || !hostRef.current) return;
      viewRef.current = createEditor(hostRef.current, code, () => setDirty(true), name);
      (hostRef.current.querySelector('.cm-content') as HTMLElement | null)?.focus();
    });
    return () => {
      cancelled = true;
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [editing, code, name]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable: the reader can still select the text */
    }
  };

  const reset = () => {
    const view = viewRef.current;
    if (view) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.toString().length, insert: code } });
      setDirty(false);
    }
  };

  const isNew = standard !== 'c++17';
  return (
    <figure className="code-figure">
      <figcaption className="code-head">
        <span className="code-name">{name}</span>
        <span className={`std-badge${isNew ? ' is-new' : ''}`} title={isNew ? `Needs a compiler with ${standard.toUpperCase()} support` : 'Compiles with any C++17 compiler'}>
          {standard.toUpperCase()}
        </span>
        {title && title !== name && <span className="code-title">{title}</span>}
        <span className="code-actions">
          <button type="button" onClick={copy} aria-live="polite">{copied ? 'Copied' : 'Copy'}</button>
          {download && (
            <a href={download} download={name}>
              Download
            </a>
          )}
          {editable && !editing && (
            <button type="button" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
          {editing && (
            <>
              <button type="button" onClick={reset} disabled={!dirty}>
                Reset
              </button>
              <button type="button" onClick={() => setEditing(false)}>
                Done
              </button>
            </>
          )}
        </span>
      </figcaption>
      {editing ? (
        <div ref={hostRef} className="code-editor" aria-label={`Editable copy of ${name}`} />
      ) : (
        <div className="code-body" dangerouslySetInnerHTML={{ __html: html }} />
      )}
      {editing && (
        <p className="code-note">
          You are editing a copy in your browser. Nothing is compiled or run here: copy or download the code and build it with your
          own compiler.
        </p>
      )}
      {(build || expected) && (
        <div className="code-foot">
          {build && (
            <details>
              <summary className="label">Build and run it yourself</summary>
              <pre>
                <code>{build}</code>
              </pre>
              {stdin && (
                <>
                  <span className="label">Input typed by the user</span>
                  <pre>
                    <code>{stdin}</code>
                  </pre>
                </>
              )}
            </details>
          )}
          {expectCompileError && <p>This program is meant to fail to compile; the lesson explains the compiler's message.</p>}
          {expected && (
            <details>
              <summary className="label">Expected output</summary>
              <pre>
                <code>{expected}</code>
              </pre>
            </details>
          )}
        </div>
      )}
    </figure>
  );
}
