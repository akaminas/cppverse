import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import 'd3-transition';
import type { DomainId, EdgeType } from '../../data/types';
import { actions } from '../../lib/persistence/store';
import { completedConcepts, useLearner } from '../progress/useLearner';
import AtlasPanel from './AtlasPanel';
import { DEPENDENCY, EDGE_STYLE, closure, edgePath, labelWidthPx, searchNodes, type AtlasData, type AtlasNode } from './atlasData';
import { routeSteps } from './route';

// The C++ Atlas: a hierarchical, zoomable knowledge graph with semantic zoom.
//
// Scale 1 (landscape): regions, domains and the four destinations.
// Scale 2 (domains):   concept nodes appear; only key labels; aggregated links.
// Scale 3 (concepts):  every label that fits, every dependency edge.
// Scale 4 (detail):    a selected node opens its panel, the map stays in view.
//
// The layout is precomputed and deterministic; nothing moves on its own.

type FocusMode = 'neighbours' | 'back' | 'forward';
type Semantic = 1 | 2 | 3;

interface Props {
  data: AtlasData;
  checkCounts: Record<string, number>;
}

const PAD = 90;
const PANEL_W = 380;
const LEVEL_AT = { two: 0.42, three: 0.72 };
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Atlas({ data, checkCounts }: Props) {
  const { state, ready } = useLearner();
  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data.nodes]);
  const domainById = useMemo(() => new Map(data.domains.map((d) => [d.id, d])), [data.domains]);
  const vb = useMemo(
    () => ({ x: data.bounds.x - PAD, y: data.bounds.y - PAD, w: data.bounds.w + 2 * PAD, h: data.bounds.h + 2 * PAD }),
    [data.bounds],
  );

  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef<ZoomTransform>(zoomIdentity);
  const s0Ref = useRef(0.3);
  const narrowRef = useRef(false);

  const [semantic, setSemantic] = useState<Semantic>(1);
  const [bucket, setBucket] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<FocusMode>('neighbours');
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [kbd, setKbd] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isNarrow, setIsNarrow] = useState(false);
  const [announce, setAnnounce] = useState('');

  const completed = useMemo(() => completedConcepts(state, data.nodes, checkCounts), [state, data.nodes, checkCounts]);
  const visitedConcepts = useMemo(
    () => new Set(data.nodes.filter((n) => n.lesson && state.visited[n.lesson]).map((n) => n.id)),
    [state.visited, data.nodes],
  );
  const bookmarks = useMemo(() => new Set(state.bookmarks), [state.bookmarks]);
  const here = state.recent[0] ?? null;

  // ── Route (learning pathway) ─────────────────────────────────────────────
  const route = useMemo(() => {
    if (!goal || !ready) return null;
    const g = data.goals.find((x) => x.id === goal);
    if (!g) return null;
    const profile = state.profile ?? { level: 'beginner' as const, cpp: 0 as const, modelling: 0 as const };
    return routeSteps(data, g.targets, profile, completed);
  }, [goal, ready, data, state.profile, completed]);
  const routeIndex = useMemo(() => new Map((route ?? []).map((s, i) => [s.id, i])), [route]);

  // ── Highlight set ───────────────────────────────────────────────────────
  const focusId = selected ?? (hover && !isNarrow ? hover.id : null);
  const highlight = useMemo(() => {
    if (!focusId) return null;
    const n = byId.get(focusId);
    if (!n) return null;
    if (mode === 'back' && selected) return new Set([focusId, ...closure(byId, focusId, 'back')]);
    if (mode === 'forward' && selected) return new Set([focusId, ...closure(byId, focusId, 'forward')]);
    const set = new Set([focusId, ...n.deps, ...n.enables]);
    for (const e of data.edges) {
      if (e.type === 'conceptual' || e.type === 'validation') {
        if (e.from === focusId) set.add(e.to);
        if (e.to === focusId) set.add(e.from);
      }
    }
    return set;
  }, [focusId, mode, selected, byId, data.edges]);

  // ── Zoom ────────────────────────────────────────────────────────────────
  const applyScale = useCallback((k: number) => {
    const sEff = k * s0Ref.current;
    svgRef.current?.style.setProperty('--k', sEff.toFixed(4));
    const level: Semantic = sEff < LEVEL_AT.two ? 1 : sEff < LEVEL_AT.three ? 2 : 3;
    setSemantic((prev) => (prev === level ? prev : level));
    const b = Math.round(Math.log(sEff) / Math.log(1.22));
    setBucket((prev) => (prev === b ? prev : b));
  }, []);

  const measure = useCallback(() => {
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    s0Ref.current = Math.min(rect.width / vb.w, rect.height / vb.h) || 0.3;
    narrowRef.current = rect.width < 760;
    setIsNarrow(narrowRef.current);
    applyScale(transformRef.current.k);
  }, [vb, applyScale]);

  useEffect(() => {
    const svgEl = svgRef.current;
    const gEl = gRef.current;
    if (!svgEl || !gEl) return;
    const z = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 9])
      .translateExtent([
        [vb.x - vb.w * 0.4, vb.y - vb.h * 0.4],
        [vb.x + vb.w * 1.4, vb.y + vb.h * 1.4],
      ])
      .on('zoom', (ev: { transform: ZoomTransform }) => {
        transformRef.current = ev.transform;
        gEl.setAttribute('transform', ev.transform.toString());
        applyScale(ev.transform.k);
        setHover(null);
      });
    zoomRef.current = z;
    const sel = select(svgEl);
    sel.call(z).on('dblclick.zoom', null);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(svgEl);
    return () => {
      ro.disconnect();
      sel.on('.zoom', null);
    };
  }, [vb, measure, applyScale]);

  const setTransform = useCallback((t: ZoomTransform, animate = true) => {
    const svgEl = svgRef.current;
    const z = zoomRef.current;
    if (!svgEl || !z) return;
    const sel = select(svgEl);
    if (animate && !reducedMotion()) sel.transition().duration(480).call(z.transform, t);
    else sel.call(z.transform, t);
  }, []);

  /** Screen rectangle not covered by the floating panel (or the bottom sheet). */
  const freeArea = useCallback(() => {
    const el = svgRef.current;
    const rect = el?.getBoundingClientRect();
    const cw = rect?.width ?? 1200;
    const ch = rect?.height ?? 800;
    if (narrowRef.current) return { x: 0, y: 0, w: cw, h: ch * 0.56, cw, ch };
    return { x: 0, y: 0, w: Math.max(200, cw - PANEL_W - 32), h: ch, cw, ch };
  }, []);

  /** Put world point (X, Y) at the centre of the free area at effective scale sEff. */
  const centreOn = useCallback(
    (X: number, Y: number, sEff: number, animate = true) => {
      const a = freeArea();
      const s0 = s0Ref.current;
      const k = Math.max(0.6, Math.min(9, sEff / s0));
      const offX = (a.cw - vb.w * s0) / 2;
      const offY = (a.ch - vb.h * s0) / 2;
      const tx = (a.x + a.w / 2 - offX) / s0 + vb.x - k * X;
      const ty = (a.y + a.h / 2 - offY) / s0 + vb.y - k * Y;
      setTransform(zoomIdentity.translate(tx, ty).scale(k), animate);
    },
    [vb, freeArea, setTransform],
  );

  /** Fit the whole map into the free area. */
  const fitAll = useCallback(
    (animate = true) => {
      const a = freeArea();
      if (narrowRef.current) {
        // Phones: fit the height and start at the western foundations; pan east.
        const sEff = (a.h - 60) / data.bounds.h;
        centreOn(data.bounds.x + (a.w / 2 - 12) / sEff, data.bounds.y + data.bounds.h / 2, sEff, animate);
        return;
      }
      const sEff = Math.min((a.w - 40) / data.bounds.w, (a.h - 70) / data.bounds.h);
      centreOn(data.bounds.x + data.bounds.w / 2, data.bounds.y + data.bounds.h / 2, sEff, animate);
    },
    [freeArea, centreOn, data.bounds],
  );

  const fitDomain = useCallback(
    (id: DomainId) => {
      const d = domainById.get(id);
      const el = svgRef.current;
      if (!d || !el) return;
      const rect = el.getBoundingClientRect();
      const sEff = Math.min((rect.width * 0.8) / d.box.w, (rect.height * 0.75) / d.box.h, 1.3);
      centreOn(d.box.x + d.box.w / 2, d.box.y + d.box.h / 2, sEff);
    },
    [domainById, centreOn],
  );

  const resetView = useCallback(() => fitAll(), [fitAll]);
  const zoomBy = useCallback((f: number) => {
    const svgEl = svgRef.current;
    const z = zoomRef.current;
    if (!svgEl || !z) return;
    const sel = select(svgEl);
    if (reducedMotion()) sel.call(z.scaleBy, f);
    else sel.transition().duration(250).call(z.scaleBy, f);
  }, []);

  // ── Selection and URL state ─────────────────────────────────────────────
  const selectNode = useCallback(
    (id: string | null, { push = true, centre = true }: { push?: boolean; centre?: boolean } = {}) => {
      setSelected((prev) => {
        if (prev && id && prev !== id) setHistory((h) => [...h.slice(-30), prev]);
        return id;
      });
      setMode('neighbours');
      if (id) {
        const n = byId.get(id);
        if (n) {
          actions.touch(id);
          setAnnounce(`${n.title} selected. ${n.summary}`);
          if (centre) centreOn(n.x, n.y, Math.max(1.05, transformRef.current.k * s0Ref.current));
        }
      }
      if (push && typeof window !== 'undefined') {
        const u = new URL(window.location.href);
        if (id) u.searchParams.set('node', id);
        else u.searchParams.delete('node');
        window.history.pushState({ node: id }, '', u);
      }
    },
    [byId, centreOn],
  );

  const goBack = useCallback(() => {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (prev) {
        setSelected(prev);
        const n = byId.get(prev);
        if (n) centreOn(n.x, n.y, Math.max(1.05, transformRef.current.k * s0Ref.current));
      }
      return h.slice(0, -1);
    });
  }, [byId, centreOn]);

  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      const node = params.get('node');
      const g = params.get('goal');
      const dom = params.get('domain') as DomainId | null;
      if (g) setGoal(g);
      if (node && byId.has(node)) {
        setSelected(node);
        const n = byId.get(node)!;
        requestAnimationFrame(() => centreOn(n.x, n.y, 1.1, false));
      } else {
        setSelected(null);
        if (dom && domainById.has(dom)) requestAnimationFrame(() => fitDomain(dom));
        else requestAnimationFrame(() => fitAll(false));
      }
    };
    read();
    const onPop = () => read();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready && goal === null && state.pathway && !new URLSearchParams(window.location.search).get('goal')) setGoal(state.pathway);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const chooseGoal = useCallback((g: string | null) => {
    setGoal(g);
    actions.setPathway(g);
    const u = new URL(window.location.href);
    if (g) u.searchParams.set('goal', g);
    else u.searchParams.delete('goal');
    window.history.replaceState(window.history.state, '', u);
  }, []);

  // ── Keyboard navigation ─────────────────────────────────────────────────
  const moveFocus = useCallback(
    (dx: number, dy: number) => {
      const from = byId.get(kbd ?? selected ?? here ?? 'programs-and-algorithms') ?? data.nodes[0];
      let best: AtlasNode | null = null;
      let bestScore = Infinity;
      for (const n of data.nodes) {
        if (n.id === from.id) continue;
        const vx = n.x - from.x;
        const vy = n.y - from.y;
        const along = vx * dx + vy * dy;
        if (along <= 0) continue;
        const perp = Math.abs(vx * dy - vy * dx);
        if (perp > along * 1.4) continue;
        const score = along + perp * 2.2;
        if (score < bestScore) (bestScore = score), (best = n);
      }
      if (!best) return;
      setKbd(best.id);
      setAnnounce(`${best.title}. ${domainById.get(best.domain)?.title}. Press Enter to open.`);
      const t = transformRef.current;
      const sx = (t.applyX(best.x) - vb.x) / vb.w;
      const sy = (t.applyY(best.y) - vb.y) / vb.h;
      if (sx < 0.08 || sx > 0.85 || sy < 0.1 || sy > 0.9 || t.k * s0Ref.current < 0.7) centreOn(best.x, best.y, Math.max(0.95, t.k * s0Ref.current));
      requestAnimationFrame(() => document.getElementById(`node-${best!.id}`)?.focus({ preventScroll: true }));
    },
    [byId, kbd, selected, here, data.nodes, domainById, vb, centreOn],
  );

  const onKeyDown = (e: ReactKeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return;
    const dirs: Record<string, [number, number]> = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (dirs[e.key]) {
      e.preventDefault();
      moveFocus(...dirs[e.key]);
    } else if ((e.key === 'Enter' || e.key === ' ') && kbd) {
      e.preventDefault();
      selectNode(kbd);
    } else if (e.key === 'Escape') {
      if (selected) selectNode(null);
      setKbd(null);
    } else if (e.key === '+' || e.key === '=') zoomBy(1.4);
    else if (e.key === '-' || e.key === '_') zoomBy(1 / 1.4);
    else if (e.key === '0') resetView();
    else if (e.key === '/') {
      e.preventDefault();
      document.getElementById('atlas-search')?.focus();
    }
  };

  // ── Labels: greedy placement for the current zoom bucket ────────────────
  const sEffBucket = Math.pow(1.22, bucket);
  const labels = useMemo(() => {
    const s = sEffBucket;
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const out: { id: string; x: number; y: number; anchor: 'start' | 'end' | 'middle' }[] = [];
    const discs = data.nodes.map((n) => ({ x: n.x, y: n.y, r: n.r + 2 / s }));
    const priority = (n: AtlasNode) =>
      (n.id === selected ? 1e6 : 0) +
      (highlight?.has(n.id) ? 1e5 : 0) +
      (routeIndex.has(n.id) ? 5e4 : 0) +
      (n.kind === 'landmark' ? 2e4 : n.kind === 'capstone' ? 900 : n.kind === 'integration' ? 1000 : 0) +
      (n.deps.length + n.enables.length) * 10 -
      (n.optional ? 50 : 0);
    let candidates = [...data.nodes];
    if (semantic === 1) candidates = candidates.filter((n) => n.id === selected);
    candidates.sort((a, b) => priority(b) - priority(a));
    const overlaps = (r: { x: number; y: number; w: number; h: number }) =>
      placed.some((p) => r.x < p.x + p.w && p.x < r.x + r.w && r.y < p.y + p.h && p.y < r.y + r.h) ||
      discs.some((d) => d.x > r.x - d.r && d.x < r.x + r.w + d.r && d.y > r.y - d.r && d.y < r.y + r.h + d.r);
    for (const n of candidates) {
      if (n.kind === 'landmark') {
        out.push({ id: n.id, x: n.x, y: n.y + n.r + 22 / s, anchor: 'middle' });
        placed.push({ x: n.x - labelWidthPx(n.label) * 0.75 / s, y: n.y + n.r, w: (labelWidthPx(n.label) * 1.5) / s, h: 30 / s });
        continue;
      }
      const w = labelWidthPx(n.label) / s;
      const h = 15 / s;
      const gap = 6 / s;
      const opts: [number, number, 'start' | 'end' | 'middle', { x: number; y: number; w: number; h: number }][] = [
        [n.x + n.r + gap, n.y, 'start', { x: n.x + n.r + gap, y: n.y - h / 2, w, h }],
        [n.x - n.r - gap, n.y, 'end', { x: n.x - n.r - gap - w, y: n.y - h / 2, w, h }],
        [n.x, n.y - n.r - gap - h / 2, 'middle', { x: n.x - w / 2, y: n.y - n.r - gap - h, w, h }],
        [n.x, n.y + n.r + gap + h / 2, 'middle', { x: n.x - w / 2, y: n.y + n.r + gap, w, h }],
      ];
      for (const [x, y, anchor, rect] of opts) {
        const ownDisc = discs.findIndex((d) => d.x === n.x && d.y === n.y);
        const saved = discs[ownDisc];
        discs[ownDisc] = { x: 1e9, y: 1e9, r: 0 };
        const bad = overlaps(rect);
        discs[ownDisc] = saved;
        if (!bad) {
          placed.push(rect);
          out.push({ id: n.id, x, y, anchor });
          break;
        }
      }
    }
    return out;
  }, [data.nodes, semantic, sEffBucket, selected, highlight, routeIndex]);

  // ── Derived drawing data ────────────────────────────────────────────────
  const minR = semantic === 1 ? 2.4 / sEffBucket : 0;
  const domainEdges = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of data.edges) {
      if (!DEPENDENCY.has(e.type)) continue;
      const a = byId.get(e.from)!.domain;
      const b = byId.get(e.to)!.domain;
      if (a === b) continue;
      const key = `${a}>${b}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts].map(([key, count]) => {
      const [a, b] = key.split('>') as [DomainId, DomainId];
      return { a: domainById.get(a)!, b: domainById.get(b)!, count };
    });
  }, [data.edges, byId, domainById]);

  const visibleEdges = useMemo(() => {
    return data.edges.filter((e) => {
      const lit = highlight && highlight.has(e.from) && highlight.has(e.to) && (focusId === e.from || focusId === e.to || mode !== 'neighbours');
      if (lit) return mode === 'neighbours' || DEPENDENCY.has(e.type);
      if (route && routeIndex.has(e.from) && routeIndex.has(e.to) && DEPENDENCY.has(e.type)) return true;
      if (!DEPENDENCY.has(e.type)) return false;
      if (semantic === 1) return false;
      if (semantic === 2) return byId.get(e.from)!.domain === byId.get(e.to)!.domain;
      return true;
    });
  }, [data.edges, highlight, focusId, mode, route, routeIndex, semantic, byId]);

  const nodeFill = (n: AtlasNode) => {
    const fam = domainById.get(n.domain)?.family;
    return fam ? `var(--v-${fam})` : 'var(--v-muted)';
  };

  const selectedNode = selected ? byId.get(selected) ?? null : null;
  const hoverNode = hover && !selected ? byId.get(hover.id) ?? null : null;

  return (
    <div ref={wrapRef} className={`atlas sem-${semantic}${selected ? ' has-selection' : ''}${route ? ' has-route' : ''}${isNarrow ? ' is-narrow' : ''}`} onKeyDown={onKeyDown}>
      <AtlasPanel
        data={data}
        byId={byId}
        selected={selectedNode}
        mode={mode}
        setMode={setMode}
        onSelect={(id) => selectNode(id)}
        onClose={() => selectNode(null)}
        onBack={history.length ? goBack : undefined}
        onDomain={fitDomain}
        goal={goal}
        onGoal={chooseGoal}
        route={route}
        completed={completed}
        visited={visitedConcepts}
        bookmarks={bookmarks}
        onBookmark={(id) => actions.toggleBookmark(id)}
        profileLevel={state.profile?.level ?? null}
        search={(q) => searchNodes(data.nodes, q)}
        onZoom={zoomBy}
        onReset={resetView}
        isNarrow={isNarrow}
      />

      <svg
        ref={svgRef}
        className="atlas-svg"
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label="Concept atlas. Use the arrow keys to move between concepts, Enter to open one, Escape to clear, plus and minus to zoom, 0 to reset, slash to search."
        tabIndex={0}
        onClick={(e) => {
          if (e.target === svgRef.current) selectNode(null);
        }}
        style={{ ['--k' as string]: 0.3 }}
      >
        <defs>
          <marker id="atlas-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" fill="var(--v-terracotta)" />
          </marker>
        </defs>
        <g ref={gRef}>
          {/* Aggregated links between domains (landscape and domain scales). */}
          <g className="atlas-domain-links">
            {domainEdges.filter(({ count }) => count >= 2).map(({ a, b, count }) => {
              const x1 = a.box.x + a.box.w;
              const y1 = a.box.y + a.box.h / 2;
              const x2 = b.box.x;
              const y2 = b.box.y + b.box.h / 2;
              const backwards = x2 < x1;
              const d = backwards
                ? `M${a.box.x + a.box.w / 2},${a.box.y + a.box.h}C${a.box.x + a.box.w / 2},${a.box.y + a.box.h + 140} ${b.box.x + b.box.w / 2},${b.box.y - 140} ${b.box.x + b.box.w / 2},${b.box.y}`
                : `M${x1},${y1}C${x1 + 110},${y1} ${x2 - 110},${y2} ${x2},${y2}`;
              return <path key={`${a.id}-${b.id}`} d={d} className="atlas-domain-link" style={{ strokeWidth: 0.8 + Math.log2(count + 1) * 0.9 }} />;
            })}
          </g>

          {/* Domain regions: contour rings; destinations rise higher (more rings). */}
          <g className="atlas-domains">
            {data.domains.map((d) => {
              const rings = d.kind === 'destination' ? 4 : d.kind === 'synthesis' ? 3 : 2;
              const fam = d.family;
              const lit = !highlight || data.nodes.some((n) => n.domain === d.id && highlight.has(n.id));
              return (
                <g key={d.id} className={`atlas-domain kind-${d.kind}${lit ? '' : ' is-faded'}`}>
                  {Array.from({ length: rings }, (_, i) => {
                    const off = (rings - 1 - i) * 16;
                    return (
                      <rect
                        key={i}
                        x={d.box.x - off}
                        y={d.box.y - off}
                        width={d.box.w + 2 * off}
                        height={d.box.h + 2 * off}
                        rx={34 + off}
                        className="atlas-ring"
                        style={fam ? { stroke: `var(--v-${fam}-tint)` } : undefined}
                        fill={i === rings - 1 ? (fam ? `var(--v-${fam}-tint)` : 'var(--panel)') : 'none'}
                        fillOpacity={i === rings - 1 ? (fam ? 0.22 : 1) : undefined}
                      />
                    );
                  })}
                  <g
                    className="atlas-domain-label"
                    role="button"
                    tabIndex={-1}
                    aria-label={`${d.title}. Zoom to this domain.`}
                    onClick={(e) => {
                      e.stopPropagation();
                      fitDomain(d.id);
                    }}
                  >
                    <text className="atlas-domain-title" x={d.box.x + d.box.w / 2} y={d.box.y + d.box.h / 2} dy="-0.25em">
                      {d.title}
                    </text>
                    <text className="atlas-domain-sub" x={d.box.x + d.box.w / 2} y={d.box.y + d.box.h / 2} dy="1.9em">
                      {d.modules.length ? `Module${d.modules.length > 1 ? 's' : ''} ${d.modules.join(', ')}` : 'Original synthesis'} ·{' '}
                      {data.nodes.filter((n) => n.domain === d.id && n.kind !== 'landmark').length} nodes
                    </text>
                    <text className="atlas-domain-caps" x={d.box.x + 30} y={d.box.y + 42}>
                      {d.modules.length ? `${d.title} · M${d.modules.join(', ')}` : d.title}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Region captions (landscape only). */}
          <g className="atlas-regions">
            {data.regions.map((r) => (
              <text key={r.id} x={r.x} y={r.y} className="atlas-region">{r.title}</text>
            ))}
          </g>

          <g className="atlas-edges">
            {visibleEdges.map((e) => {
              const a = byId.get(e.from)!;
              const b = byId.get(e.to)!;
              const lit = highlight?.has(e.from) && highlight?.has(e.to);
              const onRoute = !lit && route && routeIndex.has(e.from) && routeIndex.has(e.to);
              const style = EDGE_STYLE[e.type as EdgeType];
              return (
                <path
                  key={`${e.from}-${e.to}-${e.type}`}
                  d={edgePath(a, b, a.domain === b.domain)}
                  className={`atlas-edge type-${e.type}${lit ? ' is-lit' : ''}${onRoute ? ' is-route' : ''}${highlight && !lit ? ' is-faded' : ''}`}
                  strokeDasharray={style.dash}
                  markerEnd={lit || onRoute ? 'url(#atlas-arrow)' : undefined}
                />
              );
            })}
          </g>

          <g className="atlas-nodes">
            {data.nodes.map((n) => {
              const lit = !highlight || highlight.has(n.id);
              const isSel = n.id === selected;
              const step = routeIndex.get(n.id);
              const status = route && step !== undefined ? route[step].status : null;
              const r = Math.max(n.r, minR);
              const fill = isSel ? 'var(--v-terracotta-deep)' : highlight ? (lit ? 'var(--v-terracotta)' : 'var(--v-grid)') : nodeFill(n);
              const done = completed.has(n.id);
              return (
                <g
                  key={n.id}
                  id={`node-${n.id}`}
                  className={`atlas-node kind-${n.kind}${n.optional ? ' is-optional' : ''}${lit ? '' : ' is-faded'}${kbd === n.id ? ' is-kbd' : ''}${status ? ` route-${status}` : ''}`}
                  transform={`translate(${n.x},${n.y})`}
                  role="button"
                  tabIndex={kbd === n.id ? 0 : -1}
                  aria-label={`${n.title}. ${domainById.get(n.domain)?.title}. ${n.kind === 'landmark' ? 'Modelling destination.' : ''} ${done ? 'Completed.' : ''}`}
                  aria-pressed={isSel}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectNode(n.id);
                  }}
                  onFocus={() => setKbd(n.id)}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse') {
                      const rect = wrapRef.current?.getBoundingClientRect();
                      setHover({ id: n.id, x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) });
                    }
                  }}
                  onPointerLeave={() => setHover(null)}
                >
                  {n.kind === 'landmark' && (
                    <>
                      <circle r={r * 1.9} className="atlas-landmark-halo" style={{ fill: `var(--v-${domainById.get(n.domain)?.family}-tint)` }} />
                      <circle r={r * 1.45} className="atlas-landmark-ring" />
                    </>
                  )}
                  {status === 'next' && <circle r={r + 9} className="atlas-next-ring" />}
                  {status && <circle r={r + 4.5} className="atlas-route-ring" />}
                  {n.id === here && <circle r={r + 14} className="atlas-here" />}
                  {n.kind === 'capstone' ? (
                    <rect x={-r} y={-r} width={2 * r} height={2 * r} transform="rotate(45)" rx={2} fill={fill} className="atlas-dot" />
                  ) : n.optional ? (
                    <circle r={r} className="atlas-dot atlas-dot-optional" style={{ stroke: fill }} />
                  ) : (
                    <circle r={r} fill={fill} className="atlas-dot" />
                  )}
                  {n.kind === 'integration' && <circle r={r * 0.45} className="atlas-inner" />}
                  {done && <path d={`M${-r * 0.45},0 L${-r * 0.1},${r * 0.38} L${r * 0.5},${-r * 0.38}`} className="atlas-check" />}
                  {!done && visitedConcepts.has(n.id) && <circle r={r * 0.32} className="atlas-visited" />}
                  {bookmarks.has(n.id) && <path d={`M${r * 0.7},${-r * 1.7} v${r * 1.1} M${r * 0.7},${-r * 1.7} l${r * 0.8},${r * 0.28} l${-r * 0.8},${r * 0.28}`} className="atlas-bookmark" />}
                  {kbd === n.id && <circle r={r + 6} className="atlas-kbd-ring" />}
                </g>
              );
            })}
          </g>

          <g className="atlas-labels" aria-hidden="true">
            {labels.map((l) => {
              const n = byId.get(l.id)!;
              const lit = !highlight || highlight.has(n.id);
              const step = routeIndex.get(n.id);
              return (
                <text
                  key={l.id}
                  x={l.x}
                  y={l.y}
                  textAnchor={l.anchor}
                  dominantBaseline="middle"
                  className={`atlas-label kind-${n.kind}${lit ? '' : ' is-faded'}${n.id === selected ? ' is-selected' : ''}`}
                >
                  {step !== undefined && semantic > 1 && route![step].status !== 'assumed' ? `${step + 1} · ` : ''}
                  {n.kind === 'landmark' ? n.title : n.label}
                </text>
              );
            })}
          </g>
        </g>
      </svg>

      {hoverNode && hover && (
        <div className="atlas-tip" style={{ left: hover.x + 16, top: hover.y + 12 }} role="status">
          <div className="atlas-tip-head">{domainById.get(hoverNode.domain)?.title}</div>
          <strong>{hoverNode.title}</strong>
          <p>{hoverNode.summary}</p>
        </div>
      )}

      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  );
}
