import { url } from '../lib/url';

/** The main navigation, shared by the standard layout and the stage layout. */
export const NAV = [
  { id: 'atlas', href: url('/atlas/'), label: 'Atlas' },
  { id: 'curriculum', href: url('/curriculum/'), label: 'Curriculum' },
  { id: 'models', href: url('/models/'), label: 'Destinations' },
  { id: 'pathways', href: url('/pathways/'), label: 'Pathways' },
  { id: 'progress', href: url('/progress/'), label: 'Progress' },
  { id: 'about', href: url('/about/'), label: 'About' },
] as const;

export type Section = (typeof NAV)[number]['id'] | 'learn' | 'start' | 'capstones';
