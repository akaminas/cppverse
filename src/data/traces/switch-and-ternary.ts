import type { Trace } from './types';

type Counts = { larva: number; pupa: number; adult: number; unknown: number };
const v = (c: string | null, k: Counts): Record<string, string> => ({
  codes: '"aPlE?"',
  ...(c === null ? {} : { c: `'${c}'` }),
  larva: String(k.larva),
  pupa: String(k.pupa),
  adult: String(k.adult),
  unknown: String(k.unknown),
});

export const traces: Record<string, Trace> = {
  'switch-and-ternary-tally': {
    title: 'Jumping to a case label, then falling through',
    file: 'foundations/switch_stage_tally.cpp',
    steps: [
      { line: 11, note: 'Five field codes, one character per individual.', vars: { codes: '"aPlE?"' } },
      { line: 15, note: 'Four counters start at zero.', vars: v(null, { larva: 0, pupa: 0, adult: 0, unknown: 0 }) },
      { line: 17, note: 'The loop takes the first character: c is \'a\'.', vars: v('a', { larva: 0, pupa: 0, adult: 0, unknown: 0 }) },
      {
        line: 18,
        note: 'The switch compares c with the case labels and jumps straight to the matching one, case \'a\' on line 20. Nothing above it runs.',
        vars: v('a', { larva: 0, pupa: 0, adult: 0, unknown: 0 }),
      },
      { line: 21, note: 'An adult has been counted.', vars: v('a', { larva: 0, pupa: 0, adult: 1, unknown: 0 }) },
      {
        line: 22,
        note: '[[fallthrough]] is not a jump. It tells the compiler (and the reader) that running on into the next case is intended.',
        vars: v('a', { larva: 0, pupa: 0, adult: 1, unknown: 0 }),
      },
      {
        line: 25,
        note: 'Case labels are only targets for the jump, not tests, so execution passes lines 23 and 24 and counts a pupa too: an adult was once a pupa.',
        vars: v('a', { larva: 0, pupa: 1, adult: 1, unknown: 0 }),
      },
      { line: 29, note: 'Falling through once more: the adult is also counted as having reached the larval stage.', vars: v('a', { larva: 1, pupa: 1, adult: 1, unknown: 0 }) },
      { line: 30, note: 'break leaves the switch (not the loop). The next character is processed.', vars: v('a', { larva: 1, pupa: 1, adult: 1, unknown: 0 }) },
      { line: 17, note: 'c is \'P\'.', vars: v('P', { larva: 1, pupa: 1, adult: 1, unknown: 0 }) },
      { line: 18, note: 'Jump to case \'P\' on line 23. The adult counter is not touched.', vars: v('P', { larva: 1, pupa: 1, adult: 1, unknown: 0 }) },
      { line: 25, note: 'One more pupa.', vars: v('P', { larva: 1, pupa: 2, adult: 1, unknown: 0 }) },
      { line: 29, note: 'Fall through: one more individual that reached the larval stage.', vars: v('P', { larva: 2, pupa: 2, adult: 1, unknown: 0 }) },
      { line: 30, note: 'break.', vars: v('P', { larva: 2, pupa: 2, adult: 1, unknown: 0 }) },
      { line: 17, note: 'c is \'l\', a lower-case code.', vars: v('l', { larva: 2, pupa: 2, adult: 1, unknown: 0 }) },
      { line: 18, note: 'The stacked labels case \'L\': case \'l\': share one block, so either code lands on line 29.', vars: v('l', { larva: 2, pupa: 2, adult: 1, unknown: 0 }) },
      { line: 29, note: 'A larva.', vars: v('l', { larva: 3, pupa: 2, adult: 1, unknown: 0 }) },
      { line: 30, note: 'break.', vars: v('l', { larva: 3, pupa: 2, adult: 1, unknown: 0 }) },
      { line: 17, note: 'c is \'E\'.', vars: v('E', { larva: 3, pupa: 2, adult: 1, unknown: 0 }) },
      { line: 33, note: 'Jump to case \'E\', whose only statement is break: an egg adds to no counter.', vars: v('E', { larva: 3, pupa: 2, adult: 1, unknown: 0 }) },
      { line: 17, note: 'c is \'?\', a code nobody intended.', vars: v('?', { larva: 3, pupa: 2, adult: 1, unknown: 0 }) },
      { line: 18, note: 'No case label matches, so the switch jumps to default.', vars: v('?', { larva: 3, pupa: 2, adult: 1, unknown: 0 }) },
      { line: 35, note: 'The bad code is counted rather than silently ignored.', vars: v('?', { larva: 3, pupa: 2, adult: 1, unknown: 1 }) },
      { line: 36, note: 'break.', vars: v('?', { larva: 3, pupa: 2, adult: 1, unknown: 1 }) },
      { line: 17, note: 'No characters are left, so the loop ends.', vars: v(null, { larva: 3, pupa: 2, adult: 1, unknown: 1 }) },
      { line: 39, note: 'Report the tallies.', vars: v(null, { larva: 3, pupa: 2, adult: 1, unknown: 1 }), out: 'reached larva: 3\n' },
      { line: 40, note: 'Two individuals reached the pupal stage: the pupa and the adult.', vars: v(null, { larva: 3, pupa: 2, adult: 1, unknown: 1 }), out: 'reached pupa:  2\n' },
      { line: 41, note: 'Only one individual reached adulthood.', vars: v(null, { larva: 3, pupa: 2, adult: 1, unknown: 1 }), out: 'reached adult: 1\n' },
      { line: 42, note: 'Three of the five individuals reached the larval stage; one code could not be read.', vars: v(null, { larva: 3, pupa: 2, adult: 1, unknown: 1 }), out: 'unrecognised:  1\n' },
      { line: 43, note: 'main returns 0.', vars: v(null, { larva: 3, pupa: 2, adult: 1, unknown: 1 }) },
    ],
  },
};
