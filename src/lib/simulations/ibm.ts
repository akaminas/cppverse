// An original individual-based model (Module 17 destination, Laboratory 5):
// perennial plants on a square plot (a torus, so there are no edges) with
// local crowding and short-range seed dispersal.
//
// Each year (one time step):
//   1. Survival. Plant i counts the other plants within radius R of it
//      (its crowding n_i) and survives with probability s0 / (1 + c n_i).
//   2. Reproduction. Each survivor sets Poisson(f) seeds; each seed lands at
//      a Gaussian displacement (standard deviation σ per axis) from its
//      parent and establishes as a new plant of age 0.
//
// Scheduling (the point of the laboratory):
//   'synchronous'  every plant's crowding is computed from the same census
//                  at the start of the year; deaths are applied afterwards.
//   'random-order' plants are visited in a fresh random order and a death is
//                  applied immediately, so later plants see fewer neighbours.
//
// Interaction (for validation):
//   'local'   crowding counts real neighbours within R.
//   'global'  crowding is the expected count under complete spatial
//             randomness, (N − 1) π R². The model then has an exact
//             mean-field limit: E[N_{t+1} | N_t] = N_t s(N_t) (1 + f), whose
//             equilibrium is N* = (s0 (1 + f) − 1) / (c π R²).

import { createRng, normal, poisson, shuffle, type Rng } from './rng.ts';

export interface Plant {
  id: number;
  x: number;
  y: number;
  age: number;
  /** Neighbours within R at this year's survival census. */
  crowding: number;
}

export interface IbmParams {
  s0: number;
  c: number;
  R: number;
  f: number;
  sigma: number;
  schedule: 'synchronous' | 'random-order';
  interaction: 'local' | 'global';
}

export const defaultIbmParams: IbmParams = {
  s0: 0.9,
  c: 0.25,
  R: 0.05,
  f: 1.2,
  sigma: 0.02,
  schedule: 'synchronous',
  interaction: 'local',
};

/** Mean-field equilibrium N* (exact limit for interaction = 'global'). */
export function meanFieldEquilibrium(p: Pick<IbmParams, 's0' | 'c' | 'R' | 'f'>): number {
  const growth = p.s0 * (1 + p.f);
  if (growth <= 1) return 0;
  return (growth - 1) / (p.c * Math.PI * p.R * p.R);
}

const wrap = (v: number) => v - Math.floor(v);
const torusDelta = (a: number, b: number) => {
  const d = Math.abs(a - b);
  return d > 0.5 ? 1 - d : d;
};

/** Spatial hash with cells of side ≥ R: neighbour queries touch 9 cells. */
class Grid {
  readonly n: number;
  readonly cells: number[][];
  private readonly plants: Plant[];
  private readonly alive: Uint8Array;
  constructor(R: number, plants: Plant[], alive: Uint8Array) {
    this.plants = plants;
    this.alive = alive;
    this.n = Math.max(1, Math.floor(1 / R));
    this.cells = Array.from({ length: this.n * this.n }, () => []);
    plants.forEach((p, i) => this.cells[this.index(p.x, p.y)].push(i));
  }
  private index(x: number, y: number) {
    return Math.min(this.n - 1, Math.floor(y * this.n)) * this.n + Math.min(this.n - 1, Math.floor(x * this.n));
  }
  count(i: number, R: number): number {
    const p = this.plants[i];
    const cx = Math.min(this.n - 1, Math.floor(p.x * this.n));
    const cy = Math.min(this.n - 1, Math.floor(p.y * this.n));
    const R2 = R * R;
    let k = 0;
    const span = this.n < 3 ? 0 : 1;
    const seen = new Set<number>();
    for (let dy = -span; dy <= span; dy++) {
      for (let dx = -span; dx <= span; dx++) {
        const cell = ((cy + dy + this.n) % this.n) * this.n + ((cx + dx + this.n) % this.n);
        if (seen.has(cell)) continue;
        seen.add(cell);
        for (const j of this.cells[cell]) {
          if (j === i || !this.alive[j]) continue;
          const ddx = torusDelta(p.x, this.plants[j].x);
          const ddy = torusDelta(p.y, this.plants[j].y);
          if (ddx * ddx + ddy * ddy <= R2) k++;
        }
      }
    }
    if (span === 0) {
      // Grid too coarse to restrict the search: count against everyone.
      k = 0;
      for (let j = 0; j < this.plants.length; j++) {
        if (j === i || !this.alive[j]) continue;
        const ddx = torusDelta(p.x, this.plants[j].x);
        const ddy = torusDelta(p.y, this.plants[j].y);
        if (ddx * ddx + ddy * ddy <= R2) k++;
      }
    }
    return k;
  }
}

