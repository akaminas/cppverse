import { describe, expect, it } from 'vitest';
import { charPoly3, dominantRootCubic, multiply, powerIteration, project, stageMatrix, sum, validateStageParams } from '../lib/simulations/matrix.ts';

const params = { fecundity: 4.5, seedlingSurvival: 0.12, stasis: 0.5, flowering: 0.25, reversion: 0.35, reflowering: 0.4 };

describe('matrix projection', () => {
  it('multiplies a matrix by a vector', () => {
    expect(multiply([[1, 2], [3, 4]], [1, 1])).toEqual([3, 7]);
  });
  it('rejects mismatched dimensions', () => {
    expect(() => multiply([[1, 2], [3, 4]], [1])).toThrow();
  });
  it('power iteration agrees with the dominant root of the characteristic polynomial', () => {
    const A = stageMatrix(params);
    const { lambda, converged } = powerIteration(A);
    expect(converged).toBe(true);
    expect(lambda).toBeCloseTo(dominantRootCubic(charPoly3(A)), 9);
  });
  it('the stable structure is an eigenvector: A w = λ w', () => {
    const A = stageMatrix(params);
    const { lambda, w } = powerIteration(A);
    const Aw = multiply(A, w);
    Aw.forEach((v, i) => expect(v).toBeCloseTo(lambda * w[i], 9));
    expect(sum(w)).toBeCloseTo(1, 12);
  });
  it('long projections grow at rate λ per year', () => {
    const A = stageMatrix(params);
    const { lambda } = powerIteration(A);
    const traj = project(A, [100, 20, 5], 200);
    expect(sum(traj[200]) / sum(traj[199])).toBeCloseTo(lambda, 8);
  });
  it('matches a hand-computed 2×2 case', () => {
    // [[0, 2], [0.5, 0.5]]: λ² − 0.5 λ − 1 = 0, so λ = (0.5 + √4.25) / 2
    const { lambda } = powerIteration([[0, 2], [0.5, 0.5]]);
    expect(lambda).toBeCloseTo((0.5 + Math.sqrt(4.25)) / 2, 9);
  });
  it('flags impossible survival parameters', () => {
    expect(validateStageParams(params)).toEqual([]);
    expect(validateStageParams({ ...params, stasis: 0.9, flowering: 0.3 }).length).toBe(1);
  });
});
