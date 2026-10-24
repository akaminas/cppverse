import type { Anatomy } from './types';

export const anatomies: Record<string, Anatomy> = {
  'templates-function': {
    title: 'A function template and two of its uses',
    start: 'template',
    lines: [
      [['template', 'template'], ' ', ['<', 'brackets'], ['typename', 'typename'], ' ', ['T', 'param'], ['>', 'brackets']],
      [['T', 'return'], ' ', ['clampTo', 'name'], '(', ['T value, T low, T high', 'params'], ') {'],
      ['    if (value ', ['<', 'requirement'], ' low) return low;'],
      ['    if (value ', ['>', 'requirement'], ' high) return high;'],
      ['    return value;'],
      ['}'],
      [],
      ['const int occupied = ', ['clampTo(14, 0, 12)', 'deduced'], ';'],
      ['const double germination = ', ['clampTo<double>', 'explicit'], '(0.35, 0, 1);'],
    ],
    parts: {
      template: {
        label: 'template',
        role: 'Keyword',
        explain:
          'Announces that what follows is not one function but a recipe for a family of functions. Nothing is compiled from it until it is used with a particular type.',
      },
      brackets: {
        label: '< >',
        role: 'Template parameter list',
        explain: 'The angle brackets list the template parameters: the blanks that are filled in when the template is used. Here there is one.',
      },
      typename: {
        label: 'typename',
        role: 'Kind of parameter',
        explain:
          'Says that T stands for a type. The older keyword class means exactly the same here (template <class T>), even though T may be int or double, which are not classes. Use either consistently; this site uses typename.',
      },
      param: {
        label: 'T',
        role: 'Template type parameter',
        explain: 'A placeholder for a type. Inside the template, T is used wherever a type name could appear: parameter types, the return type, local variables.',
      },
      return: {
        label: 'T',
        role: 'Return type',
        explain: 'The function returns a value of the same type it was given. For clampTo<int> it returns an int, for clampTo<double> a double.',
      },
      name: {
        label: 'clampTo',
        role: 'Template name',
        explain: 'The name of the template. Each use with a different T refers to a different function generated from it.',
      },
      params: {
        label: 'T value, T low, T high',
        role: 'Function parameters',
        explain:
          'All three parameters have the same type T. That is a constraint on the caller: the three arguments must deduce the same T, or the call does not compile.',
      },
      requirement: {
        label: '< and >',
        role: 'Implicit requirement on T',
        explain:
          'The body compares values of type T, so T must support < and >. Numbers do, std::string does (alphabetically); a struct without comparison operators does not, and using clampTo with it fails at compile time inside the template.',
      },
      deduced: {
        label: 'clampTo(14, 0, 12)',
        role: 'Call with argument deduction',
        explain:
          'All arguments are int, so the compiler deduces T = int, generates clampTo<int> (once per program) and calls it. Generating a function from a template is called instantiation.',
      },
      explicit: {
        label: 'clampTo<double>',
        role: 'Explicit template argument',
        explain:
          'The type is given in angle brackets, so nothing has to be deduced: the int arguments 0 and 1 are converted to double. This is how std::vector<double> chooses its element type too.',
      },
    },
  },
};
