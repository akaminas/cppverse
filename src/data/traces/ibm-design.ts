import type { Trace } from './types';

// Step-through of cpp-examples/ibm/design_newborns.cpp, following the buggy
// reproduction loop iteration by iteration.
export const traces: Record<string, Trace> = {
  'ibm-design-newborns': {
    title: 'Why a loop that re-reads size() lets seedlings reproduce',
    file: 'ibm/design_newborns.cpp',
    steps: [
      { line: 47, note: 'Three founders, numbered 0 to 2. A parent of -1 marks a founder.', vars: { founders: '[0, 1, 2]' } },
      { line: 49, note: 'Two identical copies of the founders: one for each version of the reproduction loop.', vars: { 'buggy.size()': '3', 'correct.size()': '3' } },
      { line: 20, note: 'Inside reproduceBuggy. The condition compares i with plants.size(), which is evaluated afresh before every iteration.', vars: { i: '0', 'plants.size()': '3' } },
      { line: 23, note: 'Founder 0 sets a seed. Seedling 3 is appended at the end of the vector.', vars: { i: '0', 'plants.size()': '4', 'new plant': '3 <- 0' } },
      { line: 23, note: 'Founder 1 sets a seed.', vars: { i: '1', 'plants.size()': '5', 'new plant': '4 <- 1' } },
      { line: 23, note: 'Founder 2 sets a seed. All three founders have now reproduced: this is where the year should end.', vars: { i: '2', 'plants.size()': '6', 'new plant': '5 <- 2' } },
      { line: 20, note: 'The test 3 < 6 is true, so the loop carries on into the seedlings appended a moment ago.', vars: { i: '3', 'plants.size()': '6' } },
      { line: 23, note: 'Seedling 3, born this year, sets a seed of its own. The bug is now visible in the data.', vars: { i: '3', 'plants.size()': '7', 'new plant': '6 <- 3' } },
      { line: 23, note: 'Seedling 4 reproduces.', vars: { i: '4', 'plants.size()': '8', 'new plant': '7 <- 4' } },
      { line: 23, note: 'Seedling 5 reproduces.', vars: { i: '5', 'plants.size()': '9', 'new plant': '8 <- 5' } },
      { line: 23, note: 'Seedling 6, a grandchild born this same year, reproduces and fills the last microsite.', vars: { i: '6', 'plants.size()': '10', 'new plant': '9 <- 6' } },
      { line: 21, note: 'From i = 7 to 9 the plot is full, so no seed establishes. The loop stops when i reaches 10. Only the microsite limit stopped it: without one, this loop would run until memory ran out.', vars: { i: '7, 8, 9', 'plants.size()': '10' } },
      { line: 51, note: 'reproduceCorrect stores parents = 3 before the loop, so exactly the three founders reproduce.', vars: { 'buggy.size()': '10', 'correct.size()': '6' } },
      { line: 52, note: 'Seven seedlings in the buggy version, four of them descended from plants born this year.', out: 'buggy  : 10 plants; seedling<-parent: 3<-0 4<-1 5<-2 6<-3 7<-4 8<-5 9<-6\n' },
      { line: 53, note: 'The correct version: one seedling per founder.', out: 'correct: 6 plants; seedling<-parent: 3<-0 4<-1 5<-2\n' },
    ],
  },
};
