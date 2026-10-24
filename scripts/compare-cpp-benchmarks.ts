// Cross-validates the compiled C++ model programs against the TypeScript
// simulations that drive the browser laboratories, and against analytical
// results. Run after scripts/check-cpp.sh has built cpp-build/.
//
//   node --experimental-strip-types scripts/compare-cpp-benchmarks.ts
//
// Deterministic models must agree to a relative tolerance of 1e-9.
// Stochastic models are compared through statistical expectations, never
// trajectory by trajectory: std::mt19937_64 and the browser generator are
// different algorithms, and C++ standard libraries may implement
// distributions differently.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { bevertonHoltExact, bevertonHoltStep, hostParasitoidEquilibrium, hostParasitoidTrajectory, iterate } from '../src/lib/simulations/discrete.ts';
import { powerIteration, project, stageMatrix } from '../src/lib/simulations/matrix.ts';
import { integrateFixed, logisticExact, logisticRhs, sirFinalSusceptible, sirRhs, type Method } from '../src/lib/simulations/ode.ts';
import { birthDeathExtinction, birthDeathMean } from '../src/lib/simulations/gillespie.ts';
import { meanFieldEquilibrium, defaultIbmParams } from '../src/lib/simulations/ibm.ts';

const build = join(import.meta.dirname, '..', 'cpp-build');
let failures = 0;
let checks = 0;

function run(program: string, args: string[] = []): string {
  const exe = join(build, program + (process.platform === 'win32' ? '.exe' : ''));
  if (!existsSync(exe)) throw new Error(`missing executable ${exe}; run scripts/check-cpp.sh first`);
  return execFileSync(exe, args, { encoding: 'utf8', timeout: 300_000 });
}

