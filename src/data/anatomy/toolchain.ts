import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'toolchain-command': {
    title: 'A build command, flag by flag',
    start: 'compiler',
    lines: [
      [['g++', 'compiler'], ' ', ['-std=c++17', 'std'], ' ', ['-Wall', 'wall'], ' ', ['-Wextra', 'wextra'], ' ', ['-Wpedantic', 'wpedantic'], ' ', ['-O2', 'opt'], ' ', ['toolchain_degree_days.cpp', 'source'], ' ', ['-o', 'o'], ' ', ['degree_days', 'exe']],
      [['./degree_days', 'run']],
    ],
    parts: {
      compiler: {
        label: 'g++',
        role: 'Compiler driver',
        explain:
          'The program that runs the whole tool chain: preprocessor, compiler, assembler and linker. Use g++ (or clang++) for C++, never gcc: gcc compiles C++ source but does not link the C++ standard library, so the link step fails. On macOS, g++ is usually a second name for Apple’s clang++.',
      },
      std: {
        label: '-std=c++17',
        role: 'Language standard',
        explain:
          'Which edition of the C++ standard the code is written in. Compilers have different defaults; stating the standard makes the build reproducible on another machine. Use -std=c++20 for programs that need C++20 features.',
      },
      wall: {
        label: '-Wall',
        role: 'Warning flag',
        explain:
          'Turns on a large set of warnings about code that is legal but probably wrong: unused variables, an assignment used as a condition, variables that may be read before they are set. Despite its name it is not “all” warnings.',
      },
      wextra: {
        label: '-Wextra',
        role: 'Warning flag',
        explain: 'More warnings, for example comparisons between signed and unsigned integers and function parameters that are never used.',
      },
      wpedantic: {
        label: '-Wpedantic',
        role: 'Warning flag',
        explain:
          'Warns about compiler-specific extensions that are not part of standard C++. Code that passes this check is more likely to compile with another compiler, for example on a computing cluster. (-pedantic is an older spelling of the same flag.)',
      },
      opt: {
        label: '-O2',
        role: 'Optimisation level',
        explain:
          'Asks the compiler to optimise the machine code, which often makes numerical programs several times faster. -O0 (the default) compiles quickly and keeps the code close to the source, which suits debugging; add -g to include debugging information.',
      },
      source: {
        label: 'toolchain_degree_days.cpp',
        role: 'Source file',
        explain:
          'The file to compile. A larger program lists several .cpp files here, or compiles each one separately into an object file and links the object files afterwards.',
      },
      o: {
        label: '-o',
        role: 'Output option',
        explain: 'The next word is the name of the file to produce. Without -o, the executable is called a.out (a.exe on Windows).',
      },
      exe: {
        label: 'degree_days',
        role: 'Executable name',
        explain: 'The program that the linker writes. On Windows the compiler adds .exe automatically.',
      },
      run: {
        label: './degree_days',
        role: 'Running the program',
        explain:
          'Executes the program from the current directory. ./ is needed on Linux and macOS because the current directory is not searched for programs by default; in the Windows command prompt or PowerShell type degree_days or .\\degree_days.',
      },
    },
  },
};
