import type { MathCode } from './types';

export const mathcode: Record<string, MathCode> = {
  'operator-overloading-heun': {
    title: 'One step of Heun’s method, written with state arithmetic',
    file: 'architecture/operator_predator_prey.cpp',
    show: [10, 58],
    tex: String.raw`\htmlClass{mc-update}{\mathbf{s}_{t+h} = \mathbf{s}_t + \tfrac{h}{2}\big[} \htmlClass{mc-k1}{\mathbf{f}(\mathbf{s}_t)} + \htmlClass{mc-k2}{\mathbf{f}\big(\mathbf{s}_t + h\,\mathbf{f}(\mathbf{s}_t)\big)} \htmlClass{mc-update2}{\big]}, \qquad \htmlClass{mc-rhs}{\mathbf{f}(N, P) = \begin{pmatrix} rN - aNP \\ e\,aNP - mP \end{pmatrix}}`,
    terms: [
      {
        id: 'rhs',
        label: 'right-hand side f',
        explain:
          'The Lotka-Volterra model: prey N grow at rate r and are eaten at rate aNP; predators P convert eaten prey with efficiency e and die at rate m. rates() returns both derivatives as one State, so the vector f(s) is a single C++ value.',
        lines: [42, 43, 44, 45],
      },
      {
        id: 'k1',
        label: 'slope at the start, k₁',
        explain: 'The slope of the trajectory at the current state. One call, one State.',
        lines: [54],
      },
      {
        id: 'k2',
        label: 'slope at the Euler guess, k₂',
        explain:
          'The slope at the point a plain Euler step would reach. h * k1 uses the non-member operator*(double, const State&); s + h * k1 uses operator+, which copies s and adds with +=.',
        lines: [55, 21, 22, 23, 26, 27],
      },
      {
        id: 'update',
        label: 'the update s += (h/2)(k₁ + k₂)',
        explain:
          'Average the two slopes and take the step. k1 + k2 calls operator+, (h / 2.0) * … calls the scalar operator*, and s += … calls the member operator+=, which changes s in place and returns it by reference.',
        lines: [56, 14, 15, 16, 17],
      },
      {
        id: 'update2',
        label: 'closing the average',
        explain: 'The bracket closes the average of the two slopes; the whole bracket is the argument of the scalar multiplication on line 56.',
        lines: [56],
      },
    ],
  },
};
