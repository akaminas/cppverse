// Checks the copy counting behind the figure in the lesson "containers".
import { describe, expect, it } from 'vitest';
import { copiesWhileAppending } from '../lib/figures/containers';

describe('copiesWhileAppending', () => {
  it('grow-by-one copies n(n - 1)/2 elements', () => {
    for (const n of [1, 2, 3, 10, 257]) expect(copiesWhileAppending(n, (c) => c + 1)).toBe((n * (n - 1)) / 2);
  });
  it('doubling copies 2^k - 1 elements when 2^k < n <= 2^(k+1)', () => {
    expect(copiesWhileAppending(1, (c) => 2 * c)).toBe(0);
    expect(copiesWhileAppending(2, (c) => 2 * c)).toBe(1);
    expect(copiesWhileAppending(5, (c) => 2 * c)).toBe(1 + 2 + 4);
    expect(copiesWhileAppending(1000, (c) => 2 * c)).toBe(1023);
  });
  it('a constant growth factor keeps the cost below 3n', () => {
    for (let n = 1; n <= 2000; n += 37) {
      expect(copiesWhileAppending(n, (c) => 2 * c)).toBeLessThan(2 * n);
      expect(copiesWhileAppending(n, (c) => c + Math.floor(c / 2))).toBeLessThanOrEqual(3.01 * n);
    }
  });
});
