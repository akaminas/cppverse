import type { Trace } from './types';

const female = { 'female.ageYears_': '3', 'female.stage_': 'adult', 'female.massGrams_': '41.5', 'female.offspring_': '0', 'female.alive_': 'true' };
const newborn = { 'newborn.ageYears_': '0', 'newborn.stage_': 'juvenile', 'newborn.massGrams_': '2.8', 'newborn.offspring_': '0', 'newborn.alive_': 'true' };

export const traces: Record<string, Trace> = {
  'constructors-individual': {
    title: 'Which constructor runs, and when the object exists',
    file: 'architecture/constructors_individual.cpp',
    steps: [
      {
        line: 16,
        note: 'female{3, Stage::adult, 41.5} calls the three-argument constructor. The member initialiser list sets age, stage and mass; offspring_ and alive_ take their default member initialisers. Members are always initialised in the order in which the class declares them.',
        vars: female,
      },
      {
        line: 18,
        note: 'The constructor body checks the arguments. Age 3 is not negative and 41.5 g is positive, so nothing is thrown and the constructor finishes.',
        vars: female,
      },
      {
        line: 48,
        note: 'Back in main, female now exists. It is const, so from here on only its const member functions can be called.',
        vars: female,
      },
      {
        line: 22,
        note: 'newborn{2.8} matches the explicit one-argument constructor. Its initialiser list holds only a call to the other constructor: it delegates, passing age 0 and Stage::juvenile.',
        vars: { ...female, birthMassGrams: '2.8' },
      },
      {
        line: 18,
        note: 'The target constructor initialises and checks the members exactly as it did for female. All validation lives in one place.',
        vars: { ...female, ...newborn },
      },
      {
        line: 49,
        note: 'The delegating constructor’s own body is empty, so construction is complete. Both objects started in a valid state.',
        vars: { ...female, ...newborn },
      },
      {
        line: 50,
        note: 'report receives female by const reference (no copy) and reads it through const accessors.',
        vars: { ...female, ...newborn },
        out: 'female: adult, age 3, 41.5 g, offspring 0\n',
      },
      {
        line: 51,
        note: 'The newborn has the same offspring count and survival flag as the adult, because both values come from the default member initialisers.',
        vars: { ...female, ...newborn },
        out: 'newborn: juvenile, age 0, 2.8 g, offspring 0\n',
      },
      {
        line: 16,
        note: 'Inside the try block, impossible{2, Stage::adult, -5.0} starts construction. The initialiser list runs first, so for a moment the members hold the bad mass.',
        vars: { ...female, ...newborn, 'impossible.massGrams_': '-5' },
      },
      {
        line: 18,
        note: 'The mass check fails and the constructor throws std::invalid_argument. Because the constructor never finished, no object called impossible ever exists, and the call to report on line 55 is skipped.',
        vars: { ...female, ...newborn },
      },
      {
        line: 57,
        note: 'The exception is caught by const reference and its message is printed.',
        vars: { ...female, ...newborn, 'error.what()': '"body mass must be positive"' },
        out: 'rejected: body mass must be positive\n',
      },
      {
        line: 59,
        note: 'main returns 0. female and newborn are destroyed; the class needs no destructor of its own because none of its members manages a resource.',
      },
    ],
  },
};
