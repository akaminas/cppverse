import { domains } from '../../data/domains.ts';
import type { DomainId, NodeKind } from '../../data/types.ts';
import { getGraph, isDependency, type Graph } from './graph.ts';

// Deterministic hierarchical layout of the atlas. Nothing here is random and
// nothing is simulated: the same data always produce the same map.
//
// 1. Inside each domain, nodes are sorted topologically by their intra-domain
//    dependencies (longest-path layer, then file order) and packed into a
//    grid column by column, so prerequisites lie west of what they enable.
//    The grid shape is chosen to keep every domain close to a 1.6 : 1 box.
// 2. Landmarks (the modelling destinations) and capstones occupy a final
//    column at the eastern edge of their domain.
// 3. Domains are placed in columns west → east (Domain.column) and stacked
//    north → south (Domain.row); every column is centred vertically.

export interface NodePos {
  id: string;
  x: number;
  y: number;
  r: number;
  domain: DomainId;
}

export interface DomainBox {
  id: DomainId;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AtlasLayout {
  nodes: Record<string, NodePos>;
  domains: Record<DomainId, DomainBox>;
  bounds: { x: number; y: number; w: number; h: number };
}

export const LAYOUT = {
  colW: 178,
  rowH: 74,
  aspect: 1.6,
  terminalGap: 70,
  padX: 76,
  /** Band above the first row of concepts that holds the domain title (see Atlas.tsx). */
  padTop: 140,
  padBottom: 60,
  gapX: 210,
  gapY: 130,
} as const;

export function nodeRadius(kind: NodeKind, degree: number): number {
  switch (kind) {
    case 'landmark':
      return 30;
    case 'capstone':
      return 13;
    case 'integration':
      return 15;
    default:
      return 7 + 1.1 * Math.sqrt(degree);
  }
}

function gridShape(n: number): { rows: number; cols: number } {
  let best = { rows: 1, cols: n, score: Infinity };
  for (let rows = 1; rows <= n; rows++) {
    const cols = Math.ceil(n / rows);
    const aspect = ((cols - 1) * LAYOUT.colW + 2 * LAYOUT.padX) / ((rows - 1) * LAYOUT.rowH + LAYOUT.padTop + LAYOUT.padBottom);
    const score = Math.abs(Math.log(aspect / LAYOUT.aspect)) + 0.02 * (rows * cols - n);
    if (score < best.score) best = { rows, cols, score };
  }
  return { rows: best.rows, cols: best.cols };
}

export function computeLayout(g: Graph = getGraph()): AtlasLayout {
  const nodes: Record<string, NodePos> = {};
  const boxes = {} as Record<DomainId, DomainBox>;
  const local: Record<string, { x: number; y: number }> = {};
  const size = {} as Record<DomainId, { w: number; h: number }>;

  for (const domain of domains) {
    const members = g.nodes.filter((n) => n.domain === domain.id);
    const inDomain = new Set(members.map((n) => n.id));
    const preds = (id: string) =>
      (g.incoming.get(id) ?? []).filter((e) => isDependency(e) && inDomain.has(e.from)).map((e) => e.from);

    const layer = new Map<string, number>();
    const layerOf = (id: string): number => {
      if (layer.has(id)) return layer.get(id)!;
      const ps = preds(id);
      const value = ps.length ? Math.max(...ps.map(layerOf)) + 1 : 0;
      layer.set(id, value);
      return value;
    };
    const terminal = members.filter((n) => n.kind === 'landmark' || n.kind === 'capstone');
    const regular = members.filter((n) => !terminal.includes(n));
    regular.forEach((n) => layerOf(n.id));
    regular.sort((a, b) => layer.get(a.id)! - layer.get(b.id)! || g.order.get(a.id)! - g.order.get(b.id)!);

    const { rows, cols } = gridShape(Math.max(1, regular.length));
    const innerH = (rows - 1) * LAYOUT.rowH;
    regular.forEach((n, i) => {
      const col = Math.floor(i / rows);
      const inCol = Math.min(rows, regular.length - col * rows);
      const row = i % rows;
      const offset = (innerH - (inCol - 1) * LAYOUT.rowH) / 2;
      local[n.id] = { x: LAYOUT.padX + col * LAYOUT.colW, y: LAYOUT.padTop + offset + row * LAYOUT.rowH };
    });
    let width = LAYOUT.padX * 2 + (cols - 1) * LAYOUT.colW;

    if (terminal.length) {
      // Landmark centred, capstones distributed below and above it (below first, so a
      // domain with a single capstone keeps its title band clear).
      terminal.sort((a, b) => (a.kind === 'landmark' ? -1 : 0) - (b.kind === 'landmark' ? -1 : 0) || g.order.get(a.id)! - g.order.get(b.id)!);
      const tx = width - LAYOUT.padX + LAYOUT.terminalGap + 40;
      const centre = LAYOUT.padTop + innerH / 2;
      const slots = [0, 1, -1, 2, -2];
      terminal.forEach((n, i) => {
        const dy = slots[i] * (terminal[0].kind === 'landmark' && i > 0 ? LAYOUT.rowH * 1.1 : LAYOUT.rowH);
        local[n.id] = { x: tx, y: centre + dy };
      });
      width = tx + LAYOUT.padX + 20;
    }

    size[domain.id] = { w: width, h: LAYOUT.padTop + innerH + LAYOUT.padBottom };
  }

  const columnIds = [...new Set(domains.map((d) => d.column))].sort((a, b) => a - b);
  let x = 0;
  for (const c of columnIds) {
    const stack = domains.filter((d) => d.column === c).sort((a, b) => a.row - b.row);
    const colWidth = Math.max(...stack.map((d) => size[d.id].w));
    const total = stack.reduce((s, d) => s + size[d.id].h, 0) + LAYOUT.gapY * (stack.length - 1);
    let y = -total / 2;
    for (const d of stack) {
      const { w, h } = size[d.id];
      boxes[d.id] = { id: d.id, x: x + (colWidth - w) / 2, y, w, h };
      y += h + LAYOUT.gapY;
    }
    x += colWidth + LAYOUT.gapX;
  }

  for (const n of g.nodes) {
    const box = boxes[n.domain];
    const degree = (g.incoming.get(n.id)?.length ?? 0) + (g.outgoing.get(n.id)?.length ?? 0);
    nodes[n.id] = { id: n.id, domain: n.domain, x: box.x + local[n.id].x, y: box.y + local[n.id].y, r: nodeRadius(n.kind, degree) };
  }

  const all = Object.values(boxes);
  const minX = Math.min(...all.map((b) => b.x));
  const minY = Math.min(...all.map((b) => b.y));
  const maxX = Math.max(...all.map((b) => b.x + b.w));
  const maxY = Math.max(...all.map((b) => b.y + b.h));
  return { nodes, domains: boxes, bounds: { x: minX, y: minY, w: maxX - minX, h: maxY - minY } };
}
