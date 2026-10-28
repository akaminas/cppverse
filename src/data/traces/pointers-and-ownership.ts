import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'pointers-basics': {
    title: 'Pointers, references and a unique_ptr, one line at a time',
    file: 'architecture/pointers_basics.cpp',
    steps: [
      { line: 23, note: 'An ordinary double. It lives at some address in memory; the address differs from run to run, so the program never prints it.', vars: { mass: '12.5' } },
      { line: 24, note: '&mass is the address of mass. p is a pointer to double that stores this address: p points at mass.', vars: { mass: '12.5', p: '→ mass' } },
      { line: 25, note: '*p dereferences the pointer: it is the object that p points at. Adding 0.5 to *p changes mass itself.', vars: { mass: '13', p: '→ mass' } },
      { line: 26, note: 'Printing mass shows the change made through the pointer.', vars: { mass: '13', p: '→ mass' }, out: 'mass after *p += 0.5: 13\n' },
      { line: 28, note: 'alias is a reference: a second name for mass. It must be bound when it is created and can never be null or bound to another object.', vars: { mass: '13', p: '→ mass', alias: '≡ mass' } },
      { line: 29, note: 'A reference needs no special syntax; alias *= 2.0 doubles mass.', vars: { mass: '26', p: '→ mass', alias: '≡ mass' } },
      { line: 30, note: 'Reading through the pointer gives the same value, because p, alias and mass all refer to one object.', vars: { mass: '26', p: '→ mass', alias: '≡ mass' }, out: 'mass after alias *= 2: 26\n' },
      { line: 32, note: 'A second double.', vars: { mass: '26', p: '→ mass', alias: '≡ mass', other: '7' } },
      { line: 33, note: 'Assigning a new address re-points p; mass is untouched. A reference cannot do this: assigning to alias would assign to mass.', vars: { mass: '26', p: '→ other', alias: '≡ mass', other: '7' } },
      { line: 34, note: '*p now reads other.', vars: { mass: '26', p: '→ other', alias: '≡ mass', other: '7' }, out: '*p is now 7, mass is still 26\n' },
      { line: 36, note: 'std::make_unique creates a Habitat on the heap and returns a std::unique_ptr that owns it, so the code needs neither new nor delete.', vars: { mass: '26', p: '→ other', other: '7', habitat: '→ Habitat{40, 300}' } },
      { line: 37, note: 'habitat.get() gives density a plain, non-owning pointer. density may read the Habitat but is not responsible for deleting it.', vars: { habitat: '→ Habitat{40, 300}' }, out: 'density: 3 per ha\n' },
      { line: 38, note: 'Passing nullptr says that there is no habitat; density checks for that before it dereferences.', vars: { habitat: '→ Habitat{40, 300}' }, out: 'density with no habitat: 0\n' },
      { line: 40, note: 'A unique_ptr cannot be copied, only moved. std::move hands ownership to owner and leaves habitat empty. There is still exactly one owner.', vars: { habitat: 'nullptr', owner: '→ Habitat{40, 300}' } },
      { line: 41, note: 'A moved-from unique_ptr is guaranteed to be null.', vars: { habitat: 'nullptr', owner: '→ Habitat{40, 300}' }, out: 'habitat is empty: true\n' },
      { line: 42, note: '-> reaches a member through a pointer: owner->carryingCapacity means (*owner).carryingCapacity.', vars: { habitat: 'nullptr', owner: '→ Habitat{40, 300}' }, out: "owner's capacity: 300\n" },
      { line: 44, note: 'At the closing brace owner goes out of scope and its destructor deletes the Habitat. This is RAII. The empty habitat pointer has nothing to delete.' },
    ],
  },
};
