import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'command-line-argv': {
    title: 'What main receives from one command line',
    start: 'argv1',
    lines: [
      [['$', 'prompt'], ' ', ['./cli_args_bh', 'argv0'], ' ', ['2.5', 'argv1'], ' ', ['50', 'argv2'], ' ', ['5', 'argv3'], ' ', ['20', 'argv4']],
      [],
      [['int', 'ret'], ' main(', ['int argc', 'argc'], ', ', ['char* argv[]', 'argv'], ')'],
    ],
    parts: {
      prompt: {
        label: '$',
        role: 'Shell prompt',
        explain:
          'The prompt of the terminal, not part of the command. The shell splits the rest of the line into words at spaces and starts the program, handing the words over in order. Quotes keep a word with spaces together: "my file.txt" arrives as one argument.',
      },
      argv0: {
        label: 'argv[0]',
        role: 'Program name',
        explain:
          'The first word is the program itself, as it was typed (here with the ./ prefix). It is useful in a usage message, but its exact form depends on how the program was started, so do not rely on it for anything else.',
      },
      argv1: {
        label: 'argv[1]',
        role: 'First argument',
        explain:
          'The text "2.5": a sequence of characters, not yet a number. The program converts it with std::stod and must decide what to do if the conversion fails. In cli_args_bh it becomes the growth factor R0.',
      },
      argv2: {
        label: 'argv[2]',
        role: 'Second argument',
        explain: 'The text "50", converted to the half-saturation density M. Positional arguments must come in the documented order: the program cannot tell an M from an N0.',
      },
      argv3: {
        label: 'argv[3]',
        role: 'Third argument',
        explain: 'The text "5", converted to the initial population size N0.',
      },
      argv4: {
        label: 'argv[4]',
        role: 'Fourth argument',
        explain:
          'The text "20", converted to an int with std::stoi: the number of generations. After the last argument, argv[argc] is a null pointer, so argv[5] here must never be read as text.',
      },
      ret: {
        label: 'int',
        role: 'Exit status',
        explain: 'main still returns the exit status: EXIT_SUCCESS (0) or EXIT_FAILURE. Shell scripts and workflow managers use it to detect failed runs, for instance after a malformed argument.',
      },
      argc: {
        label: 'int argc',
        role: 'Argument count',
        explain:
          'The number of words, including the program name: 5 for this command line. The number of arguments the user supplied is therefore argc − 1. Always check argc before reading argv[i].',
      },
      argv: {
        label: 'char* argv[]',
        role: 'Argument values',
        explain:
          'An array of C-style strings, one per word, argv[0] to argv[argc − 1]. A char* points at the first character of a text that ends with a zero byte. Turn an argument into a std::string (std::string arg{argv[1]}) before comparing it with ==, which on char* compares addresses, not text.',
      },
    },
  },
};
