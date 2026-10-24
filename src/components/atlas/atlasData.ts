// Serialisable atlas data passed from the Astro page to the React island,
// plus pure helpers used by the canvas and the panel.

import type { Domain, DomainId, Edge, EdgeType, Goal, Level, NodeKind, VellumFamily } from '../../data/types';

export interface AtlasNode {
  id: string;
  title: string;
  label: string;
  summary: string;
  domain: DomainId;
  kind: NodeKind;
  level: Level;
  lesson?: string;
  anchor?: string;
  manual: string[];
  goals: string[];
  lab?: string;
  optional: boolean;
  standard?: string;
  x: number;
  y: number;
  r: number;
  /** Direct dependencies and dependents (ids). */
  deps: string[];
  enables: string[];
}

export interface AtlasDomain extends Pick<Domain, 'id' | 'title' | 'short' | 'kind' | 'summary' | 'modules' | 'region'> {
  family?: VellumFamily;
  box: { x: number; y: number; w: number; h: number };
}

export interface AtlasRegionLabel {
  id: string;
  title: string;
  x: number;
  y: number;
}

export interface AtlasData {
  nodes: AtlasNode[];
  edges: Edge[];
  domains: AtlasDomain[];
  regions: AtlasRegionLabel[];
  goals: Goal[];
  bounds: { x: number; y: number; w: number; h: number };
  base: string;
}

export const DEPENDENCY: ReadonlySet<EdgeType> = new Set(['prerequisite', 'composition', 'application', 'extension']);

export const EDGE_STYLE: Record<EdgeType, { dash?: string; label: string; description: string }> = {
  prerequisite: { label: 'Prerequisite', description: 'must be understood first' },
  composition: { dash: '2 3', label: 'Component', description: 'is a part of the model' },
  application: { dash: '7 4', label: 'Application', description: 'is used to build' },
  extension: { dash: '1 5', label: 'Extension', description: 'an optional deeper branch' },
  conceptual: { dash: '12 6', label: 'Related idea', description: 'a conceptual connection' },
  validation: { dash: '9 4 1 4', label: 'Validation', description: 'is used to verify' },
};

export const LEVEL_LABEL: Record<Level, string> = { beginner: 'Beginner', intermediate: 'Intermediate', seasoned: 'Seasoned' };

export const KIND_LABEL: Record<NodeKind, string> = {
  concept: 'Concept',
  landmark: 'Modelling destination',
  integration: 'Integration',
  capstone: 'Capstone project',
};

export function nodeHref(n: AtlasNode, base: string): string | null {
  const b = base.replace(/\/$/, '');
  if (n.kind === 'landmark') return `${b}/models/${n.domain}/`;
  if (n.kind === 'capstone') return `${b}/capstones/${n.id}/`;
  if (n.lesson) return `${b}/learn/${n.lesson}/${n.anchor ? `#${n.anchor}` : ''}`;
  return null;
}

/** Transitive closure over dependency edges in one direction. */
export function closure(byId: Map<string, AtlasNode>, start: string, dir: 'back' | 'forward'): Set<string> {
  const seen = new Set<string>();
  const stack = [start];
  while (stack.length) {
    const id = stack.pop()!;
    const n = byId.get(id);
    if (!n) continue;
    for (const next of dir === 'back' ? n.deps : n.enables) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen;
}

/** Simple ranked search over titles, labels, ids and summaries. */
export function searchNodes(nodes: AtlasNode[], query: string, limit = 8): AtlasNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/);
  const scored: [number, AtlasNode][] = [];
  for (const n of nodes) {
    const title = n.title.toLowerCase();
    const label = n.label.toLowerCase();
    const hay = `${title} ${label} ${n.id} ${n.summary.toLowerCase()} ${n.domain}`;
    if (!words.every((w) => hay.includes(w))) continue;
    let score = 0;
    if (title === q || label === q) score += 100;
    if (title.startsWith(q) || label.startsWith(q)) score += 40;
    if (title.includes(q) || label.includes(q)) score += 20;
    if (n.kind === 'landmark') score += 5;
    scored.push([score, n]);
  }
  return scored.sort((a, b) => b[0] - a[0] || a[1].title.localeCompare(b[1].title)).slice(0, limit).map(([, n]) => n);
}

/**
 * Edge path between two nodes: straight inside a domain (Vellum networks use
 * straight edges), a gentle cubic with horizontal tangents between domains
 * so long links read west → east instead of cutting across regions.
 */
export function edgePath(a: AtlasNode, b: AtlasNode, straight = false): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const sx = a.x + (dx / dist) * a.r;
  const sy = a.y + (dy / dist) * a.r;
  const ex = b.x - (dx / dist) * (b.r + 3);
  const ey = b.y - (dy / dist) * (b.r + 3);
  if (straight) return `M${sx.toFixed(1)},${sy.toFixed(1)}L${ex.toFixed(1)},${ey.toFixed(1)}`;
  const bend = Math.max(30, Math.abs(ex - sx) * 0.45);
  const dir = ex >= sx ? 1 : -1;
  return `M${sx.toFixed(1)},${sy.toFixed(1)}C${(sx + dir * bend).toFixed(1)},${sy.toFixed(1)} ${(ex - dir * bend).toFixed(1)},${ey.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
}

/** Approximate rendered width of a label at 12.5 px (Lato/Corbel). */
export const labelWidthPx = (text: string) => text.length * 6.7 + 4;
