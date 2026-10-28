import type { MathCode } from './types';

// The survival rule of the plant model and its implementation in
// cpp-examples/ibm/plants.cpp (line numbers of that file).
export const mathcode: Record<string, MathCode> = {
  'ibm-design-survival': {
    title: 'Crowding-dependent survival in plants.cpp',
    file: 'ibm/plants.cpp',
    show: [85, 135],
    tex: String.raw`\Pr(\text{plant } i \text{ survives}) = \htmlClass{mc-surv}{s_i} = \frac{\htmlClass{mc-s0}{s_0}}{1 + \htmlClass{mc-c}{c}\,\htmlClass{mc-n}{n_i}}, \qquad \htmlClass{mc-n}{n_i} = \#\{\, \htmlClass{mc-others}{j \neq i} : \htmlClass{mc-dist}{d(\mathbf{x}_i, \mathbf{x}_j)} \htmlClass{mc-radius}{\le R} \,\}`,
    terms: [
      { id: 'surv', label: 'survival probability', explain: 'The probability that plant i is alive next year. The code computes it once per plant and compares it with a uniform random number: the plant dies if the number is at least s_i.', lines: [96, 97] },
      { id: 's0', label: 'uncrowded survival s₀', explain: 'Survival of a plant with no neighbours (0.9 in the default parameters), read from the Parameters struct.', lines: [96] },
      { id: 'c', label: 'crowding strength c', explain: 'How strongly each neighbour reduces survival. With c = 0.25, four neighbours halve the survival probability of an uncrowded plant.', lines: [96] },
      { id: 'n', label: 'crowding nᵢ', explain: 'The number of living neighbours. Synchronous scheduling counts it for every plant before any plant dies (line 87); random-order scheduling counts it at the moment the plant is visited (line 94). The count itself is a plain scan over all plants.', lines: [87, 94, 125, 127, 128, 132, 134] },
      { id: 'others', label: 'other living plants', explain: 'A plant does not crowd itself, and a plant already marked dead no longer crowds anyone.', lines: [129] },
      { id: 'dist', label: 'distance on the torus', explain: 'The separation along each axis is the shorter of the direct distance and the distance across the plot edge (torusDelta, lines 52 to 55).', lines: [130, 131] },
      { id: 'radius', label: 'interaction radius R', explain: 'A neighbour counts if it lies within R. Comparing squared distances with R² avoids a square root per pair.', lines: [126, 132] },
    ],
  },
};
