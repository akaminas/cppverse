import type { Goal } from './types.ts';

// Learning goals offered during onboarding and on the Destinations page, grouped by the
// destination they lead to.
// A goal's route is the dependency closure of its targets, ordered
// topologically (see src/lib/graph/routes.ts).

export const goals: Goal[] = [
  {
    id: 'first-program',
    group: 'foundations',
    title: 'Write my first C++ program',
    summary: 'Install a compiler, build a program and understand every line of it.',
    targets: ['program-anatomy', 'console-output', 'compiler-diagnostics'],
  },
  {
    id: 'discrete-model',
    group: 'algorithms',
    title: 'Build a discrete-time population model',
    summary: 'From a biological hypothesis to a simulated, recorded and interpreted trajectory.',
    targets: ['discrete-time', 'trajectory-output', 'interpretation'],
  },
  {
    id: 'matrix-model',
    group: 'algorithms',
    title: 'Analyse a matrix population model',
    summary: 'Project a stage-structured population and compute its growth rate.',
    targets: ['power-iteration'],
  },
  {
    id: 'ode-solvers',
    group: 'ode',
    title: 'Understand numerical ODE solvers',
    summary: 'Euler and Runge-Kutta methods, their errors and their limits.',
    targets: ['runge-kutta', 'numerical-error', 'numerical-stability'],
  },
  {
    id: 'stochastic-model',
    group: 'stochastic',
    title: 'Implement a stochastic model',
    summary: 'Random generators, distributions and weighted choices in a simulation.',
    targets: ['random-library', 'weighted-lottery'],
  },
  {
    id: 'gillespie',
    group: 'stochastic',
    title: 'Learn Gillespie simulation',
    summary: 'Exact event-driven simulation and the analysis of replicates.',
    targets: ['gillespie', 'replicates'],
  },
  {
    id: 'ibm',
    group: 'ibm',
    title: 'Develop individual-based simulations',
    summary: 'Individuals, interactions, schedules and emergent patterns.',
    targets: ['emergence', 'ibm-validation'],
  },
  {
    id: 'analyse-output',
    group: 'inference',
    title: 'Analyse simulation output',
    summary: 'Design experiments, export data and summarise uncertainty in R or Python.',
    targets: ['output-analysis', 'uncertainty', 'interpretation'],
  },
  {
    id: 'reproducible-software',
    group: 'foundations',
    title: 'Build reproducible C++ modelling software',
    summary: 'Multiple files, tests, seeds and metadata for software others can rerun.',
    targets: ['testing-reproducibility', 'seed-management', 'exceptions'],
  },
];

export const goalById = Object.fromEntries(goals.map((g) => [g.id, g]));
