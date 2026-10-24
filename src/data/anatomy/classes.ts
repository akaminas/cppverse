import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'classes-population': {
    title: 'A class definition and an out-of-class member definition',
    start: 'private',
    lines: [
      [['class', 'class'], ' ', ['Population', 'name'], ' {'],
      [['public:', 'public']],
      ['    ', ['int size()', 'getter'], ' ', ['const', 'const'], ';'],
      ['    ', ['void addBirths(int births);', 'mutator']],
      [['private:', 'private']],
      ['    ', ['int size_', 'data'], ' ', ['= 0', 'default'], ';', '   ', ['// invariant: size_ >= 0', 'invariant']],
      [['};', 'semicolon']],
      [],
      [['int', 'return'], ' ', ['Population', 'qualifier'], ['::', 'scope'], ['size', 'getter'], '() ', ['const', 'const'], ' {'],
      ['    return ', ['size_', 'data'], ';'],
      ['}'],
    ],
    parts: {
      class: {
        label: 'class',
        role: 'Keyword',
        explain:
          'Defines a new type, exactly as struct does. The only difference is the default access: members of a struct are public unless you say otherwise, members of a class are private. By convention, struct is used for plain bundles of data and class for types that protect their data.',
      },
      name: {
        label: 'Population',
        role: 'Type name',
        explain: 'The name of the new type. Population beetles; creates an object of it, just like int n; creates an int.',
      },
      public: {
        label: 'public:',
        role: 'Access specifier',
        explain:
          'Everything below this label, up to the next label, may be used by any code: these members form the interface of the class. Here only member functions are public.',
      },
      getter: {
        label: 'size()',
        role: 'Member function (reading)',
        explain:
          'A function that belongs to the class and is called through an object: beetles.size(). Inside it, the members of that object (size_) are available by name.',
      },
      const: {
        label: 'const',
        role: 'const member function',
        explain:
          'Promises that size() does not change the object. The compiler enforces the promise, and only const member functions can be called on a const Population (or through a const reference). Mark every member function that only reads as const; the declaration and the definition must both say it.',
      },
      mutator: {
        label: 'addBirths',
        role: 'Member function (changing)',
        explain:
          'The only way for outside code to change the population. Because every change goes through functions like this, they are the place to check that the change is valid and to keep the invariant.',
      },
      private: {
        label: 'private:',
        role: 'Access specifier',
        explain:
          'Members below this label can be used only by the member functions of the class. Code in main that writes beetles.size_ = -5; does not compile. Hiding the data like this is called encapsulation.',
      },
      data: {
        label: 'size_',
        role: 'Data member',
        explain:
          'The state of each Population object. The trailing underscore is a common convention that marks data members (the manual uses an m prefix instead); it also frees the name size for the member function.',
      },
      default: {
        label: '= 0',
        role: 'Default member initialiser',
        explain:
          'Every new Population starts with size_ equal to 0. Without it, size_ would be uninitialised in a Population created as Population p; and the first addBirths would add to an indeterminate value. Give every data member of built-in type an initialiser.',
      },
      invariant: {
        label: 'invariant',
        role: 'Comment: the class invariant',
        explain:
          'A condition that must hold for every object at every moment that outside code can observe. Writing it down tells you what each member function must preserve.',
      },
      semicolon: {
        label: '};',
        role: 'End of the class definition',
        explain: 'As for a struct, the definition ends with a semicolon after the closing brace.',
      },
      return: {
        label: 'int',
        role: 'Return type',
        explain: 'The definition repeats the return type of the declaration.',
      },
      qualifier: {
        label: 'Population',
        role: 'Class name in a qualified name',
        explain:
          'Outside the class body, a member function is defined under its full name, Population::size. Without the qualifier the compiler would think you were defining an unrelated free function called size.',
      },
      scope: {
        label: '::',
        role: 'Scope resolution operator',
        explain: 'Reads “the size that belongs to Population”, just as std::cout is “the cout that belongs to std”.',
      },
    },
  },
};
