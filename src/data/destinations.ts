import type { DomainId, LabId } from './types';

// The four modelling destinations and the
// scientific-inference synthesis. Destination pages are generated from
// this file together with the atlas graph.

export interface Destination {
  id: DomainId;
  landmark: string;
  module: number | null;
  eyebrow: string;
  capability: string;
  intro: string[];
  assemblies: string[];
  lab?: LabId;
  capstones: string[];
}

export const destinations: Destination[] = [
  {
    id: 'algorithms',
    landmark: 'algorithms-landmark',
    module: 14,
    eyebrow: 'Destination',
    capability: 'Translate biological hypotheses and mathematical models into computational procedures.',
    intro: [
      'In algorithm design, programming becomes modelling: a biological hypothesis is written as equations, the equations become a step-by-step procedure, the procedure becomes C++, and the program produces output that can be checked and interpreted.',
      'This destination covers decomposition and pseudocode, debugging and error handling, discrete-time population models, the way update order changes a model, and matrix models of structured populations.',
    ],
    assemblies: ['discrete-time', 'matrix'],
    lab: 'discrete',
    capstones: ['capstone-a', 'capstone-b'],
  },
  {
    id: 'ode',
    landmark: 'ode-landmark',
    module: 15,
    eyebrow: 'Destination',
    capability: 'Implement continuous-time models with numerical methods, and know how accurate the result is.',
    intro: [
      'Most continuous-time models in biology have no closed-form solution, so they are solved numerically. The model, a set of rates of change, is distinct from the numerical method that approximates its solution.',
      'This destination builds Euler and Runge-Kutta integrators behind a common interface, measures their errors against exact solutions, shows when large steps create artefacts, and introduces adaptive step-size control.',
    ],
    assemblies: ['ode'],
    lab: 'ode',
    capstones: ['capstone-c'],
  },
  {
    id: 'stochastic',
    landmark: 'stochastic-landmark',
    module: 16,
    eyebrow: 'Destination',
    capability: 'Implement probabilistic processes and Gillespie simulations, and analyse them across replicates.',
    intro: [
      'In small populations, chance events (who is born, who dies, who infects whom) shape outcomes. A stochastic model describes a distribution of possible histories, and a simulation samples from it.',
      'This destination covers pseudo-random generators and seeds, the C++ random library, weighted choices, Gillespie’s exact algorithm for event-driven processes, and the analysis of replicate ensembles.',
    ],
    assemblies: ['stochastic'],
    lab: 'gillespie',
    capstones: ['capstone-d'],
  },
  {
    id: 'ibm',
    landmark: 'ibm-landmark',
    module: 17,
    eyebrow: 'Destination',
    capability: 'Build systems from individuals, their attributes and interactions, and study the patterns that emerge.',
    intro: [
      'Individual-based models represent each organism explicitly, with its own attributes and local interactions. Population-level patterns, such as clustering or abundance below a mean-field expectation, emerge from the rules rather than being written into them.',
      'This destination covers when to use an IBM, how to represent individuals and their interactions, how scheduling choices change outcomes, and how to validate an IBM against limits where the answer is known.',
    ],
    assemblies: ['ibm'],
    lab: 'ibm',
    capstones: ['capstone-e'],
  },
  {
    id: 'inference',
    landmark: 'inference-landmark',
    module: null,
    eyebrow: 'Synthesis · original to this site',
    capability: 'Design simulation experiments, analyse their output, and draw appropriately qualified scientific conclusions.',
    intro: [
      'A working simulation is only the start of a study. The four destinations converge here: computational experiments with replicates and recorded seeds, analysis of the output in R or Python, verification and validation, and conclusions that state what the model can and cannot support.',
      'This region is an original synthesis of this site.',
    ],
    assemblies: [],
    capstones: ['capstone-f'],
  },
];

export const destinationById = Object.fromEntries(destinations.map((d) => [d.id, d])) as Record<string, Destination>;

/** The research workflow shown on the inference page. */
export const workflow: { title: string; text: string; concept: string }[] = [
  { title: 'Question', text: 'State a biological question that a model can address.', concept: 'experiment-design' },
  { title: 'Model', text: 'Write the hypothesis as equations or rules with explicit assumptions.', concept: 'algorithm-design' },
  { title: 'Algorithm', text: 'Turn the model into a procedure: state, update, loop, output.', concept: 'discrete-time' },
  { title: 'Implementation', text: 'Write clear, tested C++ with recorded parameters and seeds.', concept: 'testing-reproducibility' },
  { title: 'Verification', text: 'Check the code against exact results, invariants and convergence.', concept: 'verification' },
  { title: 'Experiment', text: 'Choose factors, levels, replicates and seeds.', concept: 'experiment-design' },
  { title: 'Output', text: 'Write tidy data with the metadata needed to reproduce it.', concept: 'seed-management' },
  { title: 'Analysis', text: 'Summarise replicates and quantify uncertainty in R or Python.', concept: 'uncertainty' },
  { title: 'Sensitivity', text: 'Find which parameters drive the outcome.', concept: 'sensitivity' },
  { title: 'Validation', text: 'Confront the model with data and alternatives.', concept: 'validation' },
  { title: 'Conclusion', text: 'State what the model supports, under which assumptions, and what it cannot.', concept: 'interpretation' },
];
