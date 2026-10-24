import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'for-loops-header': {
    title: 'The parts of a for loop',
    start: 'condition',
    lines: [
      [['for', 'for'], ' ', ['(', 'paren'], ['int t = 1', 'init'], [';', 'semi1'], ' ', ['t <= generations', 'condition'], [';', 'semi2'], ' ', ['++t', 'update'], [')', 'paren'], ' ', ['{', 'brace']],
      ['    ', ['N = lambda * N;', 'body']],
      [['}', 'brace']],
    ],
    parts: {
      for: {
        label: 'for',
        role: 'Keyword',
        explain: 'Starts a loop whose header gathers everything that controls the repetition in one place: where the counter starts, when to stop and how to advance.',
      },
      paren: {
        label: '( … )',
        role: 'Loop header',
        explain: 'The parentheses hold three parts separated by two semicolons. Any part may be left empty, but both semicolons must always be there: for (;;) is a valid loop with no parts at all.',
      },
      init: {
        label: 'int t = 1',
        role: 'Initialisation',
        explain: 'Runs exactly once, before anything else. Usually it declares the loop variable. A variable declared here belongs to the loop: it exists only inside the header and the body, and is destroyed when the loop ends.',
      },
      semi1: {
        label: ';',
        role: 'Separator',
        explain: 'Separates the initialisation from the condition. These semicolons are part of the for syntax; they do not end statements.',
      },
      condition: {
        label: 't <= generations',
        role: 'Condition',
        explain: 'Tested before every pass, including the first. While it is true, the body runs; as soon as it is false, the loop ends. If it is false at the start, the body never runs. Here it lets t take the values 1, 2, …, generations.',
      },
      semi2: {
        label: ';',
        role: 'Separator',
        explain: 'Separates the condition from the update. There is no semicolon after the update.',
      },
      update: {
        label: '++t',
        role: 'Update',
        explain: 'Runs after every pass of the body, just before the condition is tested again. ++t adds one to t. Other updates are possible, for example t += 7 for a weekly census or --t to count down.',
      },
      brace: {
        label: '{ … }',
        role: 'Body (block)',
        explain: 'The braces enclose the statements repeated on every pass. Variables declared inside the braces are created afresh on each pass. Without braces only the single next statement belongs to the loop.',
      },
      body: {
        label: 'N = lambda * N;',
        role: 'Loop body',
        explain: 'The work done on each pass: here one generation of geometric growth. The statement is the same every time; what changes is the state it acts on.',
      },
    },
  },
};
