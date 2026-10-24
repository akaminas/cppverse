import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'pairs-and-structs-struct': {
    title: 'A struct definition and its use, element by element',
    start: 'struct',
    lines: [
      [['struct', 'struct'], ' ', ['State', 'name'], ' ', ['{', 'open']],
      ['    ', ['int', 'type'], ' ', ['year', 'member'], [';', 'member-semi']],
      ['    ', ['double', 'type'], ' ', ['N', 'member'], [';', 'member-semi'], '      ', ['// population size (individuals)', 'comment']],
      [['}', 'close'], [';', 'trailing']],
      [],
      [['State', 'use'], ' ', ['start', 'variable'], ['{0, 20.0}', 'init'], ';'],
      [['std::cout', 'cout'], ' << ', ['start', 'variable'], ['.', 'dot'], ['N', 'member'], ';'],
    ],
    parts: {
      struct: {
        label: 'struct',
        role: 'Keyword',
        explain:
          'Begins the definition of a new type. A struct bundles several named values (its members) into one object, so that they can be stored, copied and passed around together.',
      },
      name: {
        label: 'State',
        role: 'Type name',
        explain:
          'The name of the new type. From here on State can be used wherever a type is expected: State s, std::vector<State>, a function returning State. By convention user-defined types start with a capital letter, variables with a lower-case one.',
      },
      open: {
        label: '{',
        role: 'Start of the member list',
        explain: 'The members of the struct are declared between the braces.',
      },
      type: {
        label: 'int, double',
        role: 'Member type',
        explain:
          'Each member has its own type, and the types may differ, which a std::vector cannot offer. Members can also be strings, vectors or other structs.',
      },
      member: {
        label: 'year, N',
        role: 'Member name',
        explain:
          'The name used to reach the member through an object, as in start.N. Choose names that say what the value is in the model; first and second (as in std::pair) say nothing.',
      },
      'member-semi': {
        label: ';',
        role: 'End of a member declaration',
        explain: 'Every member declaration ends with a semicolon, like any other declaration.',
      },
      comment: {
        label: '// …',
        role: 'Comment',
        explain: 'State the meaning and the unit of each member next to its declaration. The definition is the one place every reader of the code will look.',
      },
      close: {
        label: '}',
        role: 'End of the member list',
        explain: 'Closes the definition. Nothing has been stored yet: a definition is a blueprint, and memory is used only when an object of the type is created.',
      },
      trailing: {
        label: ';',
        role: 'End of the definition',
        explain:
          'A struct definition must end with a semicolon, unlike a function body. The reason is that variables may be declared straight after the closing brace (struct State { … } a, b;); the semicolon ends that, usually empty, list. Forgetting it produces confusing errors on the following line.',
      },
      use: {
        label: 'State',
        role: 'The type in use',
        explain: 'Declares a variable of the new type, exactly as you would declare an int or a double.',
      },
      variable: {
        label: 'start',
        role: 'Object',
        explain: 'An object (an instance) of type State. It holds its own year and its own N.',
      },
      init: {
        label: '{0, 20.0}',
        role: 'Aggregate (brace) initialisation',
        explain:
          'The values in braces initialise the members in the order in which they are declared: year = 0, N = 20.0. Without the braces, State start; would leave both members uninitialised; with empty braces, State start{}; sets them to zero.',
      },
      cout: {
        label: 'std::cout',
        role: 'Output stream',
        explain: 'Members are printed one at a time; std::cout does not know how to print a whole State.',
      },
      dot: {
        label: '.',
        role: 'Member access operator',
        explain: 'object.member reaches a member of an object. It is the same dot you use for v.size() on a vector: a vector is an object with members too.',
      },
    },
  },
};
