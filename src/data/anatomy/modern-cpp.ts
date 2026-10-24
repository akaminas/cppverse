import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'modern-cpp-format': {
    title: 'A std::format replacement field, character by character',
    start: 'precision',
    lines: [
      [['std::format', 'format'], '(', ['"density ', 'text'], ['{', 'open'], [':', 'colon'], ['>', 'align'], ['8', 'width'], ['.2', 'precision'], ['f', 'type'], ['}', 'close'], [' per km2"', 'text'], ', ', ['density', 'arg'], ')'],
    ],
    parts: {
      format: {
        label: 'std::format',
        role: 'Function (C++20, <format>)',
        explain:
          'Returns a std::string built from a format string and arguments. The format string is checked at compile time: a field that does not suit its argument’s type is a compile error, not a garbled line in your output file.',
      },
      text: {
        label: 'literal text',
        role: 'Copied unchanged',
        explain: 'Everything outside braces is copied to the result as it is. Write {{ or }} to produce a literal brace.',
      },
      open: {
        label: '{',
        role: 'Start of a replacement field',
        explain: 'Each field is replaced by the next argument, in order. {0}, {1} select arguments by position instead.',
      },
      colon: {
        label: ':',
        role: 'Separator',
        explain: 'What follows the colon is the format specification. {} alone uses the default, which for a double is the shortest text that reads back as exactly the same value.',
      },
      align: {
        label: '>',
        role: 'Alignment',
        explain: 'Right-align within the field: > right, < left, ^ centre. Numbers are right-aligned by default; strings are left-aligned.',
      },
      width: {
        label: '8',
        role: 'Minimum width',
        explain: 'Pad to at least 8 characters, so that columns line up. The equivalent of std::setw(8), but it applies to this field only and does not need <iomanip>.',
      },
      precision: {
        label: '.2',
        role: 'Precision',
        explain: 'With the f type, the number of digits after the decimal point. The rounding is exact and identical on every standard library.',
      },
      type: {
        label: 'f',
        role: 'Presentation type',
        explain: 'Fixed-point notation, like std::fixed. e gives scientific notation and g the general format; d is for integers.',
      },
      close: {
        label: '}',
        role: 'End of the field',
        explain: 'Closes the replacement field.',
      },
      arg: {
        label: 'density',
        role: 'Argument',
        explain: 'The value formatted into the first field. Types are deduced; there are no printf-style type codes to get wrong.',
      },
    },
  },
};
