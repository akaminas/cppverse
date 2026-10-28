import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'access-control-colony': {
    title: 'A class declaration, keyword by keyword',
    start: 'const-method',
    lines: [
      [['class', 'class'], ' Colony {'],
      [['public:', 'public']],
      ['    ', ['static constexpr', 'static-constexpr'], ' int kMaxWorkers = 50000;'],
      ['    ', ['explicit', 'explicit'], ' Colony(int workers);'],
      ['    int workers() ', ['const', 'const-method'], ';'],
      ['    double foodDemand() ', ['const', 'const-method'], ';'],
      ['    ', ['void recruit(int n);', 'mutator']],
      ['    ', ['friend', 'friend'], ' std::ostream& operator<<(std::ostream& os, const Colony& c);'],
      [['private:', 'private']],
      ['    ', ['void checkInvariant() const;', 'helper']],
      ['    ', ['inline static', 'inline-static'], ' int coloniesFounded_ = 0;'],
      ['    ', ['int workers_;', 'data']],
      ['    ', ['mutable', 'mutable'], ' double cachedDemand_ = -1.0;  // negative: not computed yet'],
      ['};'],
    ],
    parts: {
      class: {
        label: 'class',
        role: 'Keyword',
        explain:
          'Members of a class are private unless a section says otherwise; members of a struct are public by default. That default is the only difference between the two keywords.',
      },
      public: {
        label: 'public:',
        role: 'Access specifier',
        explain:
          'Everything below, until the next specifier, is the public interface: what any code may call or read. Keep it short, well named and commented, because it is the part of the class that other people (and you, later) will read first.',
      },
      'static-constexpr': {
        label: 'static constexpr',
        role: 'Shared compile-time constant',
        explain:
          'static: one value for the whole class, not one per object. constexpr: fixed at compile time. Since C++17 such members are implicitly inline, so the line inside the class is a complete definition and needs nothing more in a .cpp file. Use Colony::kMaxWorkers outside the class.',
      },
      explicit: {
        label: 'explicit',
        role: 'Constructor specifier',
        explain: 'Stops the compiler from silently turning an int into a Colony when a function expects a Colony. See the constructors lesson.',
      },
      'const-method': {
        label: 'const (after the parameter list)',
        role: 'Const member function',
        explain:
          'Promises that calling the function does not change the object’s observable state. Only const member functions can be called on a const object or through a const Colony& parameter. Mark every function that only reads as const; the compiler then checks the promise.',
      },
      mutator: {
        label: 'void recruit(int n);',
        role: 'Non-const member function',
        explain:
          'A function that changes the state. Because it is the only way in, it is the one place that must keep the state valid, for example by refusing to exceed kMaxWorkers. That is the main value of encapsulation; a plain setter that accepts anything adds little.',
      },
      friend: {
        label: 'friend',
        role: 'Access grant',
        explain:
          'Declares that this non-member function may read the private members. Nothing in the function’s own definition shows that it is a friend. Use sparingly: every friend is code outside the class that depends on its private details. operator<< is the classic legitimate case.',
      },
      private: {
        label: 'private:',
        role: 'Access specifier',
        explain:
          'Members below are visible only to member functions and friends of Colony. Changing them later breaks no code outside the class, which is why data members are private by default in good designs.',
      },
      helper: {
        label: 'void checkInvariant() const;',
        role: 'Private member function',
        explain:
          'A helper used by the constructor and by recruit(). Private functions remove duplicated code without growing the public interface.',
      },
      'inline-static': {
        label: 'inline static',
        role: 'Shared, modifiable data member',
        explain:
          'One counter shared by all colonies. Since C++17, inline lets you initialise it here; before C++17 it had to be defined once, outside the class, in a .cpp file (int Colony::coloniesFounded_ = 0;). Shared mutable state survives between replicate runs in the same program, so reset it deliberately or avoid it.',
      },
      data: {
        label: 'int workers_;',
        role: 'Per-object data member',
        explain:
          'Every Colony has its own workers_. The trailing underscore is a common convention that marks private data members, so they are easy to tell apart from parameters and local variables.',
      },
      mutable: {
        label: 'mutable',
        role: 'Exception to const',
        explain:
          'A mutable member may be changed even inside a const member function. It is meant for bookkeeping that is not part of the logical state, such as a cache: foodDemand() const can store the value it computed. Anything that changes the model’s results must not be mutable.',
      },
    },
  },
};
