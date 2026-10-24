// Build-time assembly of the serialisable atlas data (structure + layout).
import { concepts } from '../data/concepts';
import { domains, regions } from '../data/domains';
import { edges } from '../data/edges';
import { goals } from '../data/goals';
import type { AtlasData, AtlasNode } from '../components/atlas/atlasData';
import { dependenciesOf, dependentsOf, getGraph } from './graph/graph';
import { computeLayout } from './graph/layout';

export function buildAtlasData(base: string): AtlasData {
  const g = getGraph();
  const layout = computeLayout(g);
  const nodes: AtlasNode[] = concepts.map((c) => ({
    id: c.id,
    title: c.title,
    label: c.label ?? c.title,
    summary: c.summary,
    domain: c.domain,
    kind: c.kind,
    level: c.level,
    lesson: c.lesson,
    anchor: c.anchor,
    manual: c.manual,
    goals: c.goals,
    lab: c.lab,
    optional: Boolean(c.optional),
    standard: c.standard,
    x: Math.round(layout.nodes[c.id].x * 10) / 10,
    y: Math.round(layout.nodes[c.id].y * 10) / 10,
    r: Math.round(layout.nodes[c.id].r * 10) / 10,
    deps: dependenciesOf(g, c.id),
    enables: dependentsOf(g, c.id),
  }));
  const atlasDomains = domains.map((d) => ({
    id: d.id,
    title: d.title,
    short: d.short,
    kind: d.kind,
    summary: d.summary,
    modules: d.modules,
    region: d.region,
    family: d.family,
    box: layout.domains[d.id],
  }));
  // Region captions sit above the top-most domain of their columns.
  const regionLabels = regions.map((r) => {
    const members = atlasDomains.filter((d) => d.region === r.id);
    const x = Math.min(...members.map((d) => d.box.x));
    const y = Math.min(...members.map((d) => d.box.y)) - 46;
    return { id: r.id, title: r.title, x, y };
  });
  return { nodes, edges, domains: atlasDomains, regions: regionLabels, goals, bounds: layout.bounds, base };
}

/** Number of knowledge checks per lesson (for "demonstrated" status). */
export function lessonCheckCounts(): Record<string, number> {
  const files = import.meta.glob('/src/content/lessons/*.mdx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
  const out: Record<string, number> = {};
  for (const [path, source] of Object.entries(files)) {
    const slug = path.split('/').pop()!.replace(/\.mdx$/, '');
    out[slug] = (source.match(/<Check\b/g) ?? []).length;
  }
  return out;
}
