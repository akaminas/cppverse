// Registry of the original C++ example programs in /cpp-examples.
//
// Every program shown in a lesson is read from this folder at build time,
// so the code on the page is exactly the code that CI compiles and runs
// (scripts/check-cpp.sh). Optional companion files:
//   <name>.out   expected standard output (checked exactly in CI)
//   <name>.in    standard input fed to the program
//   <name>.args  command-line arguments (one line)
// Header lines parsed from each source file:
//   // Title: …
//   // Standard: C++17 | C++20 | C++23
//   // Expect: compile-error   (programs that demonstrate a compiler error)

const sources = import.meta.glob('/cpp-examples/**/*.{cpp,hpp}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const companions = import.meta.glob('/cpp-examples/**/*.{out,in,args,csv,txt}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export interface Example {
  /** Path relative to /cpp-examples, e.g. "foundations/hello.cpp". */
  file: string;
  name: string;
  title: string;
  code: string;
  standard: 'c++17' | 'c++20' | 'c++23';
  expectCompileError: boolean;
  expected?: string;
  stdin?: string;
  args?: string;
  /** Other files in the same folder that the program needs (headers, data). */
  siblings: string[];
}

const header = (code: string, key: string) => new RegExp(`^//\\s*${key}:\\s*(.+)$`, 'mi').exec(code)?.[1]?.trim();

export function getExample(file: string): Example {
  const key = `/cpp-examples/${file}`;
  const code = sources[key];
  if (code === undefined) throw new Error(`Unknown C++ example "${file}". Available: ${Object.keys(sources).join(', ')}`);
  const base = key.replace(/\.(cpp|hpp)$/, '');
  const std = (header(code, 'Standard') ?? 'C++17').toLowerCase().replace(/\s/g, '') as Example['standard'];
  const dir = key.slice(0, key.lastIndexOf('/') + 1);
  const name = file.split('/').pop()!;
  const includes = [...code.matchAll(/#include\s+"([^"]+)"/g)].map((m) => m[1]);
  return {
    file,
    name,
    title: header(code, 'Title') ?? name,
    code,
    standard: ['c++17', 'c++20', 'c++23'].includes(std) ? std : 'c++17',
    expectCompileError: /compile-error/i.test(header(code, 'Expect') ?? ''),
    expected: companions[`${base}.out`],
    stdin: companions[`${base}.in`],
    args: companions[`${base}.args`]?.trim(),
    // Local headers, plus the source file that implements each header (x.hpp → x.cpp), as CI compiles them.
    siblings: includes
      .flatMap((inc) => [inc, inc.replace(/\.hpp$/, '.cpp')])
      .filter((inc, i, arr) => arr.indexOf(inc) === i)
      .map((inc) => `${dir}${inc}`.replace('/cpp-examples/', ''))
      .filter((p) => sources[`/cpp-examples/${p}`] !== undefined),
  };
}

export function allExampleFiles(): string[] {
  return [...Object.keys(sources), ...Object.keys(companions)].map((k) => k.replace('/cpp-examples/', ''));
}

export function rawExampleFile(path: string): string | undefined {
  return sources[`/cpp-examples/${path}`] ?? companions[`/cpp-examples/${path}`];
}

/** The command a learner types to build and run the example. */
export function buildCommand(ex: Example): string {
  const exe = ex.name.replace(/\.cpp$/, '');
  const others = ex.siblings.filter((s) => s.endsWith('.cpp')).map((s) => s.split('/').pop());
  const files = [ex.name, ...others].join(' ');
  const run = `./${exe}${ex.args ? ` ${ex.args}` : ''}${ex.stdin ? ` < ${exe}.in` : ''}`;
  return `g++ -std=${ex.standard} -Wall -Wextra -pedantic ${files} -o ${exe}\n${run}`;
}
