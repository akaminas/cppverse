import type { MathCode } from './types';

export const mathcode: Record<string, MathCode> = {
  'nested-vectors-product': {
    title: 'One year of a stage-structured model: n(t+1) = A n(t)',
    file: 'data/matrix_stage_product.cpp',
    show: [11, 32],
    tex: String.raw`\htmlClass{mc-next}{n_i(t+1)} = \htmlClass{mc-sum}{\sum_{j=1}^{3}} \htmlClass{mc-a}{a_{ij}}\, \htmlClass{mc-now}{n_j(t)}, \qquad \htmlClass{mc-rows}{i = 1, 2, 3}`,
    terms: [
      {
        id: 'next',
        label: 'new state',
        explain:
          'The number of individuals in stage i next year. The code collects all three new values in a separate vector, next, which starts at zero and replaces n only when it is complete, so every term on the right uses the state of year t.',
        lines: [22, 28],
      },
      {
        id: 'rows',
        label: 'one equation per stage',
        explain:
          'There is one such sum for every stage i. The outer loop runs over the rows of A. The mathematics counts stages from 1; the code counts from 0, so stage i of the equation is index i − 1 in the vector.',
        lines: [23],
      },
      {
        id: 'sum',
        label: 'sum over source stages',
        explain:
          'The sum over j adds the contributions of every stage this year. The inner loop runs over j and accumulates into next[i] with +=.',
        lines: [24, 25],
      },
      {
        id: 'a',
        label: 'projection matrix entry',
        explain:
          'a_ij is the number of stage-i individuals next year per stage-j individual this year: a fecundity in the first row, a survival or transition probability elsewhere. In the code it is A[i][j]: row i, column j.',
        lines: [13, 14, 15, 16, 17, 25],
      },
      {
        id: 'now',
        label: 'current state',
        explain: 'n_j(t) is the number in stage j this year, the element n[j] of the population vector.',
        lines: [18, 25],
      },
    ],
  },
};
