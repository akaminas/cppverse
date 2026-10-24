import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'logical-expressions-guard': {
    title: 'A compound condition, part by part',
    start: 'and',
    lines: [
      [['const bool', 'type'], ' ', ['large_clutches', 'name'], ' = ', ['nests > 0', 'left'], ' ', ['&&', 'and'], ' ', ['eggs / nests > 3.0', 'right'], [';', 'semi']],
      [['if', 'if'], ' (', ['large_clutches', 'use'], ' ', ['||', 'or'], ' ', ['!', 'not'], ['surveyed', 'flag'], ') { … }'],
    ],
    parts: {
      type: {
        label: 'const bool',
        role: 'Type',
        explain: 'bool holds one of two values, true or false. The result of a comparison is a bool, so it can be stored, named and reused. const because the answer does not change once computed.',
      },
      name: {
        label: 'large_clutches',
        role: 'A named condition',
        explain: 'Naming a condition makes the decision that uses it read like the rule in the model description. Names that read as yes/no questions or statements (is_dry, has_bred, large_clutches) work well.',
      },
      left: {
        label: 'nests > 0',
        role: 'Relational expression (the guard)',
        explain: 'A comparison: true if at least one nest was found. Relational operators are <, <=, >, >=, == (equal) and != (not equal). They bind more tightly than && and ||, so no parentheses are needed here.',
      },
      and: {
        label: '&&',
        role: 'Logical AND',
        explain: 'True only if both sides are true. The left side is evaluated first; if it is false, the result must be false and the right side is not evaluated at all. This short-circuit rule is what makes the guard work: with no nests, the division is never attempted.',
      },
      right: {
        label: 'eggs / nests > 3.0',
        role: 'Relational expression (guarded)',
        explain: 'The mean clutch size compared with 3. Arithmetic binds more tightly than comparison, so this is (eggs / nests) > 3.0. It is evaluated only when nests > 0 is true.',
      },
      semi: {
        label: ';',
        role: 'End of statement',
        explain: 'The declaration ends here. Nothing has been decided yet; the condition has only been computed and named.',
      },
      if: {
        label: 'if',
        role: 'Conditional statement',
        explain: 'Uses a bool to choose whether the block runs; here, to schedule a follow-up visit if clutches were large or if the plot has not been surveyed at all. Any expression that can be converted to bool can stand in the parentheses.',
      },
      use: {
        label: 'large_clutches',
        role: 'Stored condition',
        explain: 'The stored result is reused instead of repeating the comparison, which also guarantees that both places test the same thing.',
      },
      or: {
        label: '||',
        role: 'Logical OR',
        explain: 'True if at least one side is true. It also short-circuits: if the left side is true, the right side is not evaluated. && binds more tightly than ||, so mixed expressions are clearer with parentheses.',
      },
      not: {
        label: '!',
        role: 'Logical NOT',
        explain: 'Inverts a bool: !true is false. It binds more tightly than any binary operator, so !surveyed applies to surveyed alone; write !(a && b) to negate a whole expression.',
      },
      flag: {
        label: 'surveyed',
        role: 'bool variable',
        explain: 'A plain bool variable can be used directly as a condition. Writing surveyed == true adds nothing.',
      },
    },
  },
};
