import type { Trace } from './types';

const census3 = '3 records (PLOT03, PLOT07, PLOT12)';

export const traces: Record<string, Trace> = {
  'composite-types-census': {
    title: 'Filling a census and querying it through an in/out parameter',
    file: 'data/composite_census.cpp',
    steps: [
      { line: 59, note: 'A new Census: its private vector records_ is empty.', vars: { census: '0 records' } },
      { line: 64, note: 'A vector of three Census::Record values, each built from a brace list in member order (plot, adults, juveniles).', vars: { census: '0 records', spring: '3 records' } },
      { line: 52, note: 'addSurvey receives census by reference (it will change it) and spring by const reference (it only reads it, and copying it would be wasteful).', vars: { 'census (ref)': '0 records', 'survey (const ref)': '3 records' } },
      { line: 54, note: 'Each record is handed to the public member add, which push_backs a copy into the private vector. addSurvey cannot touch records_ directly.', vars: { 'census (ref)': census3, 'survey (const ref)': '3 records' } },
      { line: 66, note: 'Back in main, census has changed, because addSurvey worked on it through a reference. totalAdults sums 14 + 9 + 17.', vars: { census: census3 }, out: '3 plots, 40 adults\n' },
      { line: 68, note: 'found will receive the result of each query. It starts with placeholder values.', vars: { census: census3, found: '{"none", 0, 0}' } },
      { line: 71, note: 'First query: find is called with code = "PLOT07" and with found as the in/out parameter result.', vars: { census: census3, code: '"PLOT07"', found: '{"none", 0, 0}' } },
      { line: 35, note: 'Inside find, the loop compares each stored plot code with "PLOT07". The first record, PLOT03, does not match.', vars: { plot: '"PLOT07"', r: '{"PLOT03", 14, 22}', 'result (ref)': '{"none", 0, 0}' } },
      { line: 36, note: 'The second record matches. Assigning to result writes straight into found in main, because result is a reference to it.', vars: { plot: '"PLOT07"', r: '{"PLOT07", 9, 31}', 'result (ref)': '{"PLOT07", 9, 31}' } },
      { line: 37, note: 'find returns true: the caller may now use found.', vars: { 'result (ref)': '{"PLOT07", 9, 31}' } },
      { line: 73, note: 'The if branch prints the record that find copied into found.', vars: { census: census3, code: '"PLOT07"', found: '{"PLOT07", 9, 31}' }, out: 'PLOT07: 9 adults, 31 juveniles\n' },
      { line: 71, note: 'Second query: "PLOT08".', vars: { census: census3, code: '"PLOT08"', found: '{"PLOT07", 9, 31}' } },
      { line: 40, note: 'No record matches, so find returns false without touching result. found still holds the previous answer, which is why the caller must check the return value before using it.', vars: { plot: '"PLOT08"', 'result (ref)': '{"PLOT07", 9, 31}' } },
      { line: 75, note: 'The else branch reports the missing plot.', vars: { census: census3, code: '"PLOT08"', found: '{"PLOT07", 9, 31}' }, out: 'no record for PLOT08\n' },
      { line: 78, note: 'main returns. census is destroyed, and with it the vector and the three records it owns.', vars: {} },
    ],
  },
};
