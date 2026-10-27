// The pastel accent of each part of the curriculum (tokens --p-* in
// global.css). Destinations keep their own Vellum family; the other regions
// take one pastel each, so a lesson's header, the curriculum outline and the
// rail agree on its colour. Colour never carries meaning on its own: every
// place that uses it also names the domain in words.
import { domainById } from '../data/domains';
import type { DomainId, VellumFamily } from '../data/types';

const REGION_FAMILY: Record<string, VellumFamily> = {
  foundations: 'terracotta',
  structures: 'indigo',
  destinations: 'teal',
  synthesis: 'mauve',
};

export function pastelFamily(domain: DomainId): VellumFamily {
  const d = domainById[domain];
  return d.family ?? REGION_FAMILY[d.region] ?? 'teal';
}

export function regionPastel(region: string): string {
  return `var(--p-${REGION_FAMILY[region] ?? 'teal'})`;
}

export function domainPastel(domain: DomainId): string {
  return `var(--p-${pastelFamily(domain)})`;
}
