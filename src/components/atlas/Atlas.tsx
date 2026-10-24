import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import 'd3-transition';
import type { DomainId, EdgeType } from '../../data/types';
import { actions } from '../../lib/persistence/store';
import { completedConcepts, useLearner } from '../progress/useLearner';
import AtlasPanel from './AtlasPanel';
import { DEPENDENCY, EDGE_STYLE, closure, edgePath, labelWidthPx, searchNodes, type AtlasData, type AtlasNode } from './atlasData';
import { routeSteps } from './route';

// The C++ Atlas: a hierarchical, zoomable knowledge graph with semantic zoom,
// drawn in the manner of a note-taking app's graph view: glowing dots on a
// dot grid, faint cluster halos for domains, labels under the nodes.
//
// Scale 1 (landscape): regions, domains and the four destinations.
// Scale 2 (domains):   only key labels; aggregated links between domains.
// Scale 3 (concepts):  every label that fits, every dependency edge.
// Scale 4 (detail):    a selected node opens its panel, the map stays in view.
//
// Every node has a fixed home in the precomputed, deterministic layout. A
// light spring simulation only adds temporary offsets: nodes bloom out of
// their domains on load, neighbours lean towards a hovered node, and a
// dragged node pulls its neighbours along before everything springs home.

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
      // Pressing on a node drags the node, not the map (mouse only; touch pans).
      .filter((ev: MouseEvent) => (!ev.ctrlKey || ev.type === 'wheel') && !ev.button && !(ev.type === 'mousedown' && (ev.target as Element).closest?.('.atlas-node')))
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
        [n.x, n.y + n.r + gap + h / 2, 'middle', { x: n.x - w / 2, y: n.y + n.r + gap, w, h }],
        [n.x + n.r + gap, n.y, 'start', { x: n.x + n.r + gap, y: n.y - h / 2, w, h }],
        [n.x - n.r - gap, n.y, 'end', { x: n.x - n.r - gap - w, y: n.y - h / 2, w, h }],
        [n.x, n.y - n.r - gap - h / 2, 'middle', { x: n.x - w / 2, y: n.y - n.r - gap - h, w, h }],
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

  // ── Spring offsets (entrance, hover lean, drag) ─────────────────────────
  const neighbours = useMemo(() => {
    const m = new Map<string, Set<string>>(data.nodes.map((n) => [n.id, new Set([...n.deps, ...n.enables])]));
    for (const e of data.edges) {
      m.get(e.from)?.add(e.to);
      m.get(e.to)?.add(e.from);
    }
    return m;
  }, [data.nodes, data.edges]);

  const sim = useRef({
    o: new Map<string, { x: number; y: number; vx: number; vy: number; tx: number; ty: number }>(),
    drag: null as null | { id: string; px: number; py: number; moved: boolean; pointer: number },
    suppressClick: false,
    raf: 0,
  });

  const offsetOf = (id: string) => {
    const m = sim.current.o;
    let s = m.get(id);
    if (!s) {
      s = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
      m.set(id, s);
    }
    return s;
  };

  /** Write the displaced positions straight into the DOM (no React render per frame). */
  const painted = useRef(new Map<string, { x: number; y: number }>());
  const paint = useCallback(
    (all = false) => {
      const g = gRef.current;
      if (!g) return;
      // Only nodes that moved since the last frame are rewritten.
      const dirty = new Set<string>();
      for (const [id, s] of sim.current.o) {
        const last = painted.current.get(id);
        if (all || !last || Math.abs(last.x - s.x) > 0.01 || Math.abs(last.y - s.y) > 0.01) {
          dirty.add(id);
          painted.current.set(id, { x: s.x, y: s.y });
        }
      }
      if (!dirty.size) return;
      const pos = (id: string) => {
        const n = byId.get(id)!;
        const s = sim.current.o.get(id);
        return { ...n, x: n.x + (s?.x ?? 0), y: n.y + (s?.y ?? 0) };
      };
      g.querySelectorAll<SVGGElement>('[data-node]').forEach((el) => {
        if (!dirty.has(el.dataset.node!)) return;
        const p = pos(el.dataset.node!);
        el.setAttribute('transform', `translate(${p.x.toFixed(2)},${p.y.toFixed(2)})`);
      });
      g.querySelectorAll<SVGTextElement>('[data-label]').forEach((el) => {
        if (!dirty.has(el.dataset.label!)) return;
        const s = sim.current.o.get(el.dataset.label!);
        el.setAttribute('transform', `translate(${(s?.x ?? 0).toFixed(2)},${(s?.y ?? 0).toFixed(2)})`);
      });
      g.querySelectorAll<SVGPathElement>('[data-from]').forEach((el) => {
        if (!dirty.has(el.dataset.from!) && !dirty.has(el.dataset.to!)) return;
        el.setAttribute('d', edgePath(pos(el.dataset.from!), pos(el.dataset.to!), el.dataset.straight === '1'));
      });
    },
    [byId],
  );

  // Edges and labels that React has just added are drawn at home; bring them up to date.
  useEffect(() => {
    if ([...sim.current.o.values()].some((s) => s.x || s.y)) paint(true);
  });

  const kick = useCallback(() => {
    const S = sim.current;
    if (S.raf) return;
    const step = () => {
      let moving = false;
      for (const [id, s] of S.o) {
        if (S.drag?.id === id && S.drag.moved) continue;
        s.vx = s.vx * 0.8 + (s.tx - s.x) * 0.075;
        s.vy = s.vy * 0.8 + (s.ty - s.y) * 0.075;
        s.x += s.vx;
        s.y += s.vy;
        if (Math.abs(s.vx) + Math.abs(s.vy) > 0.02 || Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.05) moving = true;
        else {
          s.x = s.tx;
          s.y = s.ty;
          s.vx = s.vy = 0;
        }
      }
      paint();
      S.raf = moving || S.drag ? requestAnimationFrame(step) : 0;
    };
    S.raf = requestAnimationFrame(step);
  }, [paint]);

  useEffect(() => () => cancelAnimationFrame(sim.current.raf), []);

  /** Neighbours of `id` lean towards a target offset; everyone else relaxes home. */
  const setLean = useCallback(
    (id: string | null, fn?: (other: AtlasNode, depth: 1 | 2) => { x: number; y: number }) => {
      const near = new Map<string, 1 | 2>();
      if (id) {
        for (const a of neighbours.get(id) ?? []) near.set(a, 1);
        for (const a of [...near.keys()]) for (const b of neighbours.get(a) ?? []) if (b !== id && !near.has(b)) near.set(b, 2);
      }
      for (const n of data.nodes) {
        if (n.id === id) continue;
        const s = offsetOf(n.id);
        const depth = near.get(n.id);
        const t = depth && fn ? fn(n, depth) : { x: 0, y: 0 };
        s.tx = t.x;
        s.ty = t.y;
      }
      kick();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [neighbours, data.nodes, kick],
  );

  // Entrance: nodes bloom outwards from the centre of their domain.
  useEffect(() => {
    if (reducedMotion()) return;
    for (const n of data.nodes) {
      const d = domainById.get(n.domain);
      if (!d) continue;
      const s = offsetOf(n.id);
      s.x = (d.box.x + d.box.w / 2 - n.x) * 0.92;
      s.y = (d.box.y + d.box.h / 2 - n.y) * 0.92;
      s.vx = s.vy = 0;
    }
    paint();
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hover: first neighbours lean a little towards the hovered node.
  const hoverId = hover?.id ?? null;
  useEffect(() => {
    if (reducedMotion() || sim.current.drag?.moved) return;
    const h = hoverId ? byId.get(hoverId) : null;
    setLean(hoverId, h ? (n, depth) => (depth === 1 ? { x: (h.x - n.x) * 0.06, y: (h.y - n.y) * 0.06 } : { x: 0, y: 0 }) : undefined);
  }, [hoverId, byId, setLean]);

  /** Client coordinates → world coordinates of the zoomed group. */
  const toWorld = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const g = gRef.current;
    const m = g?.getScreenCTM();
    if (!svg || !m) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const w = pt.matrixTransform(m.inverse());
    return { x: w.x, y: w.y };
  };

  const onNodePointerDown = (e: ReactPointerEvent, id: string) => {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    sim.current.drag = { id, px: e.clientX, py: e.clientY, moved: false, pointer: e.pointerId };
  };
  const onNodePointerMove = (e: ReactPointerEvent) => {
    const D = sim.current.drag;
    if (!D || D.pointer !== e.pointerId) return;
    if (!D.moved && Math.hypot(e.clientX - D.px, e.clientY - D.py) < 5) return;
    const n = byId.get(D.id);
    const w = toWorld(e.clientX, e.clientY);
    if (!n || !w) return;
    if (!D.moved) {
      D.moved = true;
      setHover(null);
    }
    const s = offsetOf(D.id);
    s.x = s.tx = w.x - n.x;
    s.y = s.ty = w.y - n.y;
    s.vx = s.vy = 0;
    setLean(D.id, (_, depth) => ({ x: s.x * (depth === 1 ? 0.38 : 0.14), y: s.y * (depth === 1 ? 0.38 : 0.14) }));
  };
  const onNodePointerUp = (e: ReactPointerEvent) => {
    const D = sim.current.drag;
    if (!D || D.pointer !== e.pointerId) return;
    sim.current.drag = null;
    if (D.moved) {
      sim.current.suppressClick = true;
      const s = offsetOf(D.id);
      s.tx = s.ty = 0;
      setLean(null);
    }
  };

  const nodeFill = (n: AtlasNode) => {
    const fam = domainById.get(n.domain)?.family;
    return fam ? `var(--v-${fam})` : 'var(--atlas-node)';
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
          <marker id="atlas-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" fill="var(--accent)" />
          </marker>
          <pattern id="atlas-dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1.3" className="atlas-grid-dot" />
          </pattern>
          <radialGradient id="atlas-glow">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g ref={gRef}>
          {/* Dot grid in world space: it pans and zooms with the map. */}
          <rect className="atlas-grid" x={vb.x - vb.w} y={vb.y - vb.h} width={vb.w * 3} height={vb.h * 3} fill="url(#atlas-dots)" />

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

          {/* Domains: faint cluster halos. Titles are sized to fit inside their halo
              (--fit, in world units), so they shrink with the map instead of spilling. */}
          <g className="atlas-domains">
            {data.domains.map((d) => {
              const fam = d.family;
              const lit = !highlight || data.nodes.some((n) => n.domain === d.id && highlight.has(n.id));
              // Titles sit in the part of the box west of the destination dot, with a clear gap
              // between the text and the dot's glow.
              const dots = data.nodes.filter((n) => n.domain === d.id && n.kind === 'landmark');
              const freeRight = dots.length ? Math.min(...dots.map((n) => n.x - n.r * 1.72 - 34)) : d.box.x + d.box.w;
              const tx = d.box.x + (freeRight - d.box.x) / 2;
              const freeW = freeRight - d.box.x - 20;
              // Beside a destination dot the title wraps onto two lines, split where the lines are most even.
              const words = d.title.split(' ');
              let lines = [d.title];
              if (dots.length && words.length > 1) {
                let best = Infinity;
                for (let i = 1; i < words.length; i++) {
                  const a = words.slice(0, i).join(' ');
                  const b = words.slice(i).join(' ');
                  if (Math.max(a.length, b.length) < best) (best = Math.max(a.length, b.length)), (lines = [a, b]);
                }
              }
              const longest = Math.max(...lines.map((l) => l.length));
              const fitTitle = (freeW * 0.94) / (longest * 0.5);
              const caps = d.title;
              const fitCaps = (d.box.w - 56) / (caps.length * 0.8);
              const sub = `${data.nodes.filter((n) => n.domain === d.id && n.kind !== 'landmark').length} concepts`;
              return (
                <g
                  key={d.id}
                  className={`atlas-domain kind-${d.kind}${lit ? '' : ' is-faded'}`}
                  style={{ ['--hue' as string]: fam ? `var(--v-${fam})` : 'var(--atlas-node)' }}
                >
                  <rect x={d.box.x - 18} y={d.box.y - 18} width={d.box.w + 36} height={d.box.h + 36} rx={46} className="atlas-halo" />
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
                    <text className="atlas-domain-title" x={tx} y={d.box.y + d.box.h / 2} dy={lines.length > 1 ? '-0.95em' : '-0.25em'} style={{ ['--fit' as string]: fitTitle.toFixed(2) }}>
                      {lines.map((l, i) => (
                        <tspan key={i} x={tx} dy={i ? '1.1em' : undefined}>{l}</tspan>
                      ))}
                    </text>
                    <text className="atlas-domain-sub" x={tx} y={d.box.y + d.box.h / 2} dy={lines.length > 1 ? '2.1em' : '1.9em'} style={{ ['--fit' as string]: ((freeW * 0.94) / (sub.length * 0.5)).toFixed(2) }}>
                      {sub}
                    </text>
                    <text className="atlas-domain-caps" x={d.box.x + 26} y={d.box.y + 30} style={{ ['--fit' as string]: fitCaps.toFixed(2) }}>
                      {caps}
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
              const straight = a.domain === b.domain;
              return (
                <path
                  key={`${e.from}-${e.to}-${e.type}`}
                  data-from={e.from}
                  data-to={e.to}
                  data-straight={straight ? '1' : '0'}
                  d={edgePath(a, b, straight)}
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
              const r = Math.max(n.r * 0.82, minR);
              const fill = isSel || (highlight && n.id === focusId) ? 'var(--accent)' : nodeFill(n);
              const done = completed.has(n.id);
              return (
                <g
                  key={n.id}
                  id={`node-${n.id}`}
                  data-node={n.id}
                  className={`atlas-node kind-${n.kind}${n.optional ? ' is-optional' : ''}${lit ? '' : ' is-faded'}${isSel ? ' is-selected' : ''}${kbd === n.id ? ' is-kbd' : ''}${status ? ` route-${status}` : ''}`}
                  transform={`translate(${n.x},${n.y})`}
                  role="button"
                  tabIndex={kbd === n.id ? 0 : -1}
                  aria-label={`${n.title}. ${domainById.get(n.domain)?.title}. ${n.kind === 'landmark' ? 'Modelling destination.' : ''} ${done ? 'Completed.' : ''}`}
                  aria-pressed={isSel}
                  style={{ color: fill }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (sim.current.suppressClick) {
                      sim.current.suppressClick = false;
                      return;
                    }
                    selectNode(n.id);
                  }}
                  onFocus={() => setKbd(n.id)}
                  onPointerDown={(e) => onNodePointerDown(e, n.id)}
                  onPointerMove={onNodePointerMove}
                  onPointerUp={onNodePointerUp}
                  onPointerCancel={onNodePointerUp}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse' && !sim.current.drag) {
                      const rect = wrapRef.current?.getBoundingClientRect();
                      setHover({ id: n.id, x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) });
                    }
                  }}
                  onPointerLeave={() => {
                    if (!sim.current.drag) setHover(null);
                  }}
                >
                  <circle r={r * (n.kind === 'landmark' ? 2.1 : 2.6)} className="atlas-glow" fill="url(#atlas-glow)" />
                  {n.kind === 'landmark' && <circle r={r * 1.35} className="atlas-landmark-ring" />}
                  {status === 'next' && <circle r={r + 9} className="atlas-next-ring" />}
                  {status && <circle r={r + 4.5} className="atlas-route-ring" />}
                  {n.id === here && <circle r={r + 13} className="atlas-here" />}
                  {n.kind === 'capstone' ? (
                    <rect x={-r} y={-r} width={2 * r} height={2 * r} transform="rotate(45)" rx={2} fill={fill} className="atlas-dot" />
                  ) : n.optional ? (
                    <circle r={r} className="atlas-dot atlas-dot-optional" style={{ stroke: fill }} />
                  ) : (
                    <circle r={r} fill={fill} className="atlas-dot" />
                  )}
                  {n.kind === 'integration' && <circle r={r * 0.42} className="atlas-inner" />}
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
                  data-label={l.id}
                  x={l.x}
                  y={l.y}
                  textAnchor={l.anchor}
                  dominantBaseline="middle"
                  className={`atlas-label kind-${n.kind}${lit ? '' : ' is-faded'}${n.id === selected ? ' is-selected' : ''}${n.id === focusId ? ' is-focus' : ''}`}
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
