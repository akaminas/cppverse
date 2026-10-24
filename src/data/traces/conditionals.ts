import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'conditionals-stage': {
    title: 'An else-if chain, one test at a time',
    file: 'foundations/conditionals_stage.cpp',
    steps: [
      { line: 9, note: 'The development threshold is fixed for the whole program, so it is const.', vars: { base: '10' } },
      { line: 10, note: 'The mean daily temperature over the period.', vars: { base: '10', mean_temperature: '17.5' } },
      { line: 11, note: 'The number of days in the period.', vars: { base: '10', mean_temperature: '17.5', days: '30' } },
      {
        line: 13,
        note: 'Each day contributes 17.5 − 10 = 7.5 degree-days; over 30 days that is 225.',
        vars: { base: '10', mean_temperature: '17.5', days: '30', degree_days: '225' },
      },
      {
        line: 14,
        note: 'Print the total before deciding anything with it.',
        vars: { base: '10', mean_temperature: '17.5', days: '30', degree_days: '225' },
        out: 'Accumulated: 225 degree-days\n',
      },
      {
        line: 16,
        note: 'First test: is 225 ≥ 400? No, so the adult branch is skipped and execution moves to the else.',
        vars: { base: '10', mean_temperature: '17.5', days: '30', degree_days: '225' },
      },
      {
        line: 18,
        note: 'The else holds another if. Is 225 ≥ 250? No: skip the pupa branch.',
        vars: { base: '10', mean_temperature: '17.5', days: '30', degree_days: '225' },
      },
      {
        line: 20,
        note: 'Is 225 ≥ 100? Yes. This is the first true condition, so its branch runs.',
        vars: { base: '10', mean_temperature: '17.5', days: '30', degree_days: '225' },
      },
      {
        line: 21,
        note: 'The larva branch prints its message.',
        vars: { base: '10', mean_temperature: '17.5', days: '30', degree_days: '225' },
        out: 'Stage: larva\n',
      },
      {
        line: 25,
        note: 'The final else is never examined: once one branch has run, the rest of the chain is skipped and execution continues after it.',
        vars: { base: '10', mean_temperature: '17.5', days: '30', degree_days: '225' },
      },
    ],
  },
};
