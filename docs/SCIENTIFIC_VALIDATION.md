# Scientific validation

The site teaches modelling, so its models have to be right. Three independent layers check
them:

1. **The TypeScript models** behind the laboratories and figures (`src/lib/simulations/`) are
   unit-tested against analytical results (Vitest, `src/tests/`).
2. **The C++ programs** (`cpp-examples/`) are compiled with two compilers, run, and their output
   compared exactly with the expected output (`scripts/check-cpp.sh`).
3. **Cross-validation** (`scripts/compare-cpp-benchmarks.ts`) compares the canonical C++ model
   programs with the TypeScript models and with analytical results.

All three run in CI on every push. The lesson text never claims a result that one of these
layers does not check, and the browser never runs or imitates C++: the laboratories are
TypeScript simulations of the same models and say so on screen.

## 1. TypeScript models

| Model | File | What the tests establish |
|---|---|---|
| Random numbers | `rng.ts` | xoshiro128** is reproducible for a seed and differs between seeds; uniform mean 1/2 and variance 1/12; exponential mean 1/rate and variance 1/rate²; normal mean and SD; Bernoulli and integer frequencies; weighted choice in proportion to weights and never a zero weight; shuffle is a permutation; invalid rates are rejected |
| Beverton–Holt | `discrete.ts` | matches the closed-form solution at every generation; approaches K = (R0 − 1)M monotonically; goes extinct for R0 < 1; handles the R0 = 1 limit |
| Logistic map | `discrete.ts` | converges to 1 − 1/r for 1 < r < 3; a two-cycle at r = 3.2; throws when density leaves [0, 1] |
| Leslie–Gower competition | `discrete.ts` | simultaneous updating converges to the analytical interior equilibrium; sequential updating gives a different trajectory from the same model |
| Host–parasitoid | `discrete.ts` | both update orders leave the fixed point unchanged; the correct, simultaneous model cycles; the sequential bug converges to the fixed point, which is a plausible but wrong conclusion |
| Matrix models | `matrix.ts` | matrix–vector products; dimension checks; power iteration agrees with the dominant root of the characteristic polynomial; the stable structure satisfies Aw = λw; long projections grow at rate λ; a hand-computed 2×2 case; impossible survival parameters are flagged |
| ODE integrators | `ode.ts` | fixed steps end exactly at the final time; RK4 beats Euler for equal work; Euler on exponential elimination is stable for h < 1/k, oscillates for 1/k < h < 2/k and diverges for h > 2/k; SIR conserves S + I + R and reaches the analytical final size; adaptive Heun–Euler meets its tolerance, rejects steps and takes larger steps where the solution is smooth |
| Gillespie | `gillespie.ts` | stops at an absorbing state (zero total propensity); never makes counts negative; is reproducible for a seed; reproduces the mean and the extinction probability (Kendall) of the linear birth–death process; waiting times are exponential with the total rate; stochastic SIR major outbreaks approach the deterministic final size for large N; replicate summaries on a time grid |
| Plant individual-based model | `ibm.ts` | the global-interaction limit fluctuates around the exact mean-field equilibrium; local competition with short dispersal clusters plants; clustering lowers abundance below the mean-field value (an emergent effect); with wide dispersal, variable crowding raises survival above the mean field (Jensen's inequality); random-order scheduling raises survival relative to synchronous scheduling; plants stay on the torus and the census bookkeeping balances; s0(1 + f) < 1 goes extinct |

Other tests check the curriculum graph and routes (`curriculum.test.ts`), that every
step-through trace prints exactly what its program prints (`content.test.ts`), the
container-growth counts behind a figure (`containers.test.ts`), and the server-side maths
rendering (`tex.test.ts`). There are 292 unit tests in all.

## 2. C++ programs

`scripts/check-cpp.sh` processes all 160 programs in `cpp-examples/` (every `.cpp` file with a
`main`; implementation files for headers are compiled with the program that includes them):

- Each program is compiled with `-Wall -Wextra -Wpedantic -Werror` at the standard named in its
  header (C++17 unless marked C++20 or C++23; three programs are), with **g++-14** and with
  **clang++-18**, on Ubuntu 24.04.
- 14 programs demonstrate a compiler error and must fail to compile with the same flags.
- 124 programs have a `.out` file, and their standard output must match it exactly. Input
  (`.in`) and arguments (`.args`) are supplied where a program needs them.
- Every program must run to completion with exit status 0 within two minutes.
- The remaining 22 programs have no `.out` file on purpose. Seven are the canonical model
  programs, whose output is checked numerically by the cross-validation below. Most of the others draw
  random numbers through standard-library distributions: the C++ standard fixes the engines
  (such as `std::mt19937_64`) but not the distribution algorithms, so the exact numbers differ
  between standard libraries. The rest print values that legitimately vary: type sizes and
  vector capacities, whether plain `char` is signed, fresh seeds from `std::random_device`,
  thread scheduling, and timestamps in run provenance.

Programs made of several files (a header, its implementation and a `main.cpp`) are compiled
together; lessons show the same build command.

## 3. Cross-validation of C++ against the laboratories

The canonical model programs are the code that the model assembly views annotate. After
`check-cpp.sh` has built them, `compare-cpp-benchmarks.ts` runs each one and compares its
output with the TypeScript model and with theory. Deterministic models must agree closely
(relative tolerance 10⁻⁹ unless stated otherwise). Stochastic models are compared only through
statistical expectations, because the C++ uses `std::mt19937_64`, the browser uses xoshiro128**,
and standard libraries may implement distributions differently, so trajectories cannot match
draw for draw.

Results of the most recent CI run (g++-14; clang++-18 gives the same values):

| Check | Criterion | Result |
|---|---|---|
| Beverton–Holt, C++ vs TypeScript | every generation, rel. 10⁻⁹ | max difference 4.6 × 10⁻¹¹ |
| Beverton–Holt, C++ vs closed form | absolute 10⁻⁸ | max difference 4.6 × 10⁻¹¹ |
| Host–parasitoid, simultaneous and sequential | 81 generations, rel. 10⁻⁸ | agree |
| Sequential-update bug converges to the fixed point | rel. 10⁻⁴ | H = 29.6764, H* = 29.6764 |
| Stage matrix λ | rel. 10⁻⁸ | 0.9342525588 vs 0.9342525588 |
| Stage matrix stable structure | rel. 10⁻⁷ | 0.6056, 0.2687, 0.1257 |
| Stage matrix 20-year projection | rel. 10⁻⁴ | total 18.8671 |
| Logistic: Euler, Heun, RK4 at seven step sizes | rel. 10⁻¹⁰ | max relative difference 5.9 × 10⁻¹⁶ |
| Observed orders of convergence | 1, 2 and 4 (±0.15, ±0.15, ±0.3) | 1.08, 2.00, 4.00 |
| SIR with RK4, final S vs TypeScript | rel. 10⁻⁹ | 0.1072085721 |
| SIR final S vs the final-size relation | absolute 10⁻⁶ | 0.1072085721 |
| SIR conservation of S + I + R | < 10⁻¹² | max drift 5.0 × 10⁻¹⁵ |
| Birth–death Gillespie, mean N(T) | within 4 standard errors of the exact mean | 11.081 vs 11.128 |
| Birth–death Gillespie, extinction fraction | within 4 standard errors of Kendall's formula | 0.156 vs 0.154 |
| Exact values printed by the C++ program | rel. 10⁻⁷ | agree |
| IBM, global interaction | mean abundance within 5% of the mean field | 508.1 vs N* = 499.1 |
| IBM, local dispersal clusters | crowding / random expectation > 1.2 | 2.57 |
| IBM, clustering lowers abundance | below 0.9 N* | 248.0 < 449.2 |
| IBM, random-order scheduling raises abundance | greater than synchronous | 682.3 vs 248.0 |

20 of 20 checks pass with both compilers.

## Expected output with floating point

Exact output matching works because programs print with fixed precision chosen so that no
printed value lies near a rounding boundary. Where an expected output was derived by hand, the
same operations were repeated in the same order before formatting. One residual risk is known:
on an aarch64 runner, Clang's floating-point contraction (FMA) could change the last printed
digit of two data-structure examples (`matrix_stage_product`, `struct_logistic`). CI runs on
x86-64, where this does not happen.

## Corrections to the manual

Where the manual's text is wrong, outdated or risky (for example, deprecated idioms, unseeded
or poorly seeded random generators, or advice that hides numerical error), the lesson explains
the correction in a "manual" callout. The coverage document records a correction or
modernisation note for each section concerned
([STUDENT_MANUAL_COVERAGE.md](STUDENT_MANUAL_COVERAGE.md)).

## Limits

- The laboratories are teaching instruments. They implement the models in the lessons, with
  parameter checks, but they are not general-purpose simulation software.
- The statistical checks use 4-standard-error bands, so they would very rarely fail by chance.
  They use fixed seeds, so in practice they are deterministic.
- The individual-based model is checked against mean-field theory and qualitative emergent
  effects; no closed form exists for its spatial dynamics.
