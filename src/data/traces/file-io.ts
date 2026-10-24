import type { Trace } from './types';

// Two read loops over the same three-line file (31.2, 28.7, 35.4, each line
// ending in a newline). The idiomatic loop tests the read itself; the fragile
// loop tests eof() before reading and processes the last value twice.

const idiomatic = `// masses.txt holds three lines: 31.2, 28.7 and 35.4
std::ifstream in{"masses.txt"};
double mass{0.0};
double sum{0.0};
int n{0};
while (in >> mass) {
    sum += mass;
    ++n;
}
std::cout << n << " masses, total " << sum << '\\n';`;

const fragile = `// masses.txt holds three lines: 31.2, 28.7 and 35.4
std::ifstream in{"masses.txt"};
double mass{0.0};
double sum{0.0};
int n{0};
while (!in.eof()) {
    in >> mass;
    sum += mass;
    ++n;
}
std::cout << n << " masses, total " << sum << '\\n';`;

export const traces: Record<string, Trace> = {
  'file-io-read-loop': {
    title: 'The idiomatic loop: the read is the test',
    code: idiomatic,
    steps: [
      { line: 2, note: 'The file is opened. No error flag is set, so the stream is in the good state.', vars: { in: 'good' } },
      { line: 5, note: 'The accumulators start at zero.', vars: { in: 'good', mass: '0', sum: '0', n: '0' } },
      { line: 6, note: 'in >> mass reads 31.2. The read succeeded, so the stream converts to true and the body runs.', vars: { in: 'good', mass: '31.2', sum: '0', n: '0' } },
      { line: 8, note: 'The value is used only after a successful read.', vars: { in: 'good', mass: '31.2', sum: '31.2', n: '1' } },
      { line: 6, note: 'The newline after 31.2 is skipped as whitespace and 28.7 is read.', vars: { in: 'good', mass: '28.7', sum: '31.2', n: '1' } },
      { line: 8, note: 'Second value added.', vars: { in: 'good', mass: '28.7', sum: '59.9', n: '2' } },
      { line: 6, note: '35.4 is read. The newline after it has not been read yet, so eof() is still false.', vars: { in: 'good', mass: '35.4', sum: '59.9', n: '2' } },
      { line: 8, note: 'Third value added.', vars: { in: 'good', mass: '35.4', sum: '95.3', n: '3' } },
      { line: 6, note: 'The read skips the final newline and meets the end of the file. It fails: failbit and eofbit are set, the test is false and the loop ends without running the body.', vars: { in: 'fail + eof', mass: '35.4', sum: '95.3', n: '3' } },
      { line: 10, note: 'Three values were read and three were used.', vars: { in: 'fail + eof', mass: '35.4', sum: '95.3', n: '3' }, out: '3 masses, total 95.3\n' },
    ],
  },
  'file-io-eof-loop': {
    title: 'The fragile loop: testing eof() before the read',
    code: fragile,
    steps: [
      { line: 2, note: 'The file is opened in the good state.', vars: { in: 'good' } },
      { line: 5, note: 'The accumulators start at zero.', vars: { in: 'good', mass: '0', sum: '0', n: '0' } },
      { line: 6, note: 'eof() is false: nothing has tried to read past the end yet.', vars: { in: 'good', mass: '0', sum: '0', n: '0' } },
      { line: 9, note: 'The first pass reads 31.2 and adds it.', vars: { in: 'good', mass: '31.2', sum: '31.2', n: '1' } },
      { line: 9, note: 'The second pass reads 28.7 and adds it.', vars: { in: 'good', mass: '28.7', sum: '59.9', n: '2' } },
      { line: 9, note: 'The third pass reads 35.4. The newline after it is still unread, so eof() remains false.', vars: { in: 'good', mass: '35.4', sum: '95.3', n: '3' } },
      { line: 6, note: 'eof() is false, so the loop runs a fourth time although no data are left.', vars: { in: 'good', mass: '35.4', sum: '95.3', n: '3' } },
      { line: 7, note: 'The read meets the end of the file and fails. mass is not changed: it still holds 35.4 from the previous pass.', vars: { in: 'fail + eof', mass: '35.4', sum: '95.3', n: '3' } },
      { line: 9, note: 'Nothing checks the read, so the stale 35.4 is added again and counted as a fourth mass.', vars: { in: 'fail + eof', mass: '35.4', sum: '130.7', n: '4' } },
      { line: 6, note: 'Only now is eof() true, and the loop ends.', vars: { in: 'fail + eof', mass: '35.4', sum: '130.7', n: '4' } },
      { line: 11, note: 'The summary is wrong: the last measurement was counted twice.', vars: { in: 'fail + eof', mass: '35.4', sum: '130.7', n: '4' }, out: '4 masses, total 130.7\n' },
    ],
  },
};
