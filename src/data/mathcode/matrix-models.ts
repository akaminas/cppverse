import type { MathCode } from './types';

// Synchronised views of cpp-examples/algorithms/stage_matrix.cpp (line
// numbers include the header comment).
export const mathcode: Record<string, MathCode> = {
  'matrix-models-multiply': {
    title: 'One year of projection: matrix times vector',
    tex: String.raw`\htmlClass{mc-new}{n_i(t+1)} = \htmlClass{mc-sum}{\sum_{j=1}^{k}} \htmlClass{mc-aij}{a_{ij}}\, \htmlClass{mc-nj}{n_j(t)}, \qquad \htmlClass{mc-rows}{i = 1, \dots, k}`,
    file: 'algorithms/stage_matrix.cpp',
    show: [36, 46],
    terms: [
      {
        id: 'new',
        label: 'the new stage vector',
        explain:
          'The densities of year t + 1 are written into a fresh vector y, filled with zeros. The old vector x is only read, so every stage is updated from the same year-t state.',
        lines: [39, 45],
      },
      {
        id: 'rows',
        label: 'one equation per stage',
        explain: 'The outer loop visits each stage i of next year: seedlings, vegetative rosettes, flowering plants.',
        lines: [40],
      },
      {
        id: 'sum',
        label: 'contributions from every stage',
        explain: 'The inner loop adds up what each stage j of this year contributes to stage i next year.',
        lines: [41],
      },
      {
        id: 'aij',
        label: 'transition or fecundity rate',
        explain:
          'aᵢⱼ is the number of stage-i individuals next year per stage-j individual this year: a survival-and-transition probability or a fecundity. It is read from row i, column j of the matrix.',
        lines: [42],
      },
      {
        id: 'nj',
        label: 'this year’s density in stage j',
        explain: 'nⱼ(t) is read from the old vector x; it is multiplied by aᵢⱼ and accumulated into y[i].',
        lines: [42],
      },
    ],
  },

  'matrix-models-power': {
    title: 'The power method with renormalisation',
    tex: String.raw`\htmlClass{mc-init}{\mathbf n = \tfrac{1}{k}(1,\dots,1)}; \quad \text{repeat: } \htmlClass{mc-v}{\mathbf v = A\,\mathbf n}, \quad \htmlClass{mc-lam}{\lambda = \textstyle\sum_i v_i}, \quad \htmlClass{mc-norm}{\mathbf n \leftarrow \mathbf v/\lambda} \quad \text{until } \htmlClass{mc-delta}{\lVert \mathbf v/\lambda - \mathbf n \rVert < \varepsilon} \text{ or } \htmlClass{mc-cap}{\text{the iteration cap is reached}}`,
    file: 'algorithms/stage_matrix.cpp',
    show: [60, 77],
    terms: [
      {
        id: 'init',
        label: 'starting vector',
        explain: 'Any non-negative, non-zero start works for this matrix; equal shares 1/k in every stage are a neutral choice.',
        lines: [63],
      },
      {
        id: 'v',
        label: 'one projection step',
        explain: 'The current normalised vector is projected one year forward into a temporary vector v.',
        lines: [65],
      },
      {
        id: 'lam',
        label: 'the growth-rate estimate',
        explain:
          'Because n sums to 1, the total of v is the factor by which the population grew in this step. Once the structure has converged it equals the dominant eigenvalue λ. A total of zero means the population died out, and the function throws.',
        lines: [66, 67],
      },
      {
        id: 'norm',
        label: 'renormalisation',
        explain:
          'Dividing by λ rescales v to sum 1. The numbers then never grow towards overflow nor shrink towards underflow, however many steps are taken.',
        lines: [70, 73],
      },
      {
        id: 'delta',
        label: 'convergence test',
        explain:
          'The squared Euclidean distance between successive normalised vectors is accumulated and compared with ε², which avoids a square root. ε is the tolerance argument, 10⁻¹⁰ by default.',
        lines: [68, 71, 74],
      },
      {
        id: 'cap',
        label: 'iteration cap',
        explain:
          'A loop that waits for convergence must not run for ever. After maxIterations steps without convergence the function throws std::runtime_error instead of returning an unconverged answer.',
        lines: [64, 76],
      },
    ],
  },
};
