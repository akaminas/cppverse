// Short tips the nautilus offers while a learner reads. Each is original
// wording of practical advice that a C++ course for biologists teaches
// (compiling, debugging, numerical care, reproducible simulation). Tips are
// keyed by atlas domain so a lesson shows advice about its own topic; the
// general ones can appear anywhere.

export const GENERAL_TIPS: readonly string[] = [
  'Compile early and often. Ten new lines are easy to debug; two hundred are not.',
  'When the compiler prints a wall of errors, fix the first one and compile again. Later errors are often echoes of it.',
  'Turn on warnings (-Wall -Wextra). A warning today is a wrong result you do not have to hunt for tomorrow.',
  'Name a variable after what it means in the model, such as birth_rate, not b2.',
  'Write the algorithm in plain words or pseudocode before you write C++.',
  'Change one thing at a time, then run again. Otherwise you cannot tell which change mattered.',
  'Keep a copy of a version that works before a large change.',
  'If a result surprises you, test a case where you know the answer by hand.',
];

export const DOMAIN_TIPS: Readonly<Record<string, readonly string[]>> = {
  anatomy: [
    'Every statement ends with a semicolon; a missing one is often reported on the next line.',
    'main returns 0 when all went well. Other values tell the caller something failed.',
    'Indent consistently. The compiler does not care, but you will when you read it next week.',
  ],
  numeric: [
    'Integer division drops the remainder: 7 / 2 is 3. Write 7.0 / 2 when you mean 3.5.',
    'Initialise every variable when you declare it. An uninitialised double holds whatever was in memory.',
    'Never compare two doubles with ==. Ask whether they are close enough for your purpose.',
    'Give a constant a name, such as const double carrying_capacity = 500.0, instead of scattering 500 through the code.',
  ],
  control: [
    'Check the boundaries of a loop: does it run n times or n + 1 times? Trace the first and last pass by hand.',
    'A while loop needs something inside it that changes its condition, or it never ends.',
    'Use braces even around a one-line if body. It prevents a classic bug when a second line is added.',
  ],
  functions: [
    'A function should do one job you can describe in one sentence.',
    'Pass large objects by const reference: no copy is made, and the function cannot change them by accident.',
    'Test a small function on its own before you build on it.',
  ],
  data: [
    'Valid indices of a vector run from 0 to size() − 1. Use .at() while debugging: it stops at the first bad index.',
    'Reserve space with reserve() when you know roughly how many elements a vector will hold.',
    'Choose the container for how you will use it: lookup by key suggests a map; ordered traversal suggests a vector.',
  ],
  io: [
    'Always check that a file opened before you read from it.',
    'Write simulation output as plain columns (CSV) so you can plot it with any tool.',
    'Read parameters from a file instead of recompiling for every new value.',
  ],
  architecture: [
    'Put declarations in a header and definitions in a .cpp file, and guard every header against double inclusion.',
    'A class should keep its own data consistent. Check parameters in the constructor.',
    'Prefer std::vector and smart pointers to raw new and delete.',
  ],
  algorithms: [
    'Before optimising, measure. The slow part is rarely where you expect.',
    'Update all individuals from the old state before you overwrite it, unless sequential updating is what the biology means.',
  ],
  ode: [
    'Halve the step size and run again. If the answer changes noticeably, the step was too large.',
    'Euler is easy to write but needs small steps; RK4 buys far more accuracy for four times the work per step.',
    'Check a conserved quantity, such as S + I + R, to catch integration errors.',
  ],
  stochastic: [
    'Seed the random engine once, at the start, and record the seed with the output.',
    'One stochastic run is an anecdote. Run many replicates and summarise their distribution.',
    'Draw the waiting time from an exponential distribution whose rate is the total propensity.',
  ],
  ibm: [
    'Shuffle the order in which individuals act, or the first in the list gets a systematic advantage.',
    'Start with a tiny population you can follow by hand, then scale up.',
  ],
  inference: [
    'Report uncertainty across replicates, not just a mean.',
    'Vary one parameter at a time first; that is the simplest sensitivity analysis.',
    'Write down what result would surprise you before you run the experiment.',
  ],
};

export function tipsFor(domain: string | null): readonly string[] {
  return [...(domain ? DOMAIN_TIPS[domain] ?? [] : []), ...GENERAL_TIPS];
}
