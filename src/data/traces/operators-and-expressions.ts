import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'operators-and-expressions-cohort': {
    title: 'Compound assignment, prefix and postfix increment',
    file: 'foundations/operators_tadpole_cohort.cpp',
    steps: [
      { line: 10, note: 'The cohort starts with 800 tadpoles.', vars: { tadpoles: '800' } },
      { line: 11, note: 'The weekly survival probability, fixed for the whole run.', vars: { tadpoles: '800', weeklySurvival: '0.75' } },
      { line: 12, note: 'A week counter starts at 0.', vars: { tadpoles: '800', weeklySurvival: '0.75', week: '0' } },
      { line: 14, note: '`*=` multiplies the variable by the right-hand side and stores the result: 800 × 0.75 = 600.', vars: { tadpoles: '600', weeklySurvival: '0.75', week: '0' } },
      { line: 15, note: '`++week` adds 1 to `week`.', vars: { tadpoles: '600', weeklySurvival: '0.75', week: '1' } },
      { line: 16, note: 'Printed.', vars: { tadpoles: '600', weeklySurvival: '0.75', week: '1' }, out: 'week 1: 600\n' },
      { line: 18, note: 'The same update again: 600 × 0.75 = 450.', vars: { tadpoles: '450', weeklySurvival: '0.75', week: '1' } },
      { line: 19, note: 'The counter becomes 2.', vars: { tadpoles: '450', weeklySurvival: '0.75', week: '2' } },
      { line: 20, note: 'Printed.', vars: { tadpoles: '450', weeklySurvival: '0.75', week: '2' }, out: 'week 2: 450\n' },
      { line: 22, note: '`-=` subtracts: 450 − 50 = 400.', vars: { tadpoles: '400', weeklySurvival: '0.75', week: '2' } },
      { line: 23, note: 'Printed.', vars: { tadpoles: '400', weeklySurvival: '0.75', week: '2' }, out: 'after predation: 400\n' },
      { line: 25, note: 'A new counter, `metamorphosed`, starts at 3.', vars: { tadpoles: '400', weeklySurvival: '0.75', week: '2', metamorphosed: '3' } },
      { line: 26, note: 'Postfix `metamorphosed++` hands back the *old* value, 3, which initialises `before`. The variable itself becomes 4.', vars: { tadpoles: '400', weeklySurvival: '0.75', week: '2', metamorphosed: '4', before: '3' } },
      { line: 27, note: 'Prefix `++metamorphosed` increments first (4 → 5) and hands back the *new* value, 5.', vars: { tadpoles: '400', weeklySurvival: '0.75', week: '2', metamorphosed: '5', before: '3', after: '5' } },
      { line: 28, note: 'Printed. `before` and `after` differ by 2 because the variable was incremented twice in between.', vars: { tadpoles: '400', weeklySurvival: '0.75', week: '2', metamorphosed: '5', before: '3', after: '5' }, out: '3 5 5\n' },
      { line: 29, note: '`main` returns 0.', vars: { tadpoles: '400', weeklySurvival: '0.75', week: '2', metamorphosed: '5', before: '3', after: '5' } },
    ],
  },
};
