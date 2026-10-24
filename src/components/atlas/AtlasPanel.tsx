import { useId, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { DomainId, Level } from '../../data/types';
import type { RouteStep } from '../../lib/graph/routes';
import { EDGE_STYLE, KIND_LABEL, LEVEL_LABEL, nodeHref, type AtlasData, type AtlasNode } from './atlasData';

interface Props {
  data: AtlasData;
  byId: Map<string, AtlasNode>;
  selected: AtlasNode | null;
  mode: 'neighbours' | 'back' | 'forward';
  setMode: (m: 'neighbours' | 'back' | 'forward') => void;
  onSelect: (id: string) => void;
  onClose: () => void;
  onBack?: () => void;
  onDomain: (id: DomainId) => void;
  goal: string | null;
  onGoal: (g: string | null) => void;
  route: RouteStep[] | null;
  completed: Set<string>;
  visited: Set<string>;
  bookmarks: Set<string>;
  onBookmark: (id: string) => void;
  profileLevel: Level | null;
  search: (q: string) => AtlasNode[];
  onZoom: (factor: number) => void;
  onReset: () => void;
  isNarrow: boolean;
}

function NodeList({ ids, byId, onSelect, empty }: { ids: string[]; byId: Map<string, AtlasNode>; onSelect: (id: string) => void; empty?: string }) {
  if (!ids.length) return empty ? <p className="atlas-empty">{empty}</p> : null;
  return (
    <ul className="atlas-list">
      {ids.map((id) => {
        const n = byId.get(id);
        if (!n) return null;
        return (
          <li key={id}>
            <button type="button" onClick={() => onSelect(id)}>
              <span className={`atlas-li-dot kind-${n.kind}`} aria-hidden="true" />
              {n.title}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function AtlasPanel(props: Props) {
  const { data, byId, selected, mode, setMode, onSelect, onClose, onBack, onDomain, goal, onGoal, route, completed, visited, bookmarks, onBookmark, search, onZoom, onReset, isNarrow } = props;
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const results = useMemo(() => search(query), [query, search]);
  const base = data.base;

  const pick = (id: string) => {
    onSelect(id);
    setQuery('');
    setActive(0);
  };
  const onSearchKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      pick(results[active].id);
    } else if (e.key === 'Escape') {
      setQuery('');
    }
  };

  const related = useMemo(() => {
    if (!selected) return { conceptual: [], validation: [] };
    const conceptual: string[] = [];
    const validation: string[] = [];
    for (const e of data.edges) {
      if (e.type === 'conceptual' && (e.from === selected.id || e.to === selected.id)) conceptual.push(e.from === selected.id ? e.to : e.from);
      if (e.type === 'validation' && (e.from === selected.id || e.to === selected.id)) validation.push(e.from === selected.id ? e.to : e.from);
    }
    return { conceptual, validation };
  }, [selected, data.edges]);

  const edgeTypeTo = (from: string, to: string) => data.edges.find((e) => e.from === from && e.to === to)?.type;

  const routeSummary = useMemo(() => {
    if (!route) return null;
    const todo = route.filter((s) => s.status === 'todo' || s.status === 'next');
    return { total: route.length, done: route.filter((s) => s.status === 'done').length, assumed: route.filter((s) => s.status === 'assumed').length, todo, next: route.find((s) => s.status === 'next') ?? null };
  }, [route]);

  const domain = selected ? data.domains.find((d) => d.id === selected.domain) : null;
  const href = selected ? nodeHref(selected, base) : null;

  return (
    <aside className={`atlas-panel${selected ? ' is-detail' : ''}${expanded ? ' is-expanded' : ''}`} aria-label="Atlas controls and details">
      <div className="atlas-tools">
        <div className="atlas-search" role="combobox" aria-expanded={results.length > 0} aria-owns={listId} aria-haspopup="listbox">
          <label htmlFor="atlas-search" className="sr-only">Search concepts</label>
          <input
            id="atlas-search"
            type="search"
            placeholder="Search concepts (press /)"
            value={query}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onSearchKey}
          />
          {results.length > 0 && (
            <ul id={listId} role="listbox" className="atlas-results">
              {results.map((n, i) => (
                <li
                  key={n.id}
                  id={`${listId}-${n.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(n.id);
                  }}
                >
                  <strong>{n.title}</strong>
                  <span>{data.domains.find((d) => d.id === n.domain)?.title}</span>
                </li>
              ))}
            </ul>
          )}
          {query && results.length === 0 && <p className="atlas-empty" role="status">No concept matches “{query}”.</p>}
        </div>
        <div className="atlas-zoom" role="group" aria-label="Zoom">
          <button type="button" className="icon-btn" onClick={() => onZoom(1.5)} aria-label="Zoom in">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" /></svg>
          </button>
          <button type="button" className="icon-btn" onClick={() => onZoom(1 / 1.5)} aria-label="Zoom out">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg>
          </button>
          <button type="button" className="icon-btn" onClick={onReset} aria-label="Show the whole atlas">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
          </button>
        </div>
      </div>

      <div className="atlas-panel-body">
        {isNarrow && (
          <button type="button" className="atlas-sheet-toggle" aria-expanded={expanded} onClick={() => setExpanded((x) => !x)}>
            <span aria-hidden="true" className="atlas-sheet-grip" />
            <span className="sr-only">{expanded ? 'Collapse the panel' : 'Expand the panel'}</span>
          </button>
        )}

        {selected ? (
          <div className="atlas-detail">
            <div className="atlas-detail-nav">
              {onBack && (
                <button type="button" className="btn btn-ghost" onClick={onBack}>
                  ← Back
                </button>
              )}
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close the details">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <p className="eyebrow">
              <button type="button" className="atlas-crumb" onClick={() => onDomain(selected.domain)}>{domain?.title}</button>
              {' · '}
              {KIND_LABEL[selected.kind]}
            </p>
            <h2 className="atlas-detail-title">{selected.title}</h2>
            <div className="atlas-tags">
              <span className="tag">{LEVEL_LABEL[selected.level]}</span>
              {selected.optional && <span className="tag">Optional branch</span>}
              {selected.standard && <span className="tag">{selected.standard.toUpperCase()}</span>}
              {completed.has(selected.id) ? (
                <span className="tag status status-good">Studied</span>
              ) : visited.has(selected.id) ? (
                <span className="tag">Visited</span>
              ) : null}
            </div>
            <p className="atlas-summary">{selected.summary}</p>
            {selected.goals.length > 0 && (
              <ul className="atlas-goals">
                {selected.goals.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            )}
            <div className="cta-row atlas-actions">
              {href && (
                <a className="btn-solid" href={href}>
                  {selected.kind === 'landmark' ? 'Open the destination' : selected.kind === 'capstone' ? 'Open the capstone' : 'Open the lesson'}
                </a>
              )}
              <button type="button" className="btn" aria-pressed={bookmarks.has(selected.id)} onClick={() => onBookmark(selected.id)}>
                {bookmarks.has(selected.id) ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>
            <div className="seg atlas-modes" role="group" aria-label="Highlight">
              <button type="button" aria-pressed={mode === 'neighbours'} onClick={() => setMode('neighbours')}>Neighbours</button>
              <button type="button" aria-pressed={mode === 'back'} onClick={() => setMode('back')}>All it needs</button>
              <button type="button" aria-pressed={mode === 'forward'} onClick={() => setMode('forward')}>All it enables</button>
            </div>

            <section className="atlas-sec">
              <h3>Needs first</h3>
              <NodeList ids={selected.deps} byId={byId} onSelect={onSelect} empty="Nothing: this is where the atlas begins." />
              {selected.deps.length > 0 && (
                <p className="atlas-edge-key">
                  {[...new Set(selected.deps.map((d) => edgeTypeTo(d, selected.id)).filter(Boolean))]
                    .map((t) => `${EDGE_STYLE[t!].label}: ${EDGE_STYLE[t!].description}`)
                    .join(' · ')}
                </p>
              )}
            </section>
            <section className="atlas-sec">
              <h3>Leads to</h3>
              <NodeList ids={selected.enables} byId={byId} onSelect={onSelect} empty="A destination: everything here leads to it." />
            </section>
            {related.conceptual.length > 0 && (
              <section className="atlas-sec">
                <h3>Related ideas</h3>
                <NodeList ids={related.conceptual} byId={byId} onSelect={onSelect} />
              </section>
            )}
            {related.validation.length > 0 && (
              <section className="atlas-sec">
                <h3>Verification links</h3>
                <NodeList ids={related.validation} byId={byId} onSelect={onSelect} />
              </section>
            )}
            {selected.manual.length > 0 && (
              <p className="atlas-source">
                Groningen manual: {selected.manual.map((m) => m.replace(/^M/, '').replace('.adv', ' (advanced)').replace(/-.*$/, '')).join(', ')}
              </p>
            )}
            {selected.manual.length === 0 && selected.kind !== 'capstone' && <p className="atlas-source">Original material of this site.</p>}
          </div>
        ) : (
          <div className="atlas-overview">
            <h2 className="atlas-overview-title">Concept atlas</h2>
            <p className="atlas-summary">
              The foundations of C++ lie to the west; the four modelling destinations rise to the east. Select a concept to see what it
              needs and what it leads to.
            </p>
            <label className="atlas-goal">
              <span className="eyebrow">Pathway</span>
              <select value={goal ?? ''} onChange={(e) => onGoal(e.target.value || null)}>
                <option value="">No pathway: explore freely</option>
                {data.goals.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </label>
            {routeSummary && (
              <div className="atlas-route">
                <p className="atlas-route-meta">
                  {routeSummary.total} steps · {routeSummary.done} studied · {routeSummary.assumed} assumed from your level
                </p>
                {routeSummary.next ? (
                  <p>
                    Next:{' '}
                    <button type="button" className="atlas-inline" onClick={() => onSelect(routeSummary.next!.id)}>
                      {byId.get(routeSummary.next.id)?.title}
                    </button>
                  </p>
                ) : (
                  <p>Every step of this pathway is studied or assumed.</p>
                )}
                <ol className="atlas-steps">
                  {route!.map((s, i) => (
                    <li key={s.id} className={`step-${s.status}`}>
                      <button type="button" onClick={() => onSelect(s.id)}>
                        <span className="atlas-step-n">{i + 1}</span>
                        {byId.get(s.id)?.title}
                        <span className="sr-only">
                          {s.status === 'done' ? ' (studied)' : s.status === 'assumed' ? ' (assumed known)' : s.status === 'next' ? ' (next)' : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {bookmarks.size > 0 && (
              <section className="atlas-sec">
                <h3>Bookmarks</h3>
                <NodeList ids={[...bookmarks]} byId={byId} onSelect={onSelect} />
              </section>
            )}
            <section className="atlas-sec">
              <h3>Destinations</h3>
              <NodeList ids={data.nodes.filter((n) => n.kind === 'landmark').map((n) => n.id)} byId={byId} onSelect={onSelect} />
            </section>
            <details className="atlas-legend">
              <summary>How to read the atlas</summary>
              <ul>
                <li><span className="lg-dot" /> Concept, anchored in a lesson</li>
                <li><span className="lg-dot lg-optional" /> Optional or advanced branch</li>
                <li><span className="lg-dot lg-landmark" /> Modelling destination (Modules 14–17) and the inference synthesis</li>
                <li><span className="lg-diamond" /> Capstone project</li>
                <li><span className="lg-check">✓</span> Studied · <span className="lg-ring" /> next on your pathway</li>
              </ul>
              <ul>
                {Object.entries(EDGE_STYLE).map(([type, s]) => (
                  <li key={type}>
                    <svg width="34" height="8" aria-hidden="true"><line x1="1" y1="4" x2="33" y2="4" strokeDasharray={s.dash} className="lg-line" /></svg>
                    {s.label}: {s.description}
                  </li>
                ))}
              </ul>
              <p>
                Zoom with the wheel, pinch or the buttons; drag to pan. Arrow keys move between concepts. The layout is fixed and
                deterministic: concepts never move. <a href={`${base.replace(/\/$/, '')}/curriculum/`}>A text outline</a> lists the same
                structure.
              </p>
            </details>
          </div>
        )}
      </div>
    </aside>
  );
}
