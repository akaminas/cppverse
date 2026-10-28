import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'variables-and-types-declaration': {
    title: 'Two declarations, element by element',
    start: 'type-double',
    lines: [
      [['const', 'const'], ' ', ['double', 'type-double'], ' ', ['seedMass', 'name'], ['{', 'braces'], ['0.42', 'literal-double'], ['}', 'braces'], [';', 'semicolon'], '   ', ['// grams per seed', 'comment']],
      [['int', 'type-int'], ' ', ['seedCount', 'name'], ' ', ['=', 'equals'], ' ', ['120', 'literal-int'], [';', 'semicolon']],
    ],
    parts: {
      const: {
        label: 'const',
        role: 'Type qualifier',
        explain:
          'Promises that the value will not change after initialisation. The compiler rejects any later attempt to assign to it. Use const for every value that stays fixed, such as a measured trait or a model parameter.',
      },
      'type-double': {
        label: 'double',
        role: 'Type',
        explain:
          'A double-precision floating-point number: about 15 to 16 significant decimal digits, with a range far beyond any biological quantity. The default choice for masses, lengths, rates, probabilities and concentrations.',
      },
      'type-int': {
        label: 'int',
        role: 'Type',
        explain:
          'A whole number, positive or negative. On all common platforms an int holds values up to about 2.1 billion, enough for most counts of individuals, eggs or seeds. Larger counts, such as sequencing reads, need a wider type.',
      },
      name: {
        label: 'seedMass, seedCount',
        role: 'Identifier (the variable’s name)',
        explain:
          'Letters, digits and underscores, not starting with a digit, and not a keyword such as int or return. Case matters: seedMass and seedmass are different variables. Choose a name that says what the value means in the model.',
      },
      braces: {
        label: '{ }',
        role: 'Brace initialiser',
        explain:
          'Gives the variable its first value. Braces also check the value: int n{2.5}; is rejected because an int cannot hold 2.5, while int n = 2.5; would silently store 2.',
      },
      equals: {
        label: '=',
        role: 'Copy initialisation',
        explain:
          'In a declaration, = introduces the initial value; it is not an assignment and not an equation. The form is familiar and fine when the value obviously has the right type.',
      },
      'literal-double': {
        label: '0.42',
        role: 'Floating-point literal',
        explain: 'A number written in the code. The decimal point makes it a double. Write 120.0 rather than 120 when you mean a double.',
      },
      'literal-int': {
        label: '120',
        role: 'Integer literal',
        explain: 'A whole number written in the code; its type is int.',
      },
      semicolon: {
        label: ';',
        role: 'End of the declaration',
        explain: 'A declaration is a statement and ends with a semicolon.',
      },
      comment: {
        label: '// grams per seed',
        role: 'Comment',
        explain:
          'Ignored by the compiler. The type says how the value is stored, not what it measures: a comment (or the name itself) should record the unit.',
      },
    },
  },
};