export interface YearRecord {
  year: number;
  N: number;
  births: number;
  deaths: number;
  /** Mean crowding experienced by plants at the survival census. */
  meanCrowding: number;
  /** Expected crowding under complete spatial randomness, (N − 1) π R². */
  csrCrowding: number;
}

export class PlantPopulation {
  plants: Plant[] = [];
  year = 0;
  history: YearRecord[] = [];
  private nextId = 0;
  readonly rng: Rng;
  params: IbmParams;

  constructor(params: IbmParams, initial: number, seed: number) {
    this.params = params;
    this.rng = createRng(seed);
    for (let i = 0; i < initial; i++) this.add(this.rng.next(), this.rng.next(), 0);
    this.history.push({ year: 0, N: initial, births: 0, deaths: 0, meanCrowding: NaN, csrCrowding: NaN });
  }

  private add(x: number, y: number, age: number) {
    this.plants.push({ id: this.nextId++, x: wrap(x), y: wrap(y), age, crowding: 0 });
  }

  step(): YearRecord {
    const p = this.params;
    const N = this.plants.length;
    const alive = new Uint8Array(N).fill(1);
    const grid = p.interaction === 'local' ? new Grid(p.R, this.plants, alive) : null;
    const csr = Math.max(0, N - 1) * Math.PI * p.R * p.R;
    const order = Array.from({ length: N }, (_, i) => i);
    if (p.schedule === 'random-order') shuffle(this.rng, order);

    // 1. Survival.
    if (p.schedule === 'synchronous' && grid) {
      for (const i of order) this.plants[i].crowding = grid.count(i, p.R);
    }
    let crowdSum = 0;
    let deaths = 0;
    for (const i of order) {
      const plant = this.plants[i];
      if (!grid) plant.crowding = csr;
      else if (p.schedule === 'random-order') plant.crowding = grid.count(i, p.R);
      crowdSum += plant.crowding;
      const survival = p.s0 / (1 + p.c * plant.crowding);
      if (this.rng.next() >= survival) {
        alive[i] = 0; // in random-order scheduling, later plants no longer count this one
        deaths++;
      }
    }

    // 2. Reproduction by survivors (in census order, which does not affect the outcome).
    const survivors = this.plants.filter((_, i) => alive[i]);
    survivors.forEach((s) => s.age++);
    // Newborns are appended to this.plants; parents are taken from the fixed
    // list of survivors so that this year's seedlings cannot reproduce.
    this.plants = survivors.slice();
    let births = 0;
    for (const parent of survivors) {
      const seeds = poisson(this.rng, p.f);
      for (let k = 0; k < seeds; k++) {
        this.add(parent.x + normal(this.rng, 0, p.sigma), parent.y + normal(this.rng, 0, p.sigma), 0);
        births++;
      }
    }

    this.year++;
    const record: YearRecord = {
      year: this.year,
      N: this.plants.length,
      births,
      deaths,
      meanCrowding: N ? crowdSum / N : 0,
      csrCrowding: csr,
    };
    this.history.push(record);
    return record;
  }

  run(years: number): YearRecord[] {
    for (let i = 0; i < years && this.plants.length > 0; i++) this.step();
    return this.history;
  }
}
