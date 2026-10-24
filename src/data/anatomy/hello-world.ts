import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  hello: {
    title: 'Hello, world, element by element',
    start: 'cout',
    lines: [
      [['#include', 'include'], ' ', ['<iostream>', 'iostream']],
      [],
      [['int', 'int'], ' ', ['main', 'main'], ['()', 'parens'], ' ', ['{', 'brace-open']],
      ['    ', ['std', 'std'], ['::', 'scope'], ['cout', 'cout'], ' ', ['<<', 'insert'], ' ', ['"Hello, world!', 'literal'], ['\\n', 'newline'], ['"', 'literal'], [';', 'semicolon']],
      ['    ', ['return', 'return'], ' ', ['0', 'zero'], [';', 'semicolon']],
      [['}', 'brace-close']],
    ],
    parts: {
      include: {
        label: '#include',
        role: 'Preprocessor directive',
        explain:
          'Lines that start with # are handled by the preprocessor before the compiler proper sees the code. #include pastes in the contents of another file, here the declarations that make std::cout available. Without it the compiler does not know what std::cout is and stops with an error.',
      },
      iostream: {
        label: '<iostream>',
        role: 'Header name',
        explain:
          'The header of the standard library that declares input and output streams (std::cout, std::cin, std::cerr). Angle brackets tell the compiler to look in the standard library’s own directories; your own headers use quotes instead: #include "model.hpp".',
      },
      int: {
        label: 'int',
        role: 'Return type',
        explain:
          'main returns a whole number (an int) to the operating system when the program ends. By convention 0 means success and any other value signals an error, which scripts and workflow tools can check.',
      },
      main: {
        label: 'main',
        role: 'Function name',
        explain:
          'Every C++ program has exactly one function called main. Execution starts at its first statement and the program ends when main returns. Later you will write your own functions and call them from main.',
      },
      parens: {
        label: '()',
        role: 'Parameter list',
        explain:
          'The parentheses after a function name hold its parameters: the values it receives. This main takes none, so the list is empty. A later lesson uses int main(int argc, char* argv[]) to receive command-line arguments.',
      },
      'brace-open': {
        label: '{',
        role: 'Start of the function body',
        explain:
          'Curly braces enclose the body of main: the statements that run, in order, from top to bottom. Braces always come in pairs; the matching } closes the body.',
      },
      'brace-close': {
        label: '}',
        role: 'End of the function body',
        explain: 'The closing brace ends the body of main. Reaching it would also end the program; here the return statement ends it one line earlier.',
      },
      std: {
        label: 'std',
        role: 'Namespace',
        explain:
          'Everything in the C++ standard library lives in the namespace std. A namespace groups names so that the library’s cout cannot clash with a variable called cout in your own code.',
      },
      scope: {
        label: '::',
        role: 'Scope resolution operator',
        explain: 'The double colon reads “the name on the right, found inside the namespace on the left”. std::cout is the cout that belongs to std.',
      },
      cout: {
        label: 'cout',
        role: 'Output stream object',
        explain:
          'std::cout (“character output”) is an object connected to the console. Whatever you send into it appears as text. It knows how to print text, whole numbers and decimal numbers, so later you can print population sizes and rates the same way.',
      },
      insert: {
        label: '<<',
        role: 'Stream insertion operator',
        explain:
          'The arrows point the way the data flows: from the value on the right into the stream on the left. Insertions can be chained, as in std::cout << "N = " << N << \'\\n\';',
      },
      literal: {
        label: '"Hello, world!"',
        role: 'String literal',
        explain:
          'Text between double quotes is a string literal: a fixed sequence of characters written into the program. The quotes are not printed; they only mark where the text begins and ends.',
      },
      newline: {
        label: '\\n',
        role: 'Escape sequence: newline',
        explain:
          'A backslash starts an escape sequence. \\n stands for a single newline character, so the next output starts on a new line. (You may also meet std::endl, which prints a newline and additionally flushes the stream; it is slower in loops.)',
      },
      semicolon: {
        label: ';',
        role: 'Statement terminator',
        explain:
          'Every statement ends with a semicolon. Line breaks mean nothing to the compiler; the semicolon is what separates one instruction from the next. A missing semicolon is the most common first compiler error.',
      },
      return: {
        label: 'return',
        role: 'Keyword',
        explain: 'return ends the function immediately and hands a value back to whoever called it. For main, the caller is the operating system.',
      },
      zero: {
        label: '0',
        role: 'Integer literal: exit status',
        explain: 'The value returned to the operating system: 0 means the program finished successfully. (If main has no return statement, C++ behaves as if it returned 0.)',
      },
    },
  },
};
