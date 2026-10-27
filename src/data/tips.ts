// Tips the nautilus offers while a learner reads.
//
// Every tip speaks in one of six voices, modelled on the kinds of comment the
// expert panel of the Groningen manual makes in its margins: the rules of the
// language, the elegant way of writing it, notes from biological fieldwork,
// recipes for disaster (common mistakes), deeper water (advanced material)
// and quick-and-dirty shortcuts that come with a warning. The wording is
// original. Lesson-specific tips live in lesson-tips.ts; the tips here are
// keyed by atlas domain, and the general ones can appear anywhere.

import { LESSON_GUIDES } from './lesson-tips';

export type Voice = 'rule' | 'style' | 'field' | 'disaster' | 'deep' | 'shortcut';

export interface Tip {
  voice: Voice;
  text: string;
}

/** The heading shown above a tip in the nautilus's speech bubble. */
export const VOICE_LABEL: Record<Voice, string> = {
  rule: 'A rule of the language',
  style: 'The elegant way',
  field: 'Field note',
  disaster: 'Recipe for disaster',
  deep: 'Deeper water',
  shortcut: 'Quick and dirty (beware)',
};

const rule = (text: string): Tip => ({ voice: 'rule', text });
const style = (text: string): Tip => ({ voice: 'style', text });
const field = (text: string): Tip => ({ voice: 'field', text });
const disaster = (text: string): Tip => ({ voice: 'disaster', text });
const deep = (text: string): Tip => ({ voice: 'deep', text });
const shortcut = (text: string): Tip => ({ voice: 'shortcut', text });

export const GENERAL_TIPS: readonly Tip[] = [
  style('Compile early and often. Ten new lines are easy to debug; two hundred are not.'),
  rule('When the compiler prints a wall of errors, fix the first one and compile again. Later errors are often echoes of it.'),
  style('Turn on warnings (-Wall -Wextra). A warning today is a wrong result you do not have to hunt for tomorrow.'),
  style('Name a variable after what it means in the model, such as birth_rate, not b2.'),
  style('Write the algorithm in plain words or pseudocode before you write C++.'),
  field('Change one thing at a time, then run again. Otherwise you cannot tell which change mattered.'),
  disaster('Making a large change without a copy of the version that worked. Commit to git first; it takes seconds.'),
  field('If a result surprises you, test a case where you know the answer by hand.'),
  disaster('Trusting output because it looks plausible. Wrong models produce plausible numbers too.'),
  shortcut('Copying code from the internet gets you running fast. Read every line first, and cite the source if you keep it.'),
  field('Explain your code out loud to someone, or to the nautilus. Bugs often reveal themselves halfway through the sentence.'),
  style('Read the code you wrote yesterday before adding to it. Fresh eyes find what tired ones missed.'),
];

export const DOMAIN_TIPS: Readonly<Record<string, readonly Tip[]>> = {
  anatomy: [
    rule('Every statement ends with a semicolon; a missing one is often reported on the next line.'),
    rule('main returns 0 when all went well. Other values tell the caller something failed.'),
    style('Indent consistently. The compiler does not care, but you will when you read it next week.'),
  ],
  numeric: [
    disaster('Integer division drops the remainder: 7 / 2 is 3. Write 7.0 / 2 when you mean 3.5.'),
    rule('Initialise every variable when you declare it. An uninitialised double holds whatever was in memory.'),
    rule('Never compare two doubles with ==. Ask whether they are close enough for your purpose.'),
    style('Give a constant a name, such as const double carrying_capacity = 500.0, instead of scattering 500 through the code.'),
  ],
  control: [
    field('Check the boundaries of a loop: does it run n times or n + 1 times? Trace the first and last pass by hand.'),
    rule('A while loop needs something inside it that changes its condition, or it never ends.'),
    style('Use braces even around a one-line if body. It prevents a classic bug when a second line is added.'),
  ],
  functions: [
    style('A function should do one job you can describe in one sentence.'),
    style('Pass large objects by const reference: no copy is made, and the function cannot change them by accident.'),
    field('Test a small function on its own before you build on it.'),
  ],
  data: [
    style('Valid indices of a vector run from 0 to size() - 1. Use .at() while debugging: it stops at the first bad index.'),
    deep('Reserve space with reserve() when you know roughly how many elements a vector will hold.'),
    style('Choose the container for how you will use it: lookup by key suggests a map; ordered traversal suggests a vector.'),
  ],
  io: [
    rule('Always check that a file opened before you read from it.'),
    field('Write simulation output as plain columns (CSV) so you can plot it with any tool.'),
    shortcut('Recompiling for every new parameter value works for one run. For ten, read the parameters from a file.'),
  ],
  architecture: [
    rule('Put declarations in a header and definitions in a .cpp file, and guard every header against double inclusion.'),
    style('A class should keep its own data consistent. Check parameters in the constructor.'),
    style('Prefer std::vector and smart pointers to raw new and delete.'),
  ],
  algorithms: [
    deep('Before optimising, measure. The slow part is rarely where you expect.'),
    disaster('Overwriting the old state while later updates still need it. Update from the old state unless the biology says otherwise.'),
  ],
  ode: [
    field('Halve the step size and run again. If the answer changes noticeably, the step was too large.'),
    deep('Euler is easy to write but needs small steps; RK4 buys far more accuracy for four times the work per step.'),
    field('Check a conserved quantity, such as S + I + R, to catch integration errors.'),
  ],
  stochastic: [
    rule('Seed the random engine once, at the start, and record the seed with the output.'),
    field('One stochastic run is an anecdote. Run many replicates and summarise their distribution.'),
    rule('Draw the waiting time from an exponential distribution whose rate is the total propensity.'),
  ],
  ibm: [
    field('Shuffle the order in which individuals act, or the first in the list gets a systematic advantage.'),
    field('Start with a tiny population you can follow by hand, then scale up.'),
  ],
  inference: [
    field('Report uncertainty across replicates, not just a mean.'),
    field('Vary one parameter at a time first; that is the simplest sensitivity analysis.'),
    field('Write down what result would surprise you before you run the experiment.'),
  ],
};

/** Tips for a page: this lesson's own, its domain's, and the general ones. */
export function tipPools(slug: string | null, domain: string | null) {
  return {
    lesson: (slug && LESSON_GUIDES[slug]?.tips) || [],
    domain: (domain && DOMAIN_TIPS[domain]) || [],
    general: GENERAL_TIPS,
  };
}

/**
 * Choose the next tip: in a lesson, usually one of its own tips, sometimes
 * one for its domain or a general one. Tips already shown (`seen`) are
 * skipped until a pool has been shown in full.
 */
export function pickTip(slug: string | null, domain: string | null, seen: ReadonlySet<string>, rand: () => number = Math.random): Tip {
  const pools = tipPools(slug, domain);
  const r = rand();
  const order = pools.lesson.length
    ? r < 0.65
      ? [pools.lesson, pools.domain, pools.general]
      : r < 0.85
        ? [pools.domain, pools.lesson, pools.general]
        : [pools.general, pools.lesson, pools.domain]
    : r < 0.55 && pools.domain.length
      ? [pools.domain, pools.general]
      : [pools.general, pools.domain];
  for (const pool of order) {
    const fresh = pool.filter((t) => !seen.has(t.text));
    if (fresh.length) return fresh[Math.floor(rand() * fresh.length)];
  }
  // Everything has been seen: start again from the first preferred pool.
  const pool = order.find((p) => p.length) ?? GENERAL_TIPS;
  return pool[Math.floor(rand() * pool.length)];
}
