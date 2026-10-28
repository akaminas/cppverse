import type { MathCode } from './types';

// Synchronised view of the Beverton–Holt recurrence and its implementation
// in cpp-examples/algorithms/beverton_holt.cpp (line numbers include the
// header comment).
export const mathcode: Record<string, MathCode> = {
  'discrete-time-models-bh': {
    title: 'The Beverton-Holt model, term by term',
    tex: String.raw`\htmlClass{mc-next}{N_{t+1}} = \frac{\htmlClass{mc-R0}{R_0}\,\htmlClass{mc-Nt}{N_t}}{\htmlClass{mc-denom}{1 + N_t/\htmlClass{mc-M}{M}}}, \qquad \htmlClass{mc-start}{N_0 = 5}, \qquad \htmlClass{mc-steps}{t = 0, 1, \dots, T - 1}`,
    file: 'algorithms/beverton_holt.cpp',
    show: [14, 37],
    terms: [
      {
        id: 'next',
        label: 'the next state',
        explain:
          'Nₜ₊₁ is the population size one generation later. The loop overwrites N with the value returned by nextGeneration and then stores it, so the trajectory grows by one entry per generation.',
        lines: [33, 34],
      },
      {
        id: 'R0',
        label: 'growth factor at low density',
        explain:
          'R₀ is the number of offspring per individual that reach the next census when the population is sparse. It is a parameter: it is set once (default 2.2) and read, never changed, by the update rule.',
        lines: [15, 23],
      },
      {
        id: 'Nt',
        label: 'the current state',
        explain:
          'Nₜ is the population size in generation t, the only state variable of the model. The update rule receives it as its argument N, by value, and computes the next state from it alone.',
        lines: [22],
      },
      {
        id: 'denom',
        label: 'compensatory density dependence',
        explain:
          'The denominator 1 + Nₜ/M divides the growth factor among more and more individuals as the population grows. It equals 1 at very low density and 2 when Nₜ = M, which is why M is the density that halves the growth factor. In C++ it is (1.0 + N / p.M); the brackets matter.',
        lines: [23],
      },
      {
        id: 'M',
        label: 'scale of density dependence',
        explain:
          'M (individuals) sets how quickly crowding takes effect. Together with R₀ it fixes the equilibrium K = (R₀ − 1) M, which is 48 for the default parameters.',
        lines: [16],
      },
      {
        id: 'start',
        label: 'initial condition',
        explain:
          'The recurrence needs a starting value. N₀ is copied into the state variable before the loop and stored as the first entry of the trajectory.',
        lines: [17, 30, 31],
      },
      {
        id: 'steps',
        label: 'time steps',
        explain:
          'Time advances in whole generations. Each pass of the for loop applies the update rule once, so T passes produce N₁ … N_T and the vector holds T + 1 states.',
        lines: [18, 29, 32],
      },
    ],
  },
};
