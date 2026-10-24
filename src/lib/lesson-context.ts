// Build-time context for a lesson page, derived from the atlas graph.
import { concepts } from '../data/concepts';
import { domainById } from '../data/domains';
import { manualSectionById } from '../data/manual';
import type { ConceptNode } from '../data/types';
import { dependenciesOf, dependentsOf, getGraph, landmarksEnabledBy, topologicalOrder } from './graph/graph';
import { computeLayout } from './graph/layout';
import { atlasUrl, capstoneUrl, lessonUrl, modelUrl } from './url';

export interface LinkItem {
  id: string;
  title: string;
  href: string;
  kind: ConceptNode['kind'];
  note?: string;
  /** Lesson slug when the link points at a lesson. */
  lesson?: string;
}

export function hrefFor(c: ConceptNode): string {
  if (c.kind === 'landmark') return modelUrl(c.domain);
  if (c.kind === 'capstone') return capstoneUrl(c.id);
  return lessonUrl(c.lesson!, c.anchor);
}

const toLink = (c: ConceptNode, note?: string): LinkItem => ({ id: c.id, title: c.title, href: hrefFor(c), kind: c.kind, note, lesson: c.lesson });

export function lessonContext(slug: string) {
  const g = getGraph();
  const own = concepts.filter((c) => c.lesson === slug);
  if (!own.length) throw new Error(`Lesson "${slug}" is not anchored to any atlas concept`);
  const ownIds = new Set(own.map((c) => c.id));
  const primary = own.find((c) => !c.anchor) ?? own[0];

  const collect = (ids: string[]) => topologicalOrder(g, [...new Set(ids)].filter((id) => !ownIds.has(id)));
  const needIds = collect(own.flatMap((c) => dependenciesOf(g, c.id)));
  const leadIds = collect(own.flatMap((c) => dependentsOf(g, c.id)));
  const noteOf = (from: string, to: string) => g.edges.find((e) => e.from === from && e.to === to)?.note;

  const needs = needIds.map((id) => {
    const target = own.find((c) => dependenciesOf(g, c.id).includes(id))!;
    return toLink(g.byId.get(id)!, noteOf(id, target.id));
  });
  const leads = leadIds.map((id) => {
    const source = own.find((c) => dependentsOf(g, c.id).includes(id))!;
    return toLink(g.byId.get(id)!, noteOf(source.id, id));
  });
  const related = g.edges
    .filter((e) => (e.type === 'conceptual' || e.type === 'validation') && (ownIds.has(e.from) || ownIds.has(e.to)))
    .map((e) => toLink(g.byId.get(ownIds.has(e.from) ? e.to : e.from)!, e.note))
    .filter((l, i, arr) => !ownIds.has(l.id) && arr.findIndex((x) => x.id === l.id) === i);
  const destinations = [...new Map(own.flatMap((c) => landmarksEnabledBy(g, c.id)).map((l) => [l.id, l])).values()].map((l) => toLink(l));

  const manual = [...new Set(own.flatMap((c) => c.manual))]
    .map((id) => manualSectionById[id])
    .filter(Boolean)
    .sort((a, b) => (a.module ?? 99) - (b.module ?? 99) || a.id.localeCompare(b.id, 'en', { numeric: true }));

  // Mini-map: domain boxes plus this lesson's concept positions.
  const layout = computeLayout(g);
  const mini = {
    bounds: layout.bounds,
    domains: Object.values(layout.domains).map((b) => ({ ...b, family: domainById[b.id].family, current: b.id === primary.domain })),
    points: own.map((c) => layout.nodes[c.id]),
  };

  return {
    own,
    primary,
    domain: domainById[primary.domain],
    needs,
    leads,
    related,
    destinations,
    manual,
    mini,
    atlasHref: atlasUrl(primary.id),
    nextLessons: [...new Set(leads.map((l) => l.lesson).filter((s): s is string => Boolean(s) && s !== slug))].slice(0, 4),
  };
}