function check(name: string, ok: boolean, detail: string) {
  checks++;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${detail}`);
}

const close = (a: number, b: number, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b));
const csvRows = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
const keyValues = (text: string) => Object.fromEntries(csvRows(text).map((l) => l.split(',')).filter((p) => p.length === 2).map(([k, v]) => [k, Number(v)]));

// ── Beverton–Holt ──────────────────────────────────────────────────────────
{
  const rows = csvRows(run('algorithms/beverton_holt')).slice(1).map((l) => l.split(',').map(Number));
  const p = { R0: 2.2, M: 40 };
  const ts = iterate((N) => bevertonHoltStep(N, p), 5, 30);
  const worst = Math.max(...rows.map(([t, N]) => Math.abs(N - ts[t])));
  check('beverton_holt vs TypeScript', rows.length === 31 && rows.every(([t, N]) => close(N, ts[t])), `max |difference| = ${worst.toExponential(2)}`);
  const exactWorst = Math.max(...rows.map(([t, N]) => Math.abs(N - bevertonHoltExact(5, t, p))));
  check('beverton_holt vs closed form', exactWorst < 1e-8, `max |difference| = ${exactWorst.toExponential(2)}`);
}

// ── Host–parasitoid, both update orders ────────────────────────────────────
{
  const p = { r: 1.2, K: 80, a: 0.06, c: 0.8 };
  for (const order of ['simultaneous', 'sequential'] as const) {
    const rows = csvRows(run('algorithms/host_parasitoid', [order, '80'])).slice(1).map((l) => l.split(',').map(Number));
    const ts = hostParasitoidTrajectory([20, 2], 80, p, order);
    const ok = rows.length === 81 && rows.every(([t, H, P]) => close(H, ts[t][0], 1e-8) && close(P, ts[t][1], 1e-8));
    check(`host_parasitoid (${order}) vs TypeScript`, ok, `${rows.length} generations compared`);
  }
  const seq = csvRows(run('algorithms/host_parasitoid', ['sequential', '400'])).at(-1)!.split(',').map(Number);
  const eq = hostParasitoidEquilibrium(p)!;
  check('host_parasitoid sequential bug converges to the fixed point', close(seq[1], eq[0], 1e-4), `H = ${seq[1].toFixed(4)}, H* = ${eq[0].toFixed(4)}`);
}

// ── Stage matrix ───────────────────────────────────────────────────────────
{
  const out = run('algorithms/stage_matrix');
  const kv = keyValues(out);
  const A = stageMatrix({ fecundity: 4.5, seedlingSurvival: 0.12, stasis: 0.5, flowering: 0.25, reversion: 0.35, reflowering: 0.4 });
  const ts = powerIteration(A);
  check('stage_matrix lambda vs TypeScript', close(kv.lambda, ts.lambda, 1e-8), `C++ ${kv.lambda}, TS ${ts.lambda}`);
  const structure = out.split('\n').find((l) => l.startsWith('structure,'))!.split(',').slice(1).map(Number);
  check('stage_matrix structure vs TypeScript', structure.every((v, i) => close(v, ts.w[i], 1e-7)), structure.map((v) => v.toFixed(6)).join(' '));
  const year20 = out.split('\n').find((l) => l.startsWith('20,'))!.split(',').map(Number);
  const tsYear20 = project(A, [100, 20, 5], 20)[20];
  check('stage_matrix projection vs TypeScript', [0, 1, 2].every((i) => close(year20[i + 1], tsYear20[i], 1e-4)), `year 20 total ${year20[4]}`);
}

// ── Logistic: Euler, Heun, RK4 ─────────────────────────────────────────────
{
  const p = { r: 0.8, K: 100 };
  const rows = csvRows(run('ode/logistic_integrators')).slice(1).map((l) => l.split(','));
  let worst = 0;
  let ok = true;
  for (const [method, h, , N] of rows) {
    if (method === 'exact') {
      ok &&= close(Number(N), logisticExact(2, 10, p));
      continue;
    }
    const ts = integrateFixed(logisticRhs(p), [2], 0, 10, Number(h), method as Method).x.at(-1)![0];
    worst = Math.max(worst, Math.abs(ts - Number(N)) / Math.abs(ts));
    ok &&= close(Number(N), ts, 1e-10);
  }
  check('logistic_integrators vs TypeScript', ok && rows.length === 19, `max relative difference ${worst.toExponential(2)}`);
  const err = (m: string, h: number) => Number(rows.find((r) => r[0] === m && Number(r[1]) === h)![4]);
  const orders = (['euler', 'heun', 'rk4'] as const).map((m) => Math.log2(err(m, 0.0625) / err(m, 0.03125)));
  check('observed orders of convergence are 1, 2, 4', Math.abs(orders[0] - 1) < 0.15 && Math.abs(orders[1] - 2) < 0.15 && Math.abs(orders[2] - 4) < 0.3, orders.map((o) => o.toFixed(2)).join(', '));
}

// ── SIR with RK4 ───────────────────────────────────────────────────────────
{
  const kv = keyValues(run('ode/sir_rk4'));
  const p = { beta: 0.5, gamma: 0.2 };
  const ts = integrateFixed(sirRhs(p), [0.999, 0.001, 0], 0, 400, 0.05, 'rk4').x.at(-1)![0];
  check('sir_rk4 final S vs TypeScript', close(kv.final_S, ts, 1e-9), `C++ ${kv.final_S}, TS ${ts}`);
  check('sir_rk4 final S vs final-size relation', Math.abs(kv.final_S - sirFinalSusceptible(0.999, p)) < 1e-6, `relation ${kv.final_size_relation_S}`);
  check('sir_rk4 conserves S + I + R', kv.max_conservation_error < 1e-12, `max drift ${kv.max_conservation_error}`);
}

// ── Birth–death Gillespie (statistical) ────────────────────────────────────
{
  const kv = keyValues(run('stochastic/birth_death_gillespie'));
  const n = kv.replicates;
  const mean = birthDeathMean(5, 4, 1, 0.8);
  const p0 = birthDeathExtinction(5, 4, 1, 0.8);
  check('Gillespie mean N(T) within 4 standard errors of the exact mean', Math.abs(kv.mean_N - mean) < (4 * kv.sd_N) / Math.sqrt(n), `${kv.mean_N.toFixed(4)} vs ${mean.toFixed(4)}`);
  check('Gillespie extinction fraction within 4 standard errors of Kendall’s formula', Math.abs(kv.fraction_extinct - p0) < 4 * Math.sqrt((p0 * (1 - p0)) / n), `${kv.fraction_extinct.toFixed(4)} vs ${p0.toFixed(4)}`);
  check('the C++ program reports the same exact values', close(kv.exact_mean_N, mean, 1e-7) && close(kv.exact_extinction_probability, p0, 1e-7), 'analytical formulas agree');
}

// ── Plant IBM (statistical) ────────────────────────────────────────────────
{
  const series = (schedule: string, interaction: string) =>
    csvRows(run('ibm/plants', [schedule, interaction, '11', '160']))
      .slice(2)
      .map((l) => l.split(',').map(Number));
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const Nstar = meanFieldEquilibrium(defaultIbmParams);
  const global = series('synchronous', 'global').filter((r) => r[0] >= 60);
  const local = series('synchronous', 'local').filter((r) => r[0] >= 60);
  const randomOrder = series('random-order', 'local').filter((r) => r[0] >= 60);
  const gN = mean(global.map((r) => r[1]));
  check('IBM global limit fluctuates around the mean-field equilibrium', Math.abs(gN - Nstar) / Nstar < 0.05, `${gN.toFixed(1)} vs N* = ${Nstar.toFixed(1)}`);
  const ratio = mean(local.map((r) => r[2] / r[3]));
  check('IBM local dispersal produces clustering', ratio > 1.2, `crowding / random expectation = ${ratio.toFixed(2)}`);
  check('IBM clustering lowers abundance below the mean-field value', mean(local.map((r) => r[1])) < 0.9 * Nstar, `${mean(local.map((r) => r[1])).toFixed(1)} < 0.9 × ${Nstar.toFixed(1)}`);
  check('IBM random-order scheduling raises abundance', mean(randomOrder.map((r) => r[1])) > mean(local.map((r) => r[1])), `${mean(randomOrder.map((r) => r[1])).toFixed(1)} vs ${mean(local.map((r) => r[1])).toFixed(1)}`);
}

console.log(`\n${checks - failures} of ${checks} cross-validation checks passed`);
process.exit(failures ? 1 : 0);
