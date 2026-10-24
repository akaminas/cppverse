import type { MathCode } from './types';

export const mathcode: Record<string, MathCode> = {
  'euler-method-step': {
    title: 'One forward-Euler step, term by term',
    tex: String.raw`\htmlClass{mc-next}{x_i(t+h)} \;\approx\; \htmlClass{mc-state}{x_i(t)} \htmlClass{mc-update}{\;+\;} \htmlClass{mc-step}{h}\,\htmlClass{mc-slope}{f_i\bigl(t, \mathbf{x}(t)\bigr)}, \qquad i = 1, \dots, n`,
    file: 'ode/logistic_integrators.cpp',
    show: [18, 31],
    terms: [
      {
        id: 'state',
        label: 'current state',
        explain:
          'The state at time t: one number per variable of the model (a population size, or S, I and R). The program stores it as a State, a std::vector<double>, and the stepper receives it by const reference because it only reads it.',
        lines: [18, 29],
      },
      {
        id: 'slope',
        label: 'slope from the model',
        explain:
          'The right-hand side of the ODE evaluated at the current time and state. It is the only place where the biology enters. RightHandSide is any function of (t, x) that returns the vector of derivatives, so f(t, x) computes all n slopes before anything changes.',
        lines: [19, 30],
      },
      {
        id: 'step',
        label: 'step size',
        explain: 'The step h, in the time unit of the model (days here). It is a parameter of the method, not of the biology.',
        lines: [29],
      },
      {
        id: 'update',
        label: 'move along the tangent',
        explain:
          'axpy computes x + h k component by component: each new value is the old value plus h times its slope. Because the slopes were all computed first, every component uses the same old state.',
        lines: [22, 23, 24, 25, 26, 27],
      },
      {
        id: 'next',
        label: 'approximate new state',
        explain:
          'The result is an approximation of the state one step later. eulerStep returns it as a new State; the caller decides whether to overwrite its variable with it.',
        lines: [25, 30],
      },
    ],
  },
};
