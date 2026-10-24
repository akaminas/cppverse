import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'code-style-function': {
    title: 'What makes this function easy to check',
    start: 'purpose',
    lines: [
      [['// One year of the seed-bank model; all probabilities are per year.', 'purpose']],
      [['double', 'return-type'], ' ', ['nextSeedBank', 'function-name'], '(', ['double seeds, double germination, double seedlingSurvival,', 'parameters']],
      [['                    ', 'continuation'], ['double seedsPerPlant, double seedSurvival', 'parameters'], ') ', ['{', 'brace']],
      [['    ', 'indent'], ['const double', 'const-local'], ' ', ['fromFlowering', 'pathway'], ' = ', ['seeds * germination * seedlingSurvival * seedsPerPlant', 'spaces'], ';'],
      [['    ', 'indent'], ['const double', 'const-local'], ' ', ['stillDormant', 'pathway'], ' = seeds * ', ['(1.0 - germination)', 'parentheses'], ' * seedSurvival;'],
      [['    ', 'indent'], ['return fromFlowering + stillDormant;', 'return']],
      [['}', 'brace']],
    ],
    parts: {
      purpose: {
        label: 'Purpose comment',
        role: 'Comment at the level of the model',
        explain:
          'Says what the function means biologically and states an assumption (rates are per year) that the code cannot express. It does not repeat what each line does. In the full program, the comment also lists each parameter with its symbol in the equation.',
      },
      'return-type': {
        label: 'double',
        role: 'Return type',
        explain: 'The function hands back one number: the size of the seed bank next year. Returning a value is clearer than modifying a variable that belongs to the caller.',
      },
      'function-name': {
        label: 'nextSeedBank',
        role: 'Function name',
        explain:
          'Says what the result is. The site writes function and variable names in camelCase (lower case first, a capital for each further word) and types in PascalCase. Names are words, not abbreviations: nextSeedBank, not nxtSB.',
      },
      parameters: {
        label: 'Parameters',
        role: 'Interface',
        explain:
          'Each parameter is named after a quantity in the model, in the order the equation uses them. Cheap types such as double are passed by value. Five parameters is about the limit of readability; beyond that, group them in a struct.',
      },
      continuation: {
        label: 'Aligned continuation',
        role: 'Line break',
        explain: 'A long parameter list is broken after a comma, and the continuation is aligned with the first parameter so that the list reads as one unit. Keep lines short enough to read without scrolling (80–100 characters).',
      },
      brace: {
        label: '{ }',
        role: 'Braces',
        explain:
          'The opening brace ends the line that starts the block; the closing brace sits alone, aligned with the start of that line. Whatever layout you choose, use it everywhere: consistency matters more than the particular style.',
      },
      indent: {
        label: 'Indentation',
        role: 'Layout',
        explain: 'Four spaces per level show what belongs to the function body. Indentation is ignored by the compiler but is how a reader sees structure; let the editor or clang-format apply it.',
      },
      'const-local': {
        label: 'const double',
        role: 'Named intermediate',
        explain: 'Each intermediate value is computed once and never changed, so it is const. A reader can trust that its value is the one computed on this line.',
      },
      pathway: {
        label: 'fromFlowering, stillDormant',
        role: 'Code mirrors the model',
        explain:
          'The model has two pathways into next year’s seed bank. Giving each its own named line lets a reader compare the code with the equation term by term, and lets you print one pathway when something looks wrong.',
      },
      spaces: {
        label: 'Spaces around operators',
        role: 'Layout',
        explain: 'Binary operators such as * and + have a space on each side; unary operators (-x, ++i, !flag) do not. This makes long expressions readable.',
      },
      parentheses: {
        label: '(1.0 - germination)',
        role: 'Parentheses',
        explain: 'Required here, because * binds more tightly than -. Parentheses are also worth adding where they are not required but make the intended grouping obvious.',
      },
      return: {
        label: 'return',
        role: 'Result',
        explain: 'The last line reads like the equation: next year’s seeds are the sum of the two pathways.',
      },
    },
  },
};
