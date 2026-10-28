import type { MathCode } from './types';

// Synchronised views for the lesson "gillespie". Line numbers refer to the
// complete files, whose first line is the "// Title:" comment.
export const mathcode: Record<string, MathCode> = {
  'gillespie-birth-death': {
    title: 'One run of the direct method for the linear birth-death process',
    file: 'stochastic/birth_death_gillespie.cpp',
    show: [30, 50],
    tex: String.raw`\begin{gathered}
\htmlClass{mc-bdbirth}{a_1 = b\,N} \qquad \htmlClass{mc-bddeath}{a_2 = d\,N} \qquad \htmlClass{mc-bdtotal}{a_0 = a_1 + a_2} \\[4pt]
\htmlClass{mc-bdabsorb}{a_0 = 0 \;\Rightarrow\; \text{stop: extinct}} \qquad \htmlClass{mc-bdtau}{\tau \sim \operatorname{Exp}(a_0)} \qquad \htmlClass{mc-bdend}{t + \tau > T \;\Rightarrow\; \text{stop}} \\[4pt]
\htmlClass{mc-bdclock}{t \leftarrow t + \tau} \qquad \htmlClass{mc-bdlottery}{\Pr(\text{birth}) = a_1 / a_0} \qquad \htmlClass{mc-bdupdate}{N \leftarrow N \pm 1}
\end{gathered}`,
    terms: [
      { id: 'bdbirth', label: 'birth propensity', explain: 'Each of the N individuals gives birth at rate b, so births happen at total rate b N (per year). The propensity is recomputed from the current N before every event.', lines: [36] },
      { id: 'bddeath', label: 'death propensity', explain: 'Each individual dies at rate d, so deaths happen at total rate d N.', lines: [37] },
      { id: 'bdtotal', label: 'total propensity', explain: 'The rate at which anything happens: the sum of the propensities of all events.', lines: [38] },
      { id: 'bdabsorb', label: 'absorbing state', explain: 'With N = 0 both propensities are zero, so no event can ever occur again. The run ends normally: extinction is a result, not an error. Testing total <= 0.0 before drawing also avoids an exponential distribution with rate zero, which is not allowed.', lines: [39] },
      { id: 'bdtau', label: 'waiting time', explain: 'The time to the next event is exponential with rate a₀ (mean 1/a₀). std::exponential_distribution takes the RATE, not the mean. The distribution is rebuilt every iteration because a₀ changes after every event.', lines: [41, 42] },
      { id: 'bdend', label: 'end time', explain: 'If the next event would happen after the end time T, it is not applied: the state at T is the current state. Applying it would record an event that the observation window does not contain.', lines: [43] },
      { id: 'bdclock', label: 'advance the clock', explain: 'Time jumps straight to the moment of the next event. There is no time step: between events nothing changes.', lines: [44] },
      { id: 'bdlottery', label: 'which event', explain: 'A weighted lottery between the two events: u a₀ with u uniform on [0, 1) falls below a₁ with probability a₁/a₀. With many events, std::discrete_distribution does the same job.', lines: [34, 47] },
      { id: 'bdupdate', label: 'state change', explain: 'A birth adds one individual and a death removes one. Each event changes the state by a fixed vector, here +1 or −1.', lines: [47, 48] },
    ],
  },

  'gillespie-sir': {
    title: 'The direct method for a stochastic SIR epidemic, recorded every 10 days',
    file: 'stochastic/sir_gillespie.cpp',
    show: [34, 58],
    tex: String.raw`\begin{gathered}
\htmlClass{mc-sirinf}{a_{\mathrm{inf}} = \beta\,\frac{S\,I}{N}} \qquad \htmlClass{mc-sirrec}{a_{\mathrm{rec}} = \gamma\,I} \qquad \htmlClass{mc-sirtotal}{a_0 = a_{\mathrm{inf}} + a_{\mathrm{rec}}} \\[4pt]
\htmlClass{mc-sirabsorb}{I = 0 \;\Rightarrow\; a_0 = 0} \qquad \htmlClass{mc-sirtau}{\tau \sim \operatorname{Exp}(a_0)} \qquad \htmlClass{mc-sirsave}{t + \tau > t_{\mathrm{save}} \;\Rightarrow\; t \leftarrow t_{\mathrm{save}}} \\[4pt]
\htmlClass{mc-sirclock}{t \leftarrow t + \tau} \qquad \htmlClass{mc-sirlottery}{\Pr(j) = a_j / a_0} \qquad \htmlClass{mc-sirupdate}{(S, I, R) \leftarrow (S{-}1,\, I{+}1,\, R) \ \text{or}\ (S,\, I{-}1,\, R{+}1)}
\end{gathered}`,
    terms: [
      { id: 'sirinf', label: 'infection propensity', explain: 'Each of the I infectious hosts makes contacts at rate β per day, and a fraction S/N of them are with susceptible hosts. The product S I makes the model nonlinear.', lines: [37] },
      { id: 'sirrec', label: 'recovery propensity', explain: 'Each infectious host recovers at rate γ per day, independently of the others.', lines: [38] },
      { id: 'sirtotal', label: 'total propensity', explain: 'The total rate of events, which sets the waiting time.', lines: [39] },
      { id: 'sirabsorb', label: 'absorbing state', explain: 'When no host is infectious, neither event can occur: the epidemic is over. The loop stops drawing events, and the remaining save times record the final state.', lines: [40] },
      { id: 'sirtau', label: 'waiting time', explain: 'Exponential with rate a₀, rebuilt every iteration because a₀ changes with S and I.', lines: [42, 43] },
      { id: 'sirsave', label: 'save time', explain: 'An event that would fall after the next save time is not applied. Because waiting times are memoryless, the clock can restart at the save time with a fresh exponential draw; the process is still simulated exactly.', lines: [44, 45, 46] },
      { id: 'sirclock', label: 'advance the clock', explain: 'Jump to the moment of the event.', lines: [48] },
      { id: 'sirlottery', label: 'which event', explain: 'std::discrete_distribution with weights a_inf and a_rec returns 0 (infection) or 1 (recovery) with probabilities proportional to the weights.', lines: [51, 52] },
      { id: 'sirupdate', label: 'state change', explain: 'The switch applies the stoichiometry of the chosen event. S + I + R stays equal to N.', lines: [53, 54] },
    ],
  },
};
