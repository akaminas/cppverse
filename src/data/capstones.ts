// Original capstone projects. They are independent of the Groningen
// manual's assignments and projects and come without solutions: each
// states a question, a model, milestones, verification criteria and
// deliverables, so learners can check their own work.

export interface Capstone {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'seasoned';
  question: string;
  context: string;
  model: string[];
  /** TeX equations. */
  equations: string[];
  milestones: { title: string; text: string }[];
  verification: string[];
  deliverables: string[];
  extensions: string[];
}

export const capstones: Record<string, Capstone> = {
  'capstone-a': {
    id: 'capstone-a',
    title: 'A first ecological model: harvesting a fish stock',
    level: 'beginner',
    question: 'How large an annual catch can a population sustain before it collapses, and how does the timing of the harvest matter?',
    context:
      'A fish stock with compensatory density dependence is harvested once a year. Managers choose either a fixed quota (a constant number of fish) or a fixed effort (a constant fraction of the stock). You will build a complete procedural simulation and compare the two policies.',
    model: [
      'Reproduction follows a Beverton-Holt recurrence; the harvest is removed after reproduction.',
      'A fixed quota removes min(Q, N) fish; a fixed effort removes a fraction E of the stock.',
      'The stock is declared collapsed when it falls below one fish.',
    ],
    equations: ['N_{t+1}^{\\text{pre}} = \\frac{R_0 N_t}{1 + N_t/M}', 'N_{t+1} = N_{t+1}^{\\text{pre}} - \\min(Q,\\,N_{t+1}^{\\text{pre}}) \\quad\\text{or}\\quad N_{t+1} = (1 - E)\\,N_{t+1}^{\\text{pre}}'],
    milestones: [
      { title: 'Parameters and state', text: 'Define a parameter struct (R₀, M, N₀, policy, Q or E, years) and validate it.' },
      { title: 'Update rule', text: 'Write one function for reproduction and one for the harvest; test each against a hand calculation.' },
      { title: 'Simulation loop', text: 'Run for a given number of years, store the trajectory and the catch, and stop early on collapse.' },
      { title: 'Output', text: 'Write year, stock and catch to a CSV file with a metadata header.' },
      { title: 'Policy comparison', text: 'For a range of quotas and of efforts, record the long-run catch and whether the stock collapses.' },
    ],
    verification: [
      'With Q = 0 (or E = 0) the trajectory equals the unharvested Beverton-Holt model, which has a closed-form solution.',
      'For fixed effort, the harvested model is again Beverton-Holt with a reduced R₀; check that your equilibrium matches (R₀(1 − E) − 1) M.',
      'Catch never exceeds the stock available, and the stock is never negative.',
    ],
    deliverables: ['The C++ program and its parameter file', 'One CSV per policy setting', 'A one-page interpretation with a figure of long-run catch against quota and effort'],
    extensions: ['Harvest before reproduction instead of after, and explain the difference.', 'Add a minimum stock below which fishing stops.'],
  },
  'capstone-b': {
    id: 'capstone-b',
    title: 'Matrix population dynamics: which life stage should a conservation plan target?',
    level: 'intermediate',
    question: 'For a declining stage-structured population, which intervention raises the long-run growth rate λ the most?',
    context:
      'A turtle-like species has eggs and hatchlings, juveniles, subadults and breeding adults. Conservation could protect nests (raising hatchling survival), reduce juvenile mortality (for example with bycatch-reduction devices), or protect adults. Each intervention changes different matrix entries.',
    model: [
      'A four-stage stage-classified matrix with stasis (individuals staying in a stage) and growth to the next stage.',
      'Breeding adults produce eggs; only a fraction of eggs survive their first year.',
      'Interventions multiply the survival of one stage by a factor.',
    ],
    equations: ['\\mathbf n_{t+1} = A\\,\\mathbf n_t', 'A\\mathbf w = \\lambda \\mathbf w'],
    milestones: [
      { title: 'Life-cycle graph', text: 'Draw the life cycle and derive each matrix entry from stage survival and the probability of growing out of the stage.' },
      { title: 'Projection and λ', text: 'Implement matrix-vector multiplication and power iteration with a convergence test and an iteration cap.' },
      { title: 'Interventions', text: 'For each intervention and a range of improvement factors, compute λ and the stable stage structure.' },
      { title: 'Sensitivity', text: 'Compute numerical elasticities of λ to each matrix entry and compare them with the interventions.' },
    ],
    verification: [
      'λ equals the dominant root of the characteristic polynomial (check with a short independent calculation).',
      'A w = λ w holds for the computed structure, and long projections grow by λ per year.',
      'Elasticities sum to one.',
    ],
    deliverables: ['The C++ program', 'A table of λ for each intervention', 'A figure of λ against improvement factor, one line per intervention', 'A short management recommendation stating its assumptions'],
    extensions: ['Add density dependence in egg survival and compare equilibrium sizes.', 'Add year-to-year variation in survival and estimate the stochastic growth rate.'],
  },
  'capstone-c': {
    id: 'capstone-c',
    title: 'Numerical ODE modelling: a virus within its host',
    level: 'intermediate',
    question: 'How do the peak and timing of a viral infection depend on the infection rate, and how small must the integration step be for those answers to be trustworthy?',
    context:
      'The target-cell-limited model describes uninfected cells, infected cells and free virus during an acute infection. It has no closed-form solution, so numerical accuracy must be established by other means.',
    model: ['Uninfected target cells T are infected by virus V at rate βTV.', 'Infected cells I die at rate δ and produce virus at rate p; free virus is cleared at rate c.'],
    equations: ['\\dot T = -\\beta T V, \\qquad \\dot I = \\beta T V - \\delta I, \\qquad \\dot V = pI - cV'],
    milestones: [
      { title: 'Right-hand side', text: 'Implement the model as a function of (t, state) independent of any integrator.' },
      { title: 'Integrators', text: 'Implement Euler and RK4 with a common stepper interface; integrate to a fixed end time.' },
      { title: 'Convergence', text: 'Without an exact solution, estimate the error of each method by comparing with a run at a much smaller step; plot error against step size on log-log axes.' },
      { title: 'Experiment', text: 'Vary β over a range and record the peak viral load and its timing.' },
    ],
    verification: [
      'Observed convergence orders close to 1 (Euler) and 4 (RK4).',
      'A conserved quantity: T + I is non-increasing, and T never becomes negative for accurate steps.',
      'The basic reproduction number R₀ = βpT₀/(δc) predicts whether the infection grows initially; check both sides of R₀ = 1.',
    ],
    deliverables: ['The C++ program', 'A convergence figure', 'A figure of peak viral load and time to peak against β', 'An interpretation that separates model results from numerical artefacts'],
    extensions: ['Add an adaptive step-size controller and compare its cost with fixed steps.', 'Add an eclipse phase and compare dynamics.'],
  },
  'capstone-d': {
    id: 'capstone-d',
    title: 'Stochastic biological simulation: extinction risk of a reintroduced population',
    level: 'intermediate',
    question: 'How many individuals must be released for a reintroduced population to have at least a 95 % chance of persisting ten years?',
    context:
      'A small founding population grows logistically on average, but births and deaths are chance events. Releasing more individuals costs more; releasing too few risks early extinction. You will estimate extinction probabilities with uncertainty.',
    model: [
      'Births at rate bN; deaths at rate N(d + κN), where κ represents crowding.',
      'The deterministic limit is logistic growth with r = b − d and K = (b − d)/κ.',
    ],
    equations: ['N \\xrightarrow{\\,bN\\,} N+1, \\qquad N \\xrightarrow{\\,N(d + \\kappa N)\\,} N-1'],
    milestones: [
      { title: 'Gillespie simulation', text: 'Implement the direct method with explicit handling of zero total propensity and of the end time.' },
      { title: 'Replicates', text: 'Run many replicates per release size with recorded seeds; estimate P(extinct by 10 years) and its standard error.' },
      { title: 'Release-size curve', text: 'Plot extinction probability against the number released, with uncertainty, and find the 95 % persistence threshold.' },
      { title: 'Deterministic comparison', text: 'Compare the replicate mean with the logistic solution and explain the difference.' },
    ],
    verification: [
      'With κ = 0 the process is a linear birth-death process: compare the extinction fraction with Kendall’s exact formula.',
      'Mean waiting times match 1/a₀ in a test with fixed state.',
      'Results are reproducible from the recorded seeds.',
    ],
    deliverables: ['The C++ program', 'A tidy CSV of replicate outcomes', 'A figure of extinction probability against release size with standard errors', 'A recommendation with its uncertainty and assumptions'],
    extensions: ['Add environmental catastrophes as an extra event.', 'Compare one large release with two smaller releases a year apart.'],
  },
  'capstone-e': {
    id: 'capstone-e',
    title: 'Individual-based modelling: foragers depleting a patchy resource',
    level: 'seasoned',
    question: 'Does moving towards richer patches help foragers when many others do the same?',
    context:
      'Individuals move on a grid of resource patches that regrow logistically. Each forager consumes resource where it stands and decides whether to move. Population-level intake and the distribution of individuals across patches emerge from these decisions.',
    model: [
      'Each forager has a position, an energy reserve and a movement rule (random walk or move to the best neighbouring patch).',
      'Resource on each patch regrows logistically and is depleted by foragers present.',
      'Foragers reproduce above an energy threshold and die below zero.',
    ],
    equations: ['R_{i,t+1} = R_{i,t} + gR_{i,t}(1 - R_{i,t}/R_{\\max}) - \\text{consumption}_{i,t}'],
    milestones: [
      { title: 'Individuals and patches', text: 'Represent foragers as objects in a vector and patches as a grid; construct both in valid states.' },
      { title: 'Rules', text: 'Implement consumption, regrowth, movement, reproduction and death as separate, tested functions.' },
      { title: 'Schedule', text: 'Implement synchronous and random-order updating and document which one you use as the default and why.' },
      { title: 'Experiment', text: 'Compare the two movement rules across replicates: mean intake, population size and spatial clustering.' },
    ],
    verification: [
      'With movement switched off and one forager per patch, intake follows from the regrowth equation alone.',
      'Total resource never becomes negative; energy bookkeeping balances each step.',
      'Results are robust to the scheduling choice, or the dependence is reported.',
    ],
    deliverables: ['The C++ program', 'Replicate summaries as tidy CSV', 'Figures of intake and population size for both movement rules', 'An interpretation of the emergent pattern and its limits'],
    extensions: ['Add individual variation in movement tendency and let it be inherited.', 'Replace time steps with event-driven scheduling.'],
  },
  'capstone-f': {
    id: 'capstone-f',
    title: 'A complete computational study: does dispersal distance change persistence?',
    level: 'seasoned',
    question: 'In a spatially structured population, how does mean dispersal distance affect equilibrium abundance and extinction risk, and why?',
    context:
      'This capstone asks you to carry a question through the whole workflow: model, algorithm, implementation, verification, experimental design, replicates, analysis, visualisation and a qualified conclusion. Build on the plant model of the individual-based laboratory or design your own.',
    model: ['Individuals on a torus with local competition and Gaussian seed dispersal (as in the laboratory) or a model of your own design with the same ingredients.'],
    equations: ['P(\\text{survive}) = \\frac{s_0}{1 + c\\,n_i}'],
    milestones: [
      { title: 'Question and hypotheses', text: 'State the question and competing hypotheses before running anything.' },
      { title: 'Verification', text: 'Show that the implementation agrees with its mean-field limit and that results do not depend on numerical or scheduling details you did not intend.' },
      { title: 'Design', text: 'Choose dispersal levels, replicates per level and seeds; justify the number of replicates from a pilot run.' },
      { title: 'Runs and data', text: 'Write tidy output with full metadata; keep raw data and analysis separate.' },
      { title: 'Analysis', text: 'Summarise in R or Python: abundance and extinction against dispersal, with uncertainty, as Vellum figures.' },
      { title: 'Sensitivity', text: 'Repeat the key comparison for at least two other parameter settings.' },
      { title: 'Conclusion', text: 'Write a conclusion that states what is supported, under which assumptions, and what cannot be inferred.' },
    ],
    verification: ['Mean-field agreement in the global-interaction limit', 'Reproducibility from recorded seeds and version', 'Monte Carlo uncertainty small relative to the effects reported'],
    deliverables: ['Code under version control with a tagged release', 'Raw output and an analysis script', 'Two to four figures', 'A two-page report structured as question, model, methods, results and limitations'],
    extensions: ['Add environmental heterogeneity among patches.', 'Compare with a pair-approximation model of the same system.'],
  },
};
