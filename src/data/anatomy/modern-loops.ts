import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'modern-loops-range-for': {
    title: 'A range-based for loop with a structured binding',
    start: 'ref',
    lines: [
      [['for', 'for'], ' (', ['const', 'const'], ' ', ['auto', 'auto'], ['&', 'ref'], ' ', ['[site, count]', 'binding'], ' ', [':', 'colon'], ' ', ['nests', 'range'], ') {'],
      ['    ', ['std::cout << site << ": " << count << \'\\n\';', 'body']],
      ['}'],
    ],
    parts: {
      for: {
        label: 'for',
        role: 'Range-based for loop',
        explain:
          'Visits every element of a range once, in order, without an index or an iterator in sight. Behind the scenes the compiler writes an iterator loop from begin() to end().',
      },
      const: {
        label: 'const',
        role: 'Read-only access',
        explain: 'The loop body may read each element but not change it. Leave const out (auto&) when the body must modify the elements.',
      },
      auto: {
        label: 'auto',
        role: 'Deduced type',
        explain:
          'The compiler deduces the element type from the range: here std::pair<const std::string, int>, the element type of a std::map<std::string, int>. Spelling that out by hand is tedious and easy to get subtly wrong (forgetting the const on the key makes a copy of every element).',
      },
      ref: {
        label: '&',
        role: 'Reference',
        explain:
          'Binds to each element itself instead of copying it. Without &, every element would be copied into the loop variable: harmless for an int, wasteful for a string, a struct or a vector, and changes would be lost.',
      },
      binding: {
        label: '[site, count]',
        role: 'Structured binding (C++17)',
        explain:
          'Unpacks each element, a key-value pair, into two names: site for the key (first) and count for the value (second). With const auto& both refer to the members inside the map without copying them.',
      },
      colon: {
        label: ':',
        role: 'Separator',
        explain: 'Read it as “in”: for each [site, count] in nests.',
      },
      range: {
        label: 'nests',
        role: 'The range',
        explain:
          'Anything with begin() and end(): a standard container, a std::array, a std::string, or a braced list such as {1, 2, 3}. Do not add or remove elements of the range inside the loop: that can invalidate the hidden iterators.',
      },
      body: {
        label: 'body',
        role: 'Loop body',
        explain: 'Runs once per element, with site and count referring to that element.',
      },
    },
  },
};
