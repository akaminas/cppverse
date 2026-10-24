import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'more-containers-events': {
    title: 'A priority queue hands out events in time order',
    file: 'data/event_queue.cpp',
    steps: [
      { line: 17, note: 'An empty priority queue of (time, description) pairs. std::greater makes the smallest pair, the earliest time, come out first.', vars: { events: '{ }' } },
      { line: 18, note: 'The first event pushed happens on day 4.5.', vars: { events: '{ (4.5, female 2 lays eggs) }' } },
      { line: 19, note: 'An earlier event is pushed second. The queue reorders itself internally so that the earliest event is always on top.', vars: { events: 'top (1.2, female 1 lays eggs); also 4.5' } },
      { line: 20, note: 'Insertion order does not matter: three events are now waiting.', vars: { events: 'top (1.2, …); also 3.0, 4.5' } },
      { line: 24, note: 'top() returned the earliest event, day 1.2, and pop() removed it.', vars: { next: '(1.2, female 1 lays eggs)', events: 'top (3.0, …); also 4.5' } },
      { line: 25, note: 'The event is handled: here simply printed.', vars: { next: '(1.2, female 1 lays eggs)', events: 'top (3.0, …); also 4.5' }, out: 'day 1.2: female 1 lays eggs\n' },
      {
        line: 27,
        note: 'Handling this event schedules a new one 2.5 days later, on day 3.7. It goes into the queue between the two waiting events.',
        vars: { next: '(1.2, female 1 lays eggs)', events: 'top (3.0, …); also 3.7, 4.5' },
      },
      { line: 25, note: 'Next iteration: the earliest waiting event is the predator visit on day 3. (A double 3.0 is printed as 3.)', vars: { next: '(3.0, predator visits)', events: 'top (3.7, …); also 4.5' }, out: 'day 3: predator visits\n' },
      { line: 25, note: 'The newly scheduled hatching on day 3.7 comes before day 4.5.', vars: { next: '(3.7, eggs of female 1 hatch)', events: 'top (4.5, …)' }, out: 'day 3.7: eggs of female 1 hatch\n' },
      { line: 25, note: 'The last event.', vars: { next: '(4.5, female 2 lays eggs)', events: '{ }' }, out: 'day 4.5: female 2 lays eggs\n' },
      { line: 22, note: 'The queue is empty, so the loop ends: there is nothing left to happen.', vars: { events: '{ }' } },
      { line: 30, note: 'main returns 0.', vars: {} },
    ],
  },
};
