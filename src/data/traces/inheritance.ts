import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'inheritance-events': {
    title: 'One loop, four kinds of event',
    file: 'architecture/inheritance_events.cpp',
    steps: [
      { line: 66, note: 'make_unique<Breeding>(3) creates a Breeding on the heap. Its unique_ptr<Breeding> converts to unique_ptr<Event> as it is stored, because a Breeding is an Event.', vars: { schedule: '[Breeding]' } },
      { line: 69, note: 'Four objects of four different types now share one vector. The vector stores base-class pointers; each object still knows its real type.', vars: { schedule: '[Breeding, JuvenileSurvival, Maturation, Harvest]' } },
      { line: 71, note: 'The population starts with 20 adults and no juveniles.', vars: { 'pop.juveniles': '0', 'pop.adults': '20' } },
      { line: 74, note: 'event->apply(pop) is a virtual call. The object is a Breeding, so Breeding::apply runs: 20 / 2 pairs × 3 juveniles.', vars: { year: '1', event: '→ Breeding', 'pop.juveniles': '30', 'pop.adults': '20' } },
      { line: 75, note: 'name() is virtual too and returns "breeding".', vars: { year: '1', event: '→ Breeding', 'pop.juveniles': '30', 'pop.adults': '20' }, out: 'year 1, breeding: juveniles 30, adults 20\n' },
      { line: 74, note: 'The same line of code now calls JuvenileSurvival::apply: 40 % of the 30 juveniles survive.', vars: { year: '1', event: '→ JuvenileSurvival', 'pop.juveniles': '12', 'pop.adults': '20' } },
      { line: 75, note: 'The state after the survival event.', vars: { year: '1', event: '→ JuvenileSurvival', 'pop.juveniles': '12', 'pop.adults': '20' }, out: 'year 1, survival: juveniles 12, adults 20\n' },
      { line: 75, note: 'Maturation::apply has moved every juvenile into the adult class.', vars: { year: '1', event: '→ Maturation', 'pop.juveniles': '0', 'pop.adults': '32' }, out: 'year 1, maturation: juveniles 0, adults 32\n' },
      { line: 75, note: 'Harvest::apply has removed the quota of 8 adults (it never removes more than there are).', vars: { year: '1', event: '→ Harvest', 'pop.juveniles': '0', 'pop.adults': '24' }, out: 'year 1, harvest: juveniles 0, adults 24\n' },
      { line: 75, note: 'Year 2 runs the schedule again. 24 adults form 12 pairs and raise 36 juveniles.', vars: { year: '2', event: '→ Breeding', 'pop.juveniles': '36', 'pop.adults': '24' }, out: 'year 2, breeding: juveniles 36, adults 24\n' },
      { line: 75, note: 'Integer arithmetic: 36 × 40 / 100 = 1440 / 100, which truncates to 14.', vars: { year: '2', event: '→ JuvenileSurvival', 'pop.juveniles': '14', 'pop.adults': '24' }, out: 'year 2, survival: juveniles 14, adults 24\n' },
      { line: 75, note: 'Maturation again: 24 + 14 adults.', vars: { year: '2', event: '→ Maturation', 'pop.juveniles': '0', 'pop.adults': '38' }, out: 'year 2, maturation: juveniles 0, adults 38\n' },
      { line: 75, note: 'Harvest again: 38 − 8 = 30.', vars: { year: '2', event: '→ Harvest', 'pop.juveniles': '0', 'pop.adults': '30' }, out: 'year 2, harvest: juveniles 0, adults 30\n' },
      { line: 79, note: 'When main returns, the vector is destroyed. Each unique_ptr deletes its event through the virtual destructor, so the correct destructor runs for every type.' },
    ],
  },
};
