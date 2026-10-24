// Figures for the lesson "containers". The copying cost of appending n
// elements to a vector is counted exactly for three idealised capacity
// policies; no standard library is simulated.
import type { FigureSpec } from './types';
import type { Series } from '../../components/charts/Chart';

/**
 * Total number of element copies (or moves) made by reallocations while
 * n elements are appended one at a time. Each reallocation copies every
 * element already stored. `grow` maps the old capacity to the new one.
 */
export function copiesWhileAppending(n: number, grow: (capacity: number) => number): number {
  let capacity = 0;
  let copies = 0;
  for (let size = 0; size < n; size++) {
    if (size === capacity) {
      copies += size;
      capacity = Math.max(size + 1, grow(capacity));
    }
  }
  return copies;
}

const sizes = Array.from(new Set(Array.from({ length: 41 }, (_, i) => Math.round(Math.pow(10, 0.3 + (i * 2.7) / 40))))).sort((a, b) => a - b);

export const figures: Record<string, () => FigureSpec> = {
  'containers-growth-cost': () => {
    const policies = [
      { id: 'one', label: 'Grow by one', grow: (c: number) => c + 1, family: 'terracotta' as const },
      { id: 'onehalf', label: 'Grow × 1.5', grow: (c: number) => c + Math.floor(c / 2), family: 'indigo' as const },
      { id: 'double', label: 'Grow × 2', grow: (c: number) => 2 * c, family: 'teal' as const },
    ];
    return {
      title: 'Growing the capacity by a constant factor keeps the copying proportional to n',
      subtitle: 'Element copies made by reallocations while n elements are appended one by one, for three idealised capacity policies',
      xLabel: 'Elements appended, n',
      yUnit: 'Element copies in total',
      series: [
        ...policies.map(
          (p): Series => ({
            id: p.id,
            label: p.label,
            family: p.family,
            markers: true,
            points: sizes.map((n) => [n, copiesWhileAppending(n, p.grow)] as [number, number]),
          }),
        ),
        { id: 'n', label: 'n (for comparison)', grey: true, points: sizes.map((n) => [n, n] as [number, number]) },
      ],
      x: { type: 'log' },
      y: { type: 'log' },
      footer:
        'Counted exactly with copiesWhileAppending (src/lib/figures/containers.ts). Grow by one copies n(n − 1)/2 elements; constant factors copy at most about 2n (× 2) or 3n (× 1.5). With reserve(n) no copies are made.',
    };
  },
};
