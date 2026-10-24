import type { Anatomy } from './types';

// The first and last lines of beverton_holt_output.csv as written by
// cpp-examples/io/bh_trajectory_csv.cpp (values computed with the same
// arithmetic; the time stamp is an example).
export const anatomies: Record<string, Anatomy> = {
  'simulation-output-csv': {
    title: 'beverton_holt_output.csv, line by line',
    start: 'hash',
    lines: [
      [['#', 'hash'], ' ', ['model: Beverton-Holt, N(t+1) = R0 * N(t) / (1 + N(t) / M)', 'model']],
      [['#', 'hash'], ' ', ['R0: 2.2', 'params']],
      [['#', 'hash'], ' ', ['M: 40', 'params']],
      [['#', 'hash'], ' ', ['N0: 5', 'params']],
      [['#', 'hash'], ' ', ['generations: 30', 'params']],
      [['#', 'hash'], ' ', ['seed: none (deterministic model)', 'seed']],
      [['#', 'hash'], ' ', ['program: bh_trajectory_csv 1.0.0', 'version']],
      [['#', 'hash'], ' ', ['created: 2026-10-24T09:15:02Z', 'created']],
      [['generation', 'col-gen'], [',', 'sep'], ['N', 'col-n']],
      [['0', 'gen-value'], [',', 'sep'], ['5', 'n0']],
      [['1', 'gen-value'], [',', 'sep'], ['9.7777777777777786', 'full']],
      [['2', 'gen-value'], [',', 'sep'], ['17.285714285714288', 'full']],
      [['…', 'ellipsis']],
      [['30', 'gen-value'], [',', 'sep'], ['47.999999977967732', 'last']],
    ],
    parts: {
      hash: {
        label: '#',
        role: 'Comment marker',
        explain:
          'Lines that start with # are metadata for people and for your scripts, not data. R (comment.char = "#"), readr (comment = "#") and pandas (comment = "#") skip them when reading the table, so the information travels with the data at no cost.',
      },
      model: {
        label: 'model',
        role: 'Metadata: the model',
        explain:
          'Which model produced the numbers, with its equation. A file found on a disk two years from now should explain itself without the source code.',
      },
      params: {
        label: 'parameters',
        role: 'Metadata: parameter values',
        explain:
          'Every parameter and the initial condition, one per line in the form key: value, so that a script can read them back. They are written with digits10 (15) significant digits, which reproduces values typed by a person exactly: 2.2 appears as 2.2.',
      },
      seed: {
        label: 'seed',
        role: 'Metadata: random seed',
        explain:
          'This model is deterministic, so there is no seed; the line says so explicitly. For a stochastic model the seed is the one value without which a run cannot be reproduced.',
      },
      version: {
        label: 'program',
        role: 'Metadata: program and version',
        explain:
          'The program that wrote the file and its version. When you fix a bug, change the version, so that results from before and after the fix can be told apart. A version-control commit identifier is even better.',
      },
      created: {
        label: 'created',
        role: 'Metadata: time stamp',
        explain:
          'When the file was written, in UTC (the Z) and ISO 8601 form, which sorts correctly as text. It changes on every run; keeping it in a comment line means that comparisons of the data themselves are not affected.',
      },
      'col-gen': {
        label: 'generation',
        role: 'Column name',
        explain:
          'The header row names the columns. Use short, lower-case names without spaces or units in brackets; the units can be stated in the metadata. The generation is the time variable: one row per census.',
      },
      'col-n': {
        label: 'N',
        role: 'Column name',
        explain: 'The state variable. Here the state is a single number; a model with several state variables gets one column each, or a long format with a column saying which variable a row holds.',
      },
      sep: {
        label: ',',
        role: 'Separator',
        explain:
          'A single comma between fields, with no padding. The decimal separator is always a point, because C++ streams use the classic locale unless told otherwise.',
      },
      'gen-value': {
        label: 'generation values',
        role: 'Time',
        explain: 'Generations 0 to 30: the initial state and 30 updates, 31 rows in all. Including generation 0 records the initial condition in the data, not only in the metadata.',
      },
      n0: {
        label: '5',
        role: 'Initial state',
        explain: 'N0 = 5 is exactly representable, so even at full precision it is written as 5: max_digits10 is a maximum, and trailing zeros are dropped.',
      },
      full: {
        label: 'full precision',
        role: 'Round-trip value',
        explain:
          'Seventeen significant digits (max_digits10): reading this text back gives exactly the double the program computed. The final digits look like noise, but they are what makes a later comparison between runs or program versions meaningful.',
      },
      ellipsis: {
        label: '…',
        role: 'Omitted rows',
        explain: 'Generations 3 to 29 are not shown here. The file itself contains every one of them.',
      },
      last: {
        label: '47.999999977967732',
        role: 'Final state',
        explain:
          'Very close to, but not at, the carrying capacity K = (R0 − 1) M = 48. At the default precision of six digits this row would read 30,48 and suggest that the population had reached K exactly.',
      },
    },
  },
};
