import type { Anatomy } from './types';

// The essential lines of cpp-examples/architecture/growth_model/growth.hpp
// (header comment omitted).
export const anatomies: Record<string, Anatomy> = {
  'multiple-files-header': {
    title: 'growth.hpp, the interface of the growth model',
    start: 'ifndef',
    lines: [
      [['#ifndef GROWTH_MODEL_GROWTH_HPP', 'ifndef']],
      [['#define GROWTH_MODEL_GROWTH_HPP', 'define']],
      [],
      [['struct GrowthParameters {', 'struct']],
      ['    ', ['double Linf = 60.0;', 'member'], '  // asymptotic length (cm)'],
      ['    ', ['double k = 0.25;', 'member'], '     // growth coefficient (per year)'],
      ['    ', ['double L0 = 5.0;', 'member'], '     // length at age 0 (cm)'],
      [['};', 'struct']],
      [],
      [['double lengthAtAge(double age, const GrowthParameters& p)', 'decl'], [';', 'semi']],
      [['double ageAtLength(double length, const GrowthParameters& p)', 'decl'], [';', 'semi']],
      [],
      [['#endif', 'endif'], '  // GROWTH_MODEL_GROWTH_HPP'],
    ],
    parts: {
      ifndef: {
        label: '#ifndef',
        role: 'Include guard, part 1',
        explain:
          '"If not defined": the preprocessor keeps the lines up to #endif only if the macro GROWTH_MODEL_GROWTH_HPP has not been defined yet in this translation unit. The first time the header is included, it has not.',
      },
      define: {
        label: '#define',
        role: 'Include guard, part 2',
        explain:
          'Defines the macro immediately, so that a second #include of this header in the same .cpp file finds it defined and skips the whole content. The name must be unique across the project; deriving it from the folder and file name achieves that.',
      },
      struct: {
        label: 'struct GrowthParameters',
        role: 'Type definition',
        explain:
          'Every file that uses GrowthParameters must see its full definition, because the compiler needs to know its members and size. Type definitions therefore belong in headers. Defining the same struct in several .cpp files through one header is allowed, provided each .cpp sees it only once: that is what the guard ensures.',
      },
      member: {
        label: 'default member initialisers',
        role: 'Defaults',
        explain: 'The default parameter values are part of the interface: a caller who writes GrowthParameters fish{}; gets them without looking into growth.cpp.',
      },
      decl: {
        label: 'function declaration',
        role: 'Prototype',
        explain:
          'Name, parameter types and return type, without a body. This is all the compiler needs in order to check and compile a call in main.cpp. The parameter names are optional, but they document what each argument means, so keep them.',
      },
      semi: {
        label: ';',
        role: 'End of declaration',
        explain: 'A semicolon instead of a body { … } is what makes this a declaration rather than a definition. The definition, with the body, is in growth.cpp.',
      },
      endif: {
        label: '#endif',
        role: 'Include guard, part 3',
        explain: 'Closes the #ifndef. Repeating the macro name in a comment helps when a header is long.',
      },
    },
  },
};
