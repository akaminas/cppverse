import type { Trace } from './types';

// The loop of play() from cpp-examples/architecture/design_memory_one_match.cpp,
// traced for a = TFT and b = Alt with benefit 3 and cost 1.
const code = `Move moveA = a.first;
Move moveB = b.first;
double totalA = 0.0;
double totalB = 0.0;
for (int round = 0; round < g.rounds; ++round) {
    totalA += payoff(moveA, moveB, g);
    totalB += payoff(moveB, moveA, g);
    const Move nextA = a.reply(moveA, moveB);
    moveB = b.reply(moveB, moveA);
    moveA = nextA;
}`;

export const traces: Record<string, Trace> = {
  'object-design-match': {
    title: 'Tit-for-tat (a) meets the alternator (b)',
    code,
    steps: [
      { line: 2, note: 'Both strategies open with their first move: cooperate.', vars: { moveA: 'C', moveB: 'C' } },
      { line: 4, note: 'Running totals of payoff for each player.', vars: { moveA: 'C', moveB: 'C', totalA: '0', totalB: '0' } },
      { line: 7, note: 'Round 0, both cooperate: each receives the benefit 3 and pays the cost 1.', vars: { round: '0', moveA: 'C', moveB: 'C', totalA: '2', totalB: '2' } },
      { line: 8, note: 'Tit-for-tat replies to (C, C) by copying its partner: C. The reply goes into nextA, not yet into moveA.', vars: { round: '0', moveA: 'C', moveB: 'C', nextA: 'C', totalA: '2', totalB: '2' } },
      { line: 9, note: 'The alternator replies to its own last move, C, with D. It must see moveA as it was in this round, which is why moveA has not been overwritten yet.', vars: { round: '0', moveA: 'C', moveB: 'D', nextA: 'C', totalA: '2', totalB: '2' } },
      { line: 10, note: 'Only now does moveA take its new value. Both players have replied to the same round: the update is simultaneous.', vars: { round: '0', moveA: 'C', moveB: 'D', totalA: '2', totalB: '2' } },
      { line: 7, note: 'Round 1, (C, D): tit-for-tat pays the cost and receives nothing; the alternator receives 3 for free.', vars: { round: '1', moveA: 'C', moveB: 'D', totalA: '1', totalB: '5' } },
      { line: 10, note: 'Tit-for-tat copies the D; the alternator switches back to C.', vars: { round: '1', moveA: 'D', moveB: 'C', totalA: '1', totalB: '5' } },
      { line: 7, note: 'Round 2, (D, C): now tit-for-tat gains 3 and the alternator loses 1. From here the pattern repeats.', vars: { round: '2', moveA: 'D', moveB: 'C', totalA: '4', totalB: '4' } },
      { line: 11, note: 'After 10 rounds totalA = 9 and totalB = 13: mean payoffs of 0.90 and 1.30, the TFT-Alt and Alt-TFT cells of the table.', vars: { totalA: '9', totalB: '13' } },
    ],
  },
};
