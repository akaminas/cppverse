import type { DomainId, LabId } from './types';

// Scientific documentation of each laboratory. Rendered on the server next
// to the interactive island (src/components/labs/Lab.astro). Every model
// here is implemented in src/lib/simulations and tested in src/tests; the
// C++ programs are compiled and cross-validated in CI.

export interface LabParameter {
  symbol: string;
  meaning: string;
  unit: string;
  value: string;
}

export interface LabDoc {
  id: LabId;
  title: string;
  domain: DomainId;
  summary: string;
  /** Display equations (TeX). */
  equations: string[];
  modelNote: string;
  parameters: LabParameter[];
  initial: string;
  assumptions: string[];
  algorithm: string[];
  cpp: string[];
  verification: string[];
  interpretation: { question: string; answer: string }[];
  limitations: string[];
}

export const labDocs: Record<LabId, LabDoc> = {
  discrete: {
    id: 'discrete',
    title: 'Laboratory 1 · Discrete-time population dynamics',
    domain: 'algorithms',
    summary: 'Populations censused once per generation: compensatory growth, overcompensation and the consequences of update order.',
    equations: [
      'N_{t+1} = \\frac{R_0\\,N_t}{1 + N_t/M}',
      'x_{t+1} = r\\,x_t\\,(1 - x_t)',
      'H_{t+1} = H_t\\,e^{\\,r(1 - H_t/K) - aP_t}, \\qquad P_{t+1} = c\\,H_t\\,\\bigl(1 - e^{-aP_t}\\bigr)',
    ],
    modelNote:
      'These are discrete-time models in their own right: the census is taken once per generation and the recurrence is the model. They are not numerical approximations of differential equations.',
    parameters: [
      { symbol: 'R_0', meaning: 'Beverton-Holt growth factor at low density', unit: 'per generation', value: '2.2 (0.5-6)' },
      { symbol: 'M', meaning: 'density at which the growth factor is halved', unit: 'individuals', value: '40' },
      { symbol: 'r', meaning: 'logistic-map growth factor', unit: 'per generation', value: '3.2 (0.5-4)' },
      { symbol: 'r, K, a, c', meaning: 'host growth rate, host carrying capacity, parasitoid search efficiency, parasitoids per host attacked', unit: '—, hosts, per parasitoid, —', value: '1.2, 80, 0.06, 0.8' },
    ],
    initial: 'Beverton-Holt: N₀ = 5. Logistic map: x₀ = 0.2. Host-parasitoid: H₀ = 20, P₀ = 2.',
    assumptions: [
      'Non-overlapping generations and a single census per generation.',
      'Density dependence acts through the current census only (no time lags beyond one generation).',
      'Deterministic dynamics: no demographic or environmental stochasticity; densities are continuous.',
      'Host-parasitoid: random search by parasitoids (Poisson-distributed attacks) and host self-limitation.',
    ],
    algorithm: [
      'Set the parameters and the initial state.',
      'For t = 0, 1, …, T − 1: compute every component of the next state from the current state only, then replace the state.',
      'Store every state in a vector so that the trajectory can be plotted and checked.',
      'Verify: compare Beverton-Holt with its closed-form solution N_t = K N₀ / (N₀ + (K − N₀) R₀^{−t}).',
    ],
    cpp: ['algorithms/beverton_holt.cpp', 'algorithms/host_parasitoid.cpp'],
    verification: [
      'Beverton-Holt matches its closed-form solution to rounding error (unit tests and CI cross-validation).',
      'The logistic map reaches its fixed point 1 − 1/r for 1 < r < 3 and a two-cycle at r = 3.2 (unit tests).',
      'Both update orders of the host-parasitoid model leave the fixed point unchanged; the sequential bug converges to it while the correct model cycles (unit tests and CI).',
      'The C++ programs reproduce the browser trajectories to a relative tolerance of 10⁻⁸ (CI).',
    ],
    interpretation: [
      { question: 'What pattern occurs?', answer: 'Beverton-Holt populations approach K = (R₀ − 1) M monotonically; the logistic map can settle, cycle or behave chaotically; the host-parasitoid model cycles.' },
      { question: 'Which assumptions generate it?', answer: 'Compensatory density dependence (Beverton-Holt) cannot overshoot; overcompensation (the logistic map) can. Delayed parasitoid feedback drives cycles.' },
      { question: 'Does the implementation affect it?', answer: 'Yes: updating hosts before parasitoids stabilises the host-parasitoid system, a qualitative error that looks like a plausible result.' },
      { question: 'What cannot be inferred?', answer: 'Deterministic recurrences say nothing about extinction risk from chance events in small populations; that needs a stochastic model.' },
    ],
    limitations: [
      'No stochasticity, age or stage structure, or spatial structure.',
      'Chaotic trajectories depend sensitively on initial conditions and on floating-point rounding over long runs; interpret their statistics, not individual values.',
    ],
  },

  matrix: {
    id: 'matrix',
    title: 'Laboratory 2 · Matrix population models',
    domain: 'algorithms',
    summary: 'A three-stage perennial plant projected by a matrix; growth rate and stable structure from the power method.',
    equations: [
      '\\mathbf n_{t+1} = A\\,\\mathbf n_t, \\qquad A = \\begin{pmatrix} 0 & 0 & F \\\\ g & s_V & r_F \\\\ 0 & f_V & s_F \\end{pmatrix}',
      '\\mathbf v = A\\,\\mathbf n_t, \\quad \\lambda_t = \\textstyle\\sum_i v_i, \\quad \\mathbf n_{t+1} = \\mathbf v / \\lambda_t',
    ],
    modelNote: 'Column j of A says what one individual in stage j contributes to each stage one year later. λ is the dominant eigenvalue of A and the stable stage structure its eigenvector.',
    parameters: [
      { symbol: 'F', meaning: 'seedlings produced per flowering plant', unit: 'per year', value: '4.5' },
      { symbol: 'g', meaning: 'seedlings that survive to become vegetative rosettes', unit: 'probability', value: '0.12' },
      { symbol: 's_V', meaning: 'rosettes that survive and stay vegetative', unit: 'probability', value: '0.5' },
      { symbol: 'f_V', meaning: 'rosettes that survive and flower', unit: 'probability', value: '0.25' },
      { symbol: 'r_F', meaning: 'flowering plants that survive and revert to rosettes', unit: 'probability', value: '0.35' },
      { symbol: 's_F', meaning: 'flowering plants that survive and flower again', unit: 'probability', value: '0.4' },
    ],
    initial: 'n₀ = (100 seedlings, 20 rosettes, 5 flowering plants); editable.',
    assumptions: [
      'A birth-pulse census once a year; individuals in a stage are identical.',
      'Constant vital rates: no density dependence and no environmental variation, so growth is geometric in the long run.',
      'Survival out of each stage cannot exceed 1 (the laboratory flags violations).',
    ],
    algorithm: [
      'Build A from the life-history transitions and check that probabilities out of each stage sum to at most 1.',
      'Projection: n(t + 1) = A n(t), computed into a new vector (a simultaneous update).',
      'Power method: start from a uniform vector, multiply by A, take λ as the total, divide by λ, and repeat until the change is below the tolerance; stop with an error after a maximum number of iterations.',
    ],
    cpp: ['algorithms/stage_matrix.cpp'],
    verification: [
      'λ from the power method equals the largest root of the characteristic polynomial det(λI − A) (unit test).',
      'A w = λ w for the computed stable structure, and long projections grow by λ per year (unit tests).',
      'The C++ program reproduces λ, the stable structure and the projection (CI cross-validation).',
    ],
    interpretation: [
      { question: 'What pattern occurs?', answer: 'After a transient, every stage grows or declines by the same factor λ each year and the stage proportions stop changing.' },
      { question: 'How does it depend on parameters?', answer: 'Increasing fecundity or any survival raises λ, but by very different amounts; sensitivity and elasticity analysis quantify this.' },
      { question: 'What claim is supported?', answer: 'Under constant conditions the population would grow (λ > 1) or decline (λ < 1) at the computed rate.' },
      { question: 'What cannot be inferred?', answer: 'Future abundance in a real, density-regulated and variable environment: λ is a measure of current conditions, not a forecast.' },
    ],
    limitations: ['No density dependence, stochasticity or individual variation within stages.', 'Transient dynamics can dominate for decades when the initial structure is far from the stable one.'],
  },

  ode: {
    id: 'ode',
    title: 'Laboratory 3 · Numerical integration of ODEs',
    domain: 'ode',
    summary: 'Euler, Heun and RK4 on models with exact solutions or exact invariants: accuracy, order of convergence and stability.',
    equations: [
      '\\frac{dN}{dt} = rN\\left(1 - \\frac{N}{K}\\right), \\qquad \\frac{dC}{dt} = -kC',
      '\\frac{dS}{dt} = -\\beta SI, \\quad \\frac{dI}{dt} = \\beta SI - \\gamma I, \\quad \\frac{dR}{dt} = \\gamma I',
      'x_{n+1} = x_n + h\\,f(t_n, x_n) \\quad\\text{(Euler)}',
    ],
    modelNote:
      'The biological model is the right-hand side f(t, x). The numerical method only approximates its solution: changing h or the method changes the approximation, never the model.',
    parameters: [
      { symbol: 'r, K', meaning: 'logistic growth rate and carrying capacity', unit: 'per day, individuals', value: '0.8, 100' },
      { symbol: 'k', meaning: 'first-order elimination rate', unit: 'per hour', value: '0.5' },
      { symbol: 'β, γ', meaning: 'transmission and recovery rates', unit: 'per day', value: '0.5, 0.2' },
      { symbol: 'h', meaning: 'integration step size', unit: 'time units', value: '0.5 (0.01-6)' },
    ],
    initial: 'N(0) = 2; C(0) = 10 mg/L; (S, I, R)(0) = (0.999, 0.001, 0).',
    assumptions: [
      'Continuous time and continuous, well-mixed state variables.',
      'Logistic: constant per-capita growth rate declining linearly with density. Elimination: constant clearance. SIR: mass action, no births, deaths or waning immunity.',
    ],
    algorithm: [
      'Write the model as a function f(t, x) returning all derivatives.',
      'A stepper advances (t, x) by h: Euler uses one slope, Heun two, RK4 four; all components are updated simultaneously.',
      'Repeat steps until the end time, shortening the last step so that the run ends exactly there.',
      'Measure the error against the exact solution (logistic, elimination) or an exact invariant (S + I + R = 1 and the final-size relation).',
    ],
    cpp: ['ode/logistic_integrators.cpp', 'ode/sir_rk4.cpp'],
    verification: [
      'Observed orders of convergence are 1, 2 and 4 for Euler, Heun and RK4 (unit tests and CI).',
      'Euler on elimination is monotone for h < 1/k, oscillates for 1/k < h < 2/k and diverges for h > 2/k, as theory predicts (unit tests).',
      'RK4 conserves S + I + R to rounding error and reaches the final size predicted by ln(S∞/S₀) = R₀(S∞ − 1) (unit tests and CI).',
      'The C++ integrators reproduce the browser results to a relative tolerance of 10⁻¹⁰ (CI).',
    ],
    interpretation: [
      { question: 'Does numerical approximation affect the result?', answer: 'With a large step, Euler underestimates logistic growth and can invent oscillations or blow up for elimination: these are artefacts of the method, not biology.' },
      { question: 'How do we know an integration is good enough?', answer: 'Halve h and check that the answer changes by less than the precision you need, or compare with exact solutions and invariants.' },
      { question: 'What cannot be inferred?', answer: 'An accurate integration of a model says nothing about whether the model itself describes the biological system.' },
    ],
    limitations: ['Fixed-step explicit methods are unsuitable for stiff systems; adaptive and implicit methods exist for those cases.', 'Deterministic ODEs ignore demographic noise, which matters in small populations.'],
  },

  gillespie: {
    id: 'gillespie',
    title: 'Laboratory 4 · Gillespie simulation',
    domain: 'stochastic',
    summary: 'Exact stochastic simulation of event-driven processes, with replicate ensembles compared against exact and deterministic results.',
    equations: [
      'a_0(\\mathbf x) = \\sum_j a_j(\\mathbf x), \\qquad \\tau \\sim \\mathrm{Exponential}(a_0), \\qquad P(\\text{event } j) = \\frac{a_j(\\mathbf x)}{a_0(\\mathbf x)}',
      '\\text{birth: } a = bN,\\ \\ \\text{death: } a = dN; \\qquad \\text{infection: } a = \\beta SI/N,\\ \\ \\text{recovery: } a = \\gamma I',
    ],
    modelNote:
      'The direct method samples the continuous-time Markov chain exactly: there is no time step. When the total propensity a₀ is zero no event can ever occur again (an absorbing state such as extinction) and the run stops.',
    parameters: [
      { symbol: 'b, d', meaning: 'per-capita birth and death rates', unit: 'per unit time', value: '1, 0.8' },
      { symbol: 'β, γ', meaning: 'transmission and recovery rates', unit: 'per day', value: '0.5, 0.2' },
      { symbol: 'N', meaning: 'population size (SIR)', unit: 'individuals', value: '200' },
      { symbol: 'seed', meaning: 'seed of the pseudo-random generator', unit: '—', value: '2024' },
    ],
    initial: 'Birth-death: N₀ = 5 individuals. SIR: I₀ = 3 infectious, the rest susceptible.',
    assumptions: [
      'Events happen one at a time, at rates that depend only on the current state (Markov property).',
      'Individuals are identical and, in SIR, mix homogeneously.',
      'Waiting times are exponential; rates are constant between events.',
    ],
    algorithm: [
      'Compute every propensity aⱼ and their total a₀ from the current state.',
      'If a₀ = 0, stop: the process is absorbed.',
      'Draw τ ~ Exponential(a₀). If t + τ exceeds the end time, stop: the state persists until the end.',
      'Choose event j with probability aⱼ/a₀ (a weighted lottery), set t ← t + τ and apply the event’s change.',
      'Repeat; run many replicates with recorded seeds and summarise across them.',
    ],
    cpp: ['stochastic/birth_death_gillespie.cpp'],
    verification: [
      'Replicate means and extinction fractions agree with E[N(t)] = N₀e^{(b−d)t} and Kendall’s extinction probability within 4 standard errors (unit tests and CI).',
      'Single-event waiting times have mean 1/a₀ (unit test).',
      'Large-population SIR major outbreaks reach the deterministic final size (unit test).',
    ],
    interpretation: [
      { question: 'Why do runs differ?', answer: 'Each run is one possible history of the same process; the model is the distribution of histories, so one run is a sample of size one.' },
      { question: 'What claim is supported?', answer: 'Probabilities and distributions, e.g. the chance of extinction by time t, with Monte Carlo uncertainty from the number of replicates.' },
      { question: 'How does it relate to the deterministic model?', answer: 'For the linear birth-death process the mean equals the deterministic solution; for nonlinear models such as SIR the mean of runs and the ODE can differ, especially when early extinction is likely.' },
    ],
    limitations: [
      'The direct method recomputes every propensity at every event; very large systems need faster variants (next-reaction method, tau-leaping).',
      'The browser generator differs from C++’s std::mt19937_64, so seeds give different runs in the two languages; their statistics agree.',
    ],
  },

  ibm: {
    id: 'ibm',
    title: 'Laboratory 5 · An individual-based model',
    domain: 'ibm',
    summary: 'Plants on a plot compete with neighbours and disperse seeds; population patterns emerge from individual rules and depend on scheduling.',
    equations: [
      'P(\\text{plant } i \\text{ survives}) = \\frac{s_0}{1 + c\\,n_i}, \\qquad n_i = \\#\\{j \\neq i : d_{ij} \\le R\\}',
      '\\text{seeds}_i \\sim \\mathrm{Poisson}(f), \\qquad \\text{offset} \\sim \\mathcal N(0, \\sigma^2) \\text{ per axis}',
      'N^* = \\frac{s_0(1+f) - 1}{c\\,\\pi R^2} \\quad \\text{(mean-field equilibrium)}',
    ],
    modelNote:
      'Each plant is an individual with a position, an age and its current number of neighbours. Nothing in the rules mentions clustering or population size: those emerge.',
    parameters: [
      { symbol: 's_0', meaning: 'survival probability of an uncrowded plant', unit: 'per year', value: '0.9' },
      { symbol: 'c', meaning: 'reduction of survival per neighbour', unit: 'per neighbour', value: '0.25' },
      { symbol: 'R', meaning: 'interaction radius', unit: 'fraction of the plot side', value: '0.05' },
      { symbol: 'f', meaning: 'mean established seedlings per survivor', unit: 'per year', value: '1.2' },
      { symbol: 'σ', meaning: 'dispersal distance (standard deviation per axis)', unit: 'fraction of the plot side', value: '0.02' },
    ],
    initial: '300 plants placed uniformly at random; the plot wraps around at its edges (a torus).',
    assumptions: [
      'Annual time steps: survival, then reproduction by survivors; seedlings establish immediately.',
      'Crowding depends only on the number of neighbours within R; all plants are otherwise identical.',
      'Synchronous scheduling: every plant counts neighbours in the same census. Random-order scheduling: deaths take effect immediately.',
    ],
    algorithm: [
      'Census: (synchronous) count each plant’s neighbours.',
      'Survival: visit plants (in random order if asynchronous); each survives with probability s₀/(1 + c nᵢ).',
      'Reproduction: each survivor sets Poisson(f) seeds, displaced by Gaussian offsets and wrapped onto the plot. Newborns are appended after all parents have reproduced.',
      'Record N, births, deaths, mean crowding and the crowding expected under spatial randomness, (N − 1)πR².',
    ],
    cpp: ['ibm/plants.cpp'],
    verification: [
      'With mean-field crowding the population fluctuates around the exact equilibrium N* (unit test and CI).',
      'Short dispersal produces clustering (crowding above the random expectation) and abundance below N*; wide dispersal raises abundance above N* because survival is convex in crowding (Jensen’s inequality) (unit tests).',
      'Random-order scheduling raises abundance relative to synchronous scheduling (unit tests and CI).',
    ],
    interpretation: [
      { question: 'What emerges?', answer: 'Offspring land near their parents, so plants cluster; clustered plants are more crowded than a random arrangement would imply, and the population settles below the mean-field value.' },
      { question: 'Does the implementation matter?', answer: 'Yes: switching from synchronous to random-order updating changes the equilibrium abundance noticeably. The schedule is part of the model and must be reported.' },
      { question: 'What cannot be inferred?', answer: 'The specific numbers depend on the chosen kernel, interaction rule and plot size; conclusions should concern direction and mechanism, checked across replicates and parameter ranges.' },
    ],
    limitations: [
      'A single species with one interaction rule; no age-dependent vital rates or environmental heterogeneity.',
      'Neighbour counting is exact but O(N) per plant in C++; large populations need spatial hashing (as the browser version uses).',
    ],
  },
};
