import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'functions-definition': {
    title: 'A function definition, element by element',
    start: 'name',
    lines: [
      [['double', 'return-type'], ' ', ['survival_probability', 'name'], ['(', 'params'], ['double daily_mortality', 'param1'], [', ', 'comma'], ['int days', 'param2'], [')', 'params'], ' ', ['{', 'body']],
      ['    ', ['return', 'return'], ' ', ['std::exp(-daily_mortality * days)', 'expression'], [';', 'semicolon']],
      [['}', 'body']],
    ],
    parts: {
      'return-type': {
        label: 'double',
        role: 'Return type',
        explain: 'The type of the value the function hands back to its caller. A probability is a real number, so double. A function that hands back nothing has the return type void.',
      },
      name: {
        label: 'survival_probability',
        role: 'Function name',
        explain: 'The name used to call the function. A good name says what the function computes, so that a call such as survival_probability(0.05, 30) reads like the model description.',
      },
      params: {
        label: '( … )',
        role: 'Parameter list',
        explain: 'The inputs the function needs, in order. The parentheses are required even when the list is empty, both in the definition and in every call: f().',
      },
      param1: {
        label: 'double daily_mortality',
        role: 'Parameter',
        explain: 'Each parameter has its own type and name. It behaves like a local variable that is created when the function is called and initialised with the value of the matching argument.',
      },
      comma: {
        label: ',',
        role: 'Separator',
        explain: 'Parameters are separated by commas. Unlike in a declaration such as double a, b; the type must be repeated for every parameter: (double a, double b), never (double a, b).',
      },
      param2: {
        label: 'int days',
        role: 'Parameter',
        explain: 'A whole number of days. Parameters can have different types; the arguments of a call are matched to them by position.',
      },
      body: {
        label: '{ … }',
        role: 'Function body',
        explain: 'The block of statements that runs on every call. Its parameters and any variables declared inside it are local: they cannot be seen from other functions, and they disappear when the function returns.',
      },
      return: {
        label: 'return',
        role: 'Return statement',
        explain: 'Ends the function immediately and hands the value of the expression back to the caller, where it takes the place of the call. A function with a non-void return type must return a value on every path.',
      },
      expression: {
        label: 'std::exp(-daily_mortality * days)',
        role: 'Returned expression',
        explain: 'The formula S = e^(−m d): the probability of surviving d days at a constant daily mortality rate m. Its value is converted to the return type if necessary.',
      },
      semicolon: {
        label: ';',
        role: 'End of statement',
        explain: 'The return statement ends with a semicolon like any other statement. The closing brace of the function needs none.',
      },
    },
  },
};
