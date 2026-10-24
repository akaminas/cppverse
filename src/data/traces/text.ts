import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'text-sample-code': {
    title: 'Positions, substrings and conversions in a sample code',
    file: 'data/text_sample_code.cpp',
    steps: [
      {
        line: 10,
        note: 'A string of nine characters at positions 0 to 8. P is at position 0, the digits 0 and 7 at 4 and 5, the dash at 6, Q at 7 and 3 at 8.',
        vars: { code: '"PLOT07-Q3"  (size 9)' },
      },
      {
        line: 11,
        note: "find('-') returns the position of the first '-', counted from 0. Its type is std::string::size_type, the unsigned type used for string positions.",
        vars: { code: '"PLOT07-Q3"', dash: '6' },
      },
      {
        line: 12,
        note: 'substr(0, dash) copies dash = 6 characters starting at position 0: everything before the dash.',
        vars: { code: '"PLOT07-Q3"', dash: '6', plot: '"PLOT07"' },
      },
      {
        line: 13,
        note: 'With only a starting position, substr copies to the end of the string: positions 7 and 8.',
        vars: { code: '"PLOT07-Q3"', dash: '6', plot: '"PLOT07"', quadrat: '"Q3"' },
      },
      {
        line: 14,
        note: 'plot.substr(4) is the text "07". std::stoi reads it as the integer 7; the leading zero is just a digit.',
        vars: { dash: '6', plot: '"PLOT07"', quadrat: '"Q3"', plotNumber: '7' },
      },
      {
        line: 15,
        note: 'quadrat.substr(1) skips the letter Q and leaves "3", which becomes the integer 3.',
        vars: { plot: '"PLOT07"', quadrat: '"Q3"', plotNumber: '7', quadratNumber: '3' },
      },
      {
        line: 17,
        note: 'The numbers are now ints: they can be printed, compared or used in arithmetic.',
        vars: { plot: '"PLOT07"', quadrat: '"Q3"', plotNumber: '7', quadratNumber: '3' },
        out: 'plot 7, quadrat 3\n',
      },
      {
        line: 18,
        note: 'std::to_string(4) gives "4". The + operators join a std::string, a literal and another std::string from left to right.',
        vars: { plot: '"PLOT07"', quadratNumber: '3', next: '"PLOT07-Q4"  (size 9)' },
      },
      {
        line: 19,
        note: 'size() counts characters, exactly as it counts the elements of a vector.',
        vars: { next: '"PLOT07-Q4"  (size 9)' },
        out: 'next sample: PLOT07-Q4 (9 characters)\n',
      },
      { line: 20, note: 'main returns 0; the strings release their memory automatically.', vars: {} },
    ],
  },
};
