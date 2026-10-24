import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'function-features-static': {
    title: 'A static local survives between calls',
    file: 'foundations/features_static_counter.cpp',
    steps: [
      {
        line: 15,
        note: 'Before main started, the static variable last_id was set to 0. It already exists, although no call of next_id has happened yet. The loop starts with i = 0.',
        vars: { 'main: i': '0', 'next_id: last_id (static)': '0' },
      },
      {
        line: 8,
        note: 'Line 16 calls next_id. An ordinary local variable would be created now; last_id is not, because it already exists.',
        vars: { 'main: i': '0', 'next_id: last_id (static)': '0' },
      },
      {
        line: 9,
        note: 'The declaration does not reset last_id. Its initialisation happened once and is never repeated.',
        vars: { 'main: i': '0', 'next_id: last_id (static)': '0' },
      },
      { line: 10, note: 'The counter advances to 1.', vars: { 'main: i': '0', 'next_id: last_id (static)': '1' } },
      { line: 11, note: 'Return 1. The function ends, but last_id is not destroyed.', vars: { 'main: i': '0', 'next_id: last_id (static)': '1' } },
      { line: 16, note: 'main prints the returned id.', vars: { 'main: i': '0', 'next_id: last_id (static)': '1' }, out: 'new individual, id 1\n' },
      { line: 15, note: '++i gives 1; 1 < 3 is true.', vars: { 'main: i': '1', 'next_id: last_id (static)': '1' } },
      { line: 10, note: 'Second call: last_id still holds 1 from the previous call, and becomes 2.', vars: { 'main: i': '1', 'next_id: last_id (static)': '2' } },
      { line: 11, note: 'Return 2.', vars: { 'main: i': '1', 'next_id: last_id (static)': '2' } },
      { line: 16, note: 'Print.', vars: { 'main: i': '1', 'next_id: last_id (static)': '2' }, out: 'new individual, id 2\n' },
      { line: 15, note: '++i gives 2; 2 < 3 is true.', vars: { 'main: i': '2', 'next_id: last_id (static)': '2' } },
      { line: 10, note: 'Third call: 2 becomes 3.', vars: { 'main: i': '2', 'next_id: last_id (static)': '3' } },
      { line: 11, note: 'Return 3.', vars: { 'main: i': '2', 'next_id: last_id (static)': '3' } },
      { line: 16, note: 'Print.', vars: { 'main: i': '2', 'next_id: last_id (static)': '3' }, out: 'new individual, id 3\n' },
      { line: 15, note: '++i gives 3; 3 < 3 is false. The loop ends and i is destroyed; last_id lives on.', vars: { 'next_id: last_id (static)': '3' } },
      { line: 18, note: 'A second replicate begins, and its first individual should be number 1.', vars: { 'next_id: last_id (static)': '3' }, out: 'second replicate\n' },
      {
        line: 10,
        note: 'Line 19 calls next_id. The counter carries on from 3: nothing outside the function can reset it.',
        vars: { 'next_id: last_id (static)': '4' },
      },
      { line: 11, note: 'Return 4.', vars: { 'next_id: last_id (static)': '4' } },
      { line: 19, note: 'The new replicate’s first individual gets id 4, not 1.', vars: { 'next_id: last_id (static)': '4' }, out: 'new individual, id 4\n' },
      { line: 20, note: 'main returns 0. Only now is last_id destroyed.', vars: { 'next_id: last_id (static)': '4' } },
    ],
  },
};
