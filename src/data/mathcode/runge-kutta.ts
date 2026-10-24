import type { MathCode } from './types';

export const mathcode: Record<string, MathCode> = {
  'runge-kutta-rk4': {
    title: 'The classical fourth-order Runge–Kutta step',
    tex: String.raw`\begin{aligned}
\htmlClass{mc-k1}{\mathbf{k}_1} &= \mathbf{f}(t,\ \mathbf{x}) \
\htmlClass{mc-k2}{\mathbf{k}_2} &= \mathbf{f}\bigl(t + \tfrac{h}{2},\ \mathbf{x} + \tfrac{h}{2}\mathbf{k}_1\bigr) \
\htmlClass{mc-k3}{\mathbf{k}_3} &= \mathbf{f}\bigl(t + \tfrac{h}{2},\ \mathbf{x} + \tfrac{h}{2}\mathbf{k}_2\bigr) \
\htmlClass{mc-k4}{\mathbf{k}_4} &= \mathbf{f}\bigl(t + h,\ \mathbf{x} + h\,\mathbf{k}_3\bigr) \
\htmlClass{mc-next}{\mathbf{x}(t+h)} &\approx \mathbf{x} + \htmlClass{mc-combine}{\tfrac{h}{6}\bigl(\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4\bigr)}
\end{aligned}`,
    file: 'ode/logistic_integrators.cpp',
    show: [41, 49],
    terms: [
      {
        id: 'k1',
        label: 'slope at the start',
        explain: 'k₁ is the slope at the beginning of the step, exactly the slope Euler’s method would use.',
        lines: [42],
      },
      {
        id: 'k2',
        label: 'first slope at the midpoint',
        explain: 'Take half a step along k₁ to a trial midpoint and evaluate the model there. axpy(x, h / 2.0, k1) builds the trial state.',
        lines: [43],
      },
      {
        id: 'k3',
        label: 'second slope at the midpoint',
        explain: 'Repeat the half step, now along the better slope k₂, and evaluate the model again at the midpoint.',
        lines: [44],
      },
      {
        id: 'k4',
        label: 'slope at the end',
        explain: 'Take a full step along k₃ and evaluate the slope at the end of the interval.',
        lines: [45],
      },
      {
        id: 'combine',
        label: 'weighted average of the slopes',
        explain:
          'The four slopes are averaged with weights 1, 2, 2 and 1 (divided by 6) and the state moves by h times that average. The midpoint slopes count double, as in Simpson’s rule for integrals.',
        lines: [47],
      },
      {
        id: 'next',
        label: 'new state',
        explain: 'The approximate state at t + h. Like eulerStep, rk4Step returns a new State and has exactly the same parameters, so the two are interchangeable.',
        lines: [46, 47, 48],
      },
    ],
  },
};
