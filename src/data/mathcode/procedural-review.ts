import type { MathCode } from './types';

export const mathcode: Record<string, MathCode> = {
  'procedural-review-step': {
    title: 'The two-stage update rule and its implementation',
    file: 'architecture/two_stage_sim.cpp',
    show: [36, 49],
    tex: String.raw`\htmlClass{mc-next}{J_{t+1}} = \htmlClass{mc-recruit}{\frac{b\,A_t}{1 + A_t / M}}, \qquad \htmlClass{mc-next}{A_{t+1}} = \htmlClass{mc-mature}{s_j\,J_t} + \htmlClass{mc-survive}{s_a\,A_t}`,
    terms: [
      {
        id: 'recruit',
        label: 'recruitment',
        explain:
          'New juveniles produced by the adults of generation t: b per adult at low density, reduced as adults become crowded. At A = M each adult produces b/2. This is the Beverton–Holt form, applied to the adults.',
        lines: [38],
      },
      {
        id: 'mature',
        label: 'maturation',
        explain: 'A fraction sj of this generation’s juveniles survives to join the adults. Juveniles that do not mature die: the juvenile stage lasts one generation.',
        lines: [39],
      },
      {
        id: 'survive',
        label: 'adult survival',
        explain: 'A fraction sa of the adults survives to the next generation. Because sa < 1, an adult lives on average 1/(1 − sa) generations.',
        lines: [39],
      },
      {
        id: 'next',
        label: 'the new state',
        explain:
          'Both new values are computed from the state at time t (the parameter s) and only then combined into the new State. Updating adults first and using the new adult number for recruitment would be a different model (see the update-order lesson).',
        lines: [40, 46],
      },
    ],
  },
};
