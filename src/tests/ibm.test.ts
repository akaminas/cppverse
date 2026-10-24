import { describe, expect, it } from 'vitest';
import { PlantPopulation, defaultIbmParams, meanFieldEquilibrium } from '../lib/simulations/ibm.ts';

const average = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

describe('plant IBM', () => {
  it('in the global-interaction limit fluctuates around the exact mean-field equilibrium', () => {
    const p = { ...defaultIbmParams, interaction: 'global' as const };
    const Nstar = meanFieldEquilibrium(p);
    const means: number[] = [];
    for (let seed = 1; seed <= 6; seed++) {
      const hist = new PlantPopulation(p, Math.round(Nstar), seed).run(160);
      means.push(average(hist.slice(60).map((h) => h.N)));
    }
    expect(Math.abs(average(means) - Nstar) / Nstar).toBeLessThan(0.04);
  });
  it('local competition with short dispersal clusters plants: they see more neighbours than under spatial randomness', () => {
    const hist = new PlantPopulation(defaultIbmParams, 300, 3).run(80).slice(30);
    expect(average(hist.map((h) => h.meanCrowding / h.csrCrowding))).toBeGreaterThan(1.2);
  });
  it('clustering lowers the population below the mean-field prediction (an emergent effect)', () => {
    const hist = new PlantPopulation(defaultIbmParams, 300, 4).run(120).slice(40);
    expect(average(hist.map((h) => h.N))).toBeLessThan(0.9 * meanFieldEquilibrium(defaultIbmParams));
  });
  it('with wide dispersal and spatial randomness, variable crowding raises survival above the mean-field value (Jensen)', () => {
    const p = { ...defaultIbmParams, sigma: 0.2 };
    const hist = new PlantPopulation(p, 500, 9).run(140).slice(50);
    expect(average(hist.map((h) => h.N))).toBeGreaterThan(1.05 * meanFieldEquilibrium(p));
  });
  it('random-order scheduling raises survival relative to synchronous scheduling', () => {
    const sync = new PlantPopulation(defaultIbmParams, 400, 8).run(100).slice(30);
    const async = new PlantPopulation({ ...defaultIbmParams, schedule: 'random-order' }, 400, 8).run(100).slice(30);
    expect(average(async.map((h) => h.N))).toBeGreaterThan(average(sync.map((h) => h.N)));
  });
  it('keeps all plants on the torus and balances the census bookkeeping', () => {
    const pop = new PlantPopulation(defaultIbmParams, 100, 5);
    for (let i = 0; i < 20; i++) {
      const before = pop.plants.length;
      const r = pop.step();
      expect(r.N).toBe(before - r.deaths + r.births);
      for (const p of pop.plants) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThan(1);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThan(1);
      }
    }
  });
  it('a population with s0 (1 + f) < 1 goes extinct', () => {
    const hist = new PlantPopulation({ ...defaultIbmParams, s0: 0.4, f: 1 }, 200, 6).run(200);
    expect(hist.at(-1)!.N).toBe(0);
  });
});
