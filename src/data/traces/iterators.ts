import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'iterators-erase': {
    title: 'Erasing elements while walking through a vector',
    file: 'data/iterator_erase.cpp',
    steps: [
      { line: 11, note: 'Five individuals, identified by their ages.', vars: { ages: '{2, 4, 1, 5, 3}' } },
      { line: 13, note: 'it starts at begin(), the position of the first element. end() is one past the last.', vars: { ages: '{2, 4, 1, 5, 3}', it: '→ position 0 (2)' } },
      { line: 17, note: '*it is 2, below 4: the individual survives, and ++it moves to the next position.', vars: { ages: '{2, 4, 1, 5, 3}', it: '→ position 1 (4)' } },
      {
        line: 15,
        note: '*it is 4: erase removes it. The elements after it shift left, so the old iterator is invalid; erase returns a valid iterator to the element that now occupies the same position, 1.',
        vars: { ages: '{2, 1, 5, 3}', it: '→ position 1 (1)' },
      },
      { line: 13, note: 'The loop header has no ++it, so the element that moved into position 1 is examined next instead of being skipped.', vars: { ages: '{2, 1, 5, 3}', it: '→ position 1 (1)' } },
      { line: 17, note: '*it is 1: keep it and step on.', vars: { ages: '{2, 1, 5, 3}', it: '→ position 2 (5)' } },
      { line: 15, note: '*it is 5: erased. The 3 shifts into position 2, and it points at it.', vars: { ages: '{2, 1, 3}', it: '→ position 2 (3)' } },
      { line: 17, note: '*it is 3: keep it. ++it now gives end(), one past the last element.', vars: { ages: '{2, 1, 3}', it: '→ end()' } },
      { line: 13, note: 'it == ages.end(), so the loop stops. Never dereference end(): there is no element there.', vars: { ages: '{2, 1, 3}' } },
      { line: 21, note: 'Three individuals remain.', vars: { ages: '{2, 1, 3}' }, out: '3 survivors:' },
      { line: 23, note: 'The range-for loop uses begin() and end() behind the scenes.', vars: { ages: '{2, 1, 3}', age: '2' }, out: ' 2' },
      { line: 23, note: 'Next element.', vars: { ages: '{2, 1, 3}', age: '1' }, out: ' 1' },
      { line: 23, note: 'Last element.', vars: { ages: '{2, 1, 3}', age: '3' }, out: ' 3' },
      { line: 25, note: 'End the line.', vars: { ages: '{2, 1, 3}' }, out: '\n' },
      { line: 26, note: 'main returns 0.', vars: {} },
    ],
  },
};
