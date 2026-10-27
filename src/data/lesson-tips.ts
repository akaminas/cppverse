// What the nautilus says inside each lesson: a one-line welcome ("In about N
// minutes you will learn …") and tips specific to that lesson.
//
// The tips speak in the six voices of src/data/tips.ts, modelled on the kinds
// of comment made by the expert panel of the Groningen manual: rules of the
// language, the elegant way, notes from the field, recipes for disaster,
// deeper water and quick-and-dirty shortcuts (with a warning). All wording is
// original. src/tests/tips.test.ts checks that every lesson has an entry.

import type { Tip } from './tips';

const rule = (text: string): Tip => ({ voice: 'rule', text });
const style = (text: string): Tip => ({ voice: 'style', text });
const field = (text: string): Tip => ({ voice: 'field', text });
const disaster = (text: string): Tip => ({ voice: 'disaster', text });
const deep = (text: string): Tip => ({ voice: 'deep', text });
const shortcut = (text: string): Tip => ({ voice: 'shortcut', text });

export interface LessonGuide {
  /** Completes "In about N minutes you will learn …" (no final full stop). */
  learn: string;
  tips: readonly Tip[];
}

export const LESSON_GUIDES: Readonly<Record<string, LessonGuide>> = {
  // ── Program anatomy ──────────────────────────────────────────────────────
  'what-is-a-program': {
    learn: 'how a biological model becomes an algorithm, and an algorithm becomes a program',
    tips: [
      field('A model is your idea of how the population works; the program is only one way of writing it down. Keep the two apart in your head.'),
      rule('A computer does exactly what you write, never what you meant. Every step of a model has to be spelled out.'),
      style('Before any code, write the model in three sentences a fellow biologist would understand.'),
      disaster('Starting to type before you know what the model should do. You will write the program twice.'),
    ],
  },
  toolchain: {
    learn: 'how a source file is compiled, linked and run, and how to read what the compiler tells you',
    tips: [
      rule('Compile C++ with g++ or clang++, not gcc. gcc compiles the file but does not link the C++ library, so you get pages of undefined references.'),
      style('Build with -std=c++17 -Wall -Wextra from day one. Warnings are free advice from the compiler.'),
      disaster('Running an old executable after editing the source. If a fix seems to change nothing, check that you rebuilt.'),
      deep('An undefined reference comes from the linker, not the compiler: the code compiled, but a definition is missing or a file was not linked.'),
    ],
  },
  'hello-world': {
    learn: 'what every line of the smallest complete C++ program does, and why it is there',
    tips: [
      rule('Statements end with a semicolon. The compiler often reports a missing one on the line after the mistake.'),
      disaster('Forgetting #include <iostream>. The compiler then says that cout is not a member of std.'),
      style('Use \'\\n\' to end a line. std::endl also flushes the stream, which slows down programs that print a lot.'),
      shortcut('using namespace std; saves typing std:: in a small exercise. Never put it in a header: it leaks into every file that includes it.'),
    ],
  },
  'code-style': {
    learn: 'to write code a colleague, or you in six months, can read and trust',
    tips: [
      style('Name a quantity after its meaning and unit, such as death_rate_per_day, and the comment you would have written is no longer needed.'),
      style('A comment should say why, or give units and assumptions. The code already says what.'),
      disaster('Copy-pasting a block and changing one number in each copy. When you fix a bug, you will fix it in only one of them.'),
      field('Let the structure of the program mirror the model: one function per process (birth, death, dispersal) makes the biology easy to check.'),
    ],
  },
  'multiple-files': {
    learn: 'to split a program into headers and source files and build them together',
    tips: [
      rule('Declarations go in the header, definitions in the .cpp file. A non-inline function defined in a header breaks when two files include it.'),
      rule('Give every header an include guard, or #pragma once, so that including it twice does no harm.'),
      disaster('using namespace std; in a header. Every file that includes it inherits the clash-prone names.'),
      deep('A header should include what it uses and nothing more. Fewer includes mean faster builds and fewer surprises.'),
    ],
  },
  // ── Numeric computation ──────────────────────────────────────────────────
  'variables-and-types': {
    learn: 'to choose a type for each biological quantity and give every variable a value',
    tips: [
      rule('An uninitialised local variable holds whatever was in memory. Give every variable a value when you declare it.'),
      rule('Brace initialisation refuses to lose information: int n{2.5}; is a compile error, while int n = 2.5; silently stores 2.'),
      field('Counts of individuals are integers; densities, rates and masses are doubles. Choose the type the biology implies.'),
      disaster('Reading with std::cin >> x when the user types a letter. The read fails, x becomes 0 and every later read fails too.'),
    ],
  },
  'assignment-and-literals': {
    learn: 'the difference between initialising and assigning, and how to write numbers of the intended type',
    tips: [
      rule('= in C++ is an action, not an equation. x = x + dx means: compute x + dx, then store it in x.'),
      rule('3 is an int, 3.0 is a double and 3.0f is a float. The type of a literal decides the arithmetic that follows.'),
      style('Mark values that never change const, or constexpr when they are known at compile time.'),
      disaster('Writing 1/2 for one half. Both are integers, so the result is 0.'),
    ],
  },
  'numeric-limits': {
    learn: 'how large and how precise each numeric type is, and what happens at the edges',
    tips: [
      rule('Signed integer overflow is undefined behaviour: the program may do anything, not just wrap around.'),
      field('A population of a few billion does not fit in a 32-bit int. Use std::int64_t from <cstdint> for large counts.'),
      deep('A double has about 16 significant digits, so 1e16 + 1 == 1e16. Adding small terms to a huge sum can lose them entirely.'),
      field('Multiply many small probabilities and the product underflows to 0. Add their logarithms instead.'),
    ],
  },
  'type-conversion': {
    learn: 'how C++ divides integers and converts between types in mixed expressions',
    tips: [
      rule('Integer division truncates towards zero: 7 / 2 is 3 and -7 / 2 is -3.'),
      field('A proportion from counts needs a cast: static_cast<double>(infected) / total, or you get 0 for every proportion below one.'),
      field('% wraps positions on a ring of patches: (i + 1) % n. For steps to the left, use (i - 1 + n) % n so the result never goes negative.'),
      disaster('double p = infected / total; with two ints. The division happens in integers first; the conversion to double comes too late.'),
    ],
  },
  'math-functions': {
    learn: 'to translate growth and dose-response equations into correct C++ expressions',
    tips: [
      rule('std::log is the natural logarithm. Use std::log10 when you mean base 10.'),
      rule('Trigonometric functions take radians. Convert degrees by multiplying by π / 180.'),
      disaster('Calling abs on a double without the std:: prefix. On some systems the C function for integers runs and 2.7 becomes 2.'),
      style('Check a transcribed equation at special cases: at N = 0 and at N = K a logistic growth term should be zero.'),
    ],
  },
  'operators-and-expressions': {
    learn: 'how C++ evaluates expressions, and how to parenthesise an equation correctly',
    tips: [
      rule('^ is bitwise exclusive or, not a power. Write x * x or std::pow(x, 2.0).'),
      rule('a / b * c means (a / b) * c. When in doubt, add parentheses: they cost nothing.'),
      disaster('i++ + i++ in one expression. Modifying a variable twice without a sequence point is undefined behaviour.'),
      style('Prefer ++i in loops. For integers it makes no difference, but it is the habit that never costs anything for iterators.'),
    ],
  },
  'blocks-and-scope': {
    learn: 'where a name can be used, how long a variable lives, and why globals cause trouble',
    tips: [
      rule('A variable declared inside braces disappears at the closing brace.'),
      disaster('Declaring double N inside a loop when an outer N already exists. You update the inner copy, and the outer one never changes.'),
      style('Compile with -Wshadow and the compiler will point out names that hide other names.'),
      field('A global parameter can be changed from anywhere, so a run can no longer be explained by its inputs. Pass parameters in instead.'),
    ],
  },
  // ── Control flow ─────────────────────────────────────────────────────────
  'logical-expressions': {
    learn: 'to write and combine conditions, and to avoid the classic comparison mistakes',
    tips: [
      disaster('if (x = 5) assigns 5 and is always true. Write == for comparison, and keep -Wall on to catch it.'),
      rule('0 < x < 10 does not test a range: 0 < x gives true or false, which is always less than 10. Write 0 < x && x < 10.'),
      rule('&& stops as soon as the result is known, so n > 0 && sum / n > 1 never divides by zero.'),
      style('Name a condition: bool is_extinct = N < 1.0; reads better than the bare comparison inside an if.'),
    ],
  },
  conditionals: {
    learn: 'to make a program choose between actions with if and else',
    tips: [
      rule('An else belongs to the nearest unmatched if, whatever the indentation suggests. Braces make the pairing explicit.'),
      style('Always use braces, even for a one-line body. Adding a second line later then cannot change the meaning.'),
      field('In an else-if chain only the first true branch runs. Put the most specific threshold first.'),
      disaster('A semicolon straight after the condition: if (N < 1); { … }. The if controls an empty statement and the block always runs.'),
    ],
  },
  'switch-and-ternary': {
    learn: 'to dispatch on a value with switch, and to choose a value with the ?: operator',
    tips: [
      disaster('Forgetting break in a switch. Execution falls through into the next case and runs it too.'),
      rule('A variable declared inside a case needs its own braces, or the compiler complains that a jump crosses its initialisation.'),
      style('Name the events of a model with an enum class and switch on it. Add no default, and the compiler can warn when a case is missing.'),
      style('const double rate = infected ? beta : 0.0; lets a value be const even though it depends on a condition.'),
    ],
  },
  'for-loops': {
    learn: 'to repeat an update over many time steps with a for loop',
    tips: [
      rule('for (int t = 0; t < n; ++t) runs exactly n times, with t from 0 to n - 1.'),
      disaster('for (double t = 0; t != 1.0; t += 0.1) never stops: ten additions of 0.1 do not give exactly 1.0. Count steps with an integer.'),
      disaster('Counting down an unsigned index: for (std::size_t i = n - 1; i >= 0; --i) never ends, because an unsigned value is never negative.'),
      field('Store the time step in an integer and compute the time as t * dt. Accumulated rounding then never shifts your output times.'),
    ],
  },
  'while-and-jumps': {
    learn: 'to loop until a condition is met, and to leave a loop early',
    tips: [
      rule('A while loop must change something its condition depends on, or it runs for ever.'),
      field('A simulation that stops at extinction should also stop at a maximum time. Guard every open-ended loop with a cap.'),
      rule('break leaves only the innermost loop. To leave nested loops, return from a function or use a flag.'),
      rule('A do-while loop always runs at least once: the test comes after the body.'),
    ],
  },
  // ── Functions ────────────────────────────────────────────────────────────
  functions: {
    learn: 'to package a computation as a function and call it from main',
    tips: [
      style('A good function does one job you can name. growth_rate(N, r, K) is easier to test than a block inside main.'),
      disaster('A non-void function that can reach its end without return. The result is undefined, and it may look fine until it does not.'),
      style('Keep main short: read parameters, set up, run, write output. It should read like the outline of the experiment.'),
      rule('A function must be declared before it is called. A prototype at the top lets you define it later in the file.'),
    ],
  },
  'passing-arguments': {
    learn: 'when a function can change the caller\'s variables, and how to avoid needless copies',
    tips: [
      rule('By default arguments are copied. Changing a parameter inside the function leaves the caller\'s variable alone.'),
      style('Pass vectors and other large objects by const reference: no copy, and no accidental change.'),
      disaster('Returning a reference to a local variable. The variable dies when the function returns, and the reference dangles.'),
      style('Returning a new value is often clearer than changing a reference parameter. Modern compilers make the return cheap.'),
    ],
  },
  'function-features': {
    learn: 'to overload functions, give default arguments, and know what inline and static mean',
    tips: [
      rule('Write a default argument once, in the declaration. Repeating it in the definition is an error.'),
      disaster('Overloads for long and double, then a call with an int. Both need a conversion, so the call is ambiguous.'),
      deep('In modern C++, inline means "may be defined in several files", not "please inline this call". The optimiser decides that.'),
      field('A static local counter makes a function remember earlier calls, so the same call can give different answers. Tests then depend on order.'),
    ],
  },
  recursion: {
    learn: 'to solve a problem by calling a function from itself, and when a loop is better',
    tips: [
      rule('Every recursion needs a base case that every call is guaranteed to reach.'),
      disaster('Naive recursive Fibonacci recomputes the same values exponentially often. A loop does it in a fraction of a second.'),
      field('Recursion fits nested biology: a phylogeny is a clade of clades, so counting its leaves is naturally recursive.'),
      deep('Each call takes stack space. Recursion a million levels deep can crash with a stack overflow; a loop cannot.'),
    ],
  },
  // ── Data structures ──────────────────────────────────────────────────────
  vectors: {
    learn: 'to store a sequence of values, such as a whole trajectory, in a std::vector',
    tips: [
      rule('Indices run from 0 to size() - 1. v[v.size()] is one past the end and undefined behaviour.'),
      style('Use v.at(i) while developing: it throws at the first bad index instead of quietly reading garbage.'),
      disaster('std::vector<int> v(5) holds five zeros, but std::vector<int> v{5} holds a single 5. The brackets matter.'),
      field('push_back each new state into a vector and the whole trajectory is kept for plotting and checking.'),
    ],
  },
  'nested-vectors': {
    learn: 'to represent grids and matrices as vectors of vectors',
    tips: [
      style('std::vector<std::vector<double>> g(rows, std::vector<double>(cols, 0.0)) creates a filled grid in one line.'),
      rule('By convention g[i][j] is row i, column j. Decide once and stick to it.'),
      disaster('Swapping the bounds of nested loops, so j runs to rows. It may work on square grids and crash on the first rectangular one.'),
      deep('A single flat vector indexed with r * cols + c keeps the data contiguous, which is often faster for large grids.'),
    ],
  },
  text: {
    learn: 'to work with characters and strings, and to convert between text and numbers',
    tips: [
      rule('\'a\' is a char and "a" is a string. They are different types and do not compare equal.'),
      rule('find returns std::string::npos when nothing is found. Always test for it before using the position.'),
      disaster('std::stoi("12abc") quietly returns 12. Pass a position argument and check that the whole field was used.'),
      disaster('Comparing two string literals with == compares their addresses, not their text. Make one of them a std::string.'),
    ],
  },
  'pairs-and-structs': {
    learn: 'to bundle related values into pairs and structs',
    tips: [
      style('A struct with named members beats a pair: p.mass says more than p.second.'),
      field('Group the parameters of a model in one struct and pass it around. Adding a parameter then changes one line, not every call.'),
      style('auto [time, size] = record; unpacks a pair or struct into named variables (C++17).'),
      rule('Brace initialisation fills members in declaration order. Reorder the members and an initialiser can silently change meaning.'),
    ],
  },
  classes: {
    learn: 'to define classes that keep their data consistent through their member functions',
    tips: [
      rule('class and struct differ only in default access: private for class, public for struct.'),
      style('State the invariant of a class, such as "mass is never negative", and make every public function preserve it.'),
      disaster('A copy of an object is a separate object. Changing the copy inside a function leaves the original untouched.'),
      field('Use a struct for plain data and a class when the data must obey a rule. Not everything needs getters and setters.'),
    ],
  },
  'composite-types': {
    learn: 'to build a class around a container of records and look values up in it safely',
    tips: [
      rule('A type nested in a class is named from outside as Outer::Inner.'),
      style('Return std::optional from a lookup that may fail. The caller cannot forget that "not found" is possible.'),
      disaster('Returning a pointer into a container and then adding elements. The vector reallocates and the pointer dangles.'),
      style('Expose operations the model needs, such as add_sample and mean_mass, not the container itself.'),
    ],
  },
  templates: {
    learn: 'to write functions and classes that work for many types',
    tips: [
      rule('Template definitions belong in headers: the compiler needs the full code to instantiate them for each type.'),
      disaster('A template error can run to hundreds of lines. Read the first error and the line marked "required from here".'),
      style('Write the function for one concrete type first, test it, then turn it into a template.'),
      deep('A C++20 concept such as std::floating_point states what a template needs and turns cryptic errors into readable ones.'),
    ],
  },
  containers: {
    learn: 'to choose a standard container from the operations a model performs',
    tips: [
      deep('When a vector outgrows its capacity it moves everything to new memory. Every pointer, reference and iterator into it is then invalid.'),
      style('Call reserve(n) when you know roughly how many elements are coming. It avoids repeated reallocation.'),
      field('Inserting in the middle of a vector shifts every later element. If individuals come and go constantly, think about the cost.'),
      rule('std::array has a fixed size known at compile time, ideal for a state with a fixed number of variables.'),
    ],
  },
  iterators: {
    learn: 'to walk through any container with iterators, and to erase while walking',
    tips: [
      rule('end() points one past the last element. Never dereference it.'),
      disaster('Erasing inside a range-for loop. Use it = v.erase(it) in an explicit iterator loop, and do not increment after erasing.'),
      style('Use cbegin and cend when you only read: the compiler then stops you from writing by mistake.'),
      deep('std::distance on a list walks the whole list. Only random-access iterators can jump in one step.'),
    ],
  },
  'modern-loops': {
    learn: 'to write shorter, safer loops with auto, aliases and range-for',
    tips: [
      disaster('for (auto x : population) copies every individual, and changes to x are lost. Write auto& to modify, const auto& to read.'),
      rule('auto drops references and top-level const: auto x = ref; makes a copy.'),
      style('for (const auto& [species, count] : abundance) reads a map entry by name instead of .first and .second.'),
      style('using Grid = std::vector<std::vector<double>>; gives a long type a short, meaningful name.'),
    ],
  },
  'more-containers': {
    learn: 'when to use lists, sets, maps and queues, and how to use them',
    tips: [
      disaster('Reading a map with m[key] inserts the key with a default value if it was missing. Use find or at to look without changing.'),
      rule('std::priority_queue puts the largest element on top. For an event queue ordered by earliest time, give it std::greater.'),
      rule('std::list cannot use std::sort; call its own sort member function.'),
      style('unordered_map is usually faster for lookups, but its order is arbitrary. Use map when you need sorted output.'),
    ],
  },
  'standard-algorithms': {
    learn: 'to sort, search, count and summarise data with standard algorithms and lambdas',
    tips: [
      disaster('std::accumulate(v.begin(), v.end(), 0) on doubles sums in int and truncates every step. Start from 0.0.'),
      rule('std::remove_if does not shrink the container. Follow it with erase, or use std::erase_if in C++20.'),
      style('std::max_element returns an iterator; its distance from begin() gives the time of the peak as well as its height.'),
      deep('A lambda that captures by reference must not outlive the variables it captured.'),
    ],
  },
  // ── Input and output ─────────────────────────────────────────────────────
  'file-io': {
    learn: 'to read data from files and write results to them, and to cope with bad input',
    tips: [
      rule('Check that a file opened: if (!in) { … }. A failed open does not stop the program by itself.'),
      disaster('while (!in.eof()) reads the last value twice. Loop on the read itself: while (in >> x).'),
      disaster('A relative path is relative to where the program runs, not to where the source file lives.'),
      style('Send results to std::cout and errors to std::cerr, so redirecting output to a file never hides an error message.'),
    ],
  },
  'formatting-output': {
    learn: 'to format numbers for readers and for data files',
    tips: [
      rule('setprecision and fixed stay on the stream until changed; setw applies to the next value only.'),
      field('For data files, write doubles with std::setprecision(17) (max_digits10) so they read back exactly.'),
      disaster('Comma-separated output opened in a spreadsheet set to a decimal-comma language. Columns merge or split unpredictably.'),
      style('Tables for reading and files for analysis have different needs. Format the first for eyes and the second for programs.'),
    ],
  },
  'string-streams': {
    learn: 'to build and take apart strings as if they were streams',
    tips: [
      style('Build a file name per replicate with an ostringstream: "run_" << seed << ".csv".'),
      rule('std::getline(ss, field, \',\') splits a line at commas, one field at a time.'),
      disaster('Converting "3.5kg" with >> gives 3.5 and silently ignores the rest. Check that the stream is empty afterwards.'),
      deep('Reuse an istringstream with str(new_text) and clear(). Forgetting clear() leaves the failed state from the last line.'),
    ],
  },
  'command-line': {
    learn: 'to pass parameters to a program from the command line and from parameter files',
    tips: [
      rule('argv[0] is the program\'s own name, so argc is one more than the number of arguments you typed.'),
      field('Parameters belong outside the source: a parameter file makes every run reproducible without recompiling.'),
      disaster('A typo in a parameter file key silently ignored, so the model runs with the default. Treat unknown keys as errors.'),
      shortcut('Hard-coding the parameters is fine for a first test. The moment you run a second scenario, move them to a file.'),
    ],
  },
  'simulation-output': {
    learn: 'to write simulation output that you and others can analyse and trust later',
    tips: [
      field('Write the parameters, seed and program version as comment lines at the top of every output file. Future you will need them.'),
      style('One row per time step and one column per variable, with a header row, reads directly into R or pandas.'),
      rule('R reads comment lines with comment.char = "#"; pandas with comment="#".'),
      disaster('Overwriting yesterday\'s output with today\'s run. Put the seed or a timestamp in the file name.'),
    ],
  },
  // ── Program architecture ─────────────────────────────────────────────────
  'procedural-review': {
    learn: 'to organise a complete simulation from parameters to validated output',
    tips: [
      style('Parameters, state, update rule, loop, checks, output: if you can point to each part, the program is well organised.'),
      field('Compare the simulation with a case you can solve on paper before trusting it in any other case.'),
      disaster('Adding three features at once and then finding a bug. Add one, test it, then add the next.'),
    ],
  },
  'access-control': {
    learn: 'to decide who may read and change each member of a class',
    tips: [
      rule('A const object, or a const reference, can call only const member functions. Mark every function that only reads as const.'),
      style('Replace set_x(value) with an operation that means something, such as grow(dt), and the class can keep itself valid.'),
      rule('Since C++17, inline static members can be initialised inside the class, with no separate definition in a .cpp file.'),
      shortcut('Making everything public gets the program running today. It also lets any line of code break the invariant tomorrow.'),
    ],
  },
  constructors: {
    learn: 'to construct objects that are valid from the first moment',
    tips: [
      rule('Members are initialised in the order they are declared, not in the order of the initialiser list. -Wall warns about mismatches.'),
      style('Check arguments in the constructor and throw if the object would be invalid. Then no invalid object can exist.'),
      style('Mark one-argument constructors explicit, so a double never silently becomes an Individual.'),
      deep('The rule of zero: if every member manages itself (vectors, strings, smart pointers), write no destructor, copy or move at all.'),
    ],
  },
  'operator-overloading': {
    learn: 'to give your own types natural operators such as + and <<',
    tips: [
      style('Write += first, then define + in terms of it. The two then never disagree.'),
      rule('operator<< takes and returns std::ostream&, so that outputs can be chained.'),
      disaster('Overloading an operator with a surprising meaning. a + b should still feel like addition.'),
      rule('You cannot change an operator\'s precedence or the number of its operands, only what it does for your type.'),
    ],
  },
  'object-design': {
    learn: 'to design objects that interact the way the parts of a model do',
    tips: [
      field('Start from the biology: which entities exist, what each knows, and what each does. Those are your classes and members.'),
      style('Parameters shared by everyone belong to the model, not to each individual. Copying them into every object wastes memory and invites drift.'),
      field('A pairwise interaction, such as a contest, often reads best as a free function of two individuals and the parameters.'),
      deep('Objects are not always fastest. For millions of simple agents, separate vectors per attribute can be much quicker.'),
    ],
  },
  inheritance: {
    learn: 'to model families of related types with inheritance, variants and templates',
    tips: [
      rule('A base class used through pointers needs a virtual destructor, or deleting a derived object through the base pointer is undefined.'),
      style('Write override on every overriding function. A typo in the signature then becomes a compile error, not a silent new function.'),
      disaster('Storing derived objects in a std::vector<Base>. Each one is sliced down to its base part, and the overrides are gone.'),
      deep('A std::variant of a few known types is often simpler and faster than a class hierarchy.'),
    ],
  },
  'pointers-and-ownership': {
    learn: 'what pointers are, who owns an object, and how to avoid dangling references',
    tips: [
      disaster('Keeping a pointer to a vector element and then calling push_back. If the vector reallocates, the pointer dangles.'),
      style('Use std::unique_ptr and std::make_unique for an object with a single owner. It cleans up after itself.'),
      field('Link parents and offspring by index into the population vector, not by pointer. Indices survive reallocation.'),
      rule('Use nullptr, never 0 or NULL, for "points to nothing".'),
    ],
  },
  performance: {
    learn: 'to measure where a simulation spends its time, and to make it faster safely',
    tips: [
      rule('Always time an optimised build (-O2). A debug build can be ten times slower and tells you little.'),
      style('Profile before optimising. The slow part is rarely the one you suspected.'),
      field('Checking every pair of individuals is O(N²). A spatial grid that checks only nearby cells can make it nearly linear.'),
      disaster('Optimising and changing the results. Keep a reference output and confirm the faster version reproduces it.'),
    ],
  },
  'modern-cpp': {
    learn: 'which newer C++ features make model code shorter and safer',
    tips: [
      deep('std::span lets one function accept a vector, an array or part of either without copying.'),
      style('std::format("{:.3f}", x) formats like Python and is checked by the compiler.'),
      disaster('Using a C++23 feature on a compiler that does not support it yet. Check the compiler support table before you depend on it.'),
      deep('Designated initialisers, Params{.r = 1.2, .K = 500}, name each parameter at the call site (C++20).'),
    ],
  },
  // ── Algorithm design ─────────────────────────────────────────────────────
  'algorithms-and-pseudocode': {
    learn: 'to break a model into steps and write them as pseudocode before C++',
    tips: [
      style('Refine pseudocode until each line is a few statements of C++. Then translating it is mechanical.'),
      field('Most models reuse a handful of building blocks: a sum, a count, a maximum, a weighted choice. Learn to spot them.'),
      disaster('Starting the peak search at 0 when every value could be negative. Start from the first element instead.'),
    ],
  },
  debugging: {
    learn: 'to find bugs systematically with assertions, a debugger and sanitizers',
    tips: [
      rule('assert disappears when NDEBUG is defined, as in CMake release builds. Never put code with side effects inside it.'),
      style('-fsanitize=address,undefined catches out-of-range access and overflow at the line where they happen.'),
      field('Assert biological invariants: no negative densities, probabilities between 0 and 1, population totals that add up.'),
      disaster('Debugging by adding print statements everywhere, then forgetting to remove them. A breakpoint leaves no trace.'),
    ],
  },
  exceptions: {
    learn: 'to signal and handle errors with exceptions',
    tips: [
      rule('Throw by value and catch by const reference: catch (const std::exception& e).'),
      rule('An exception that escapes main ends the program through std::terminate, usually with an unhelpful message. Catch in main and report.'),
      field('Reject impossible parameters, such as a negative growth rate where it makes no sense, with std::invalid_argument at input.'),
      deep('std::exit skips the destructors of local objects, so buffered output may be lost. Returning from main is cleaner.'),
    ],
  },
  'discrete-time-models': {
    learn: 'to simulate a population that changes in discrete steps, generation by generation',
    tips: [
      field('Keep state variables, parameters and initial conditions apart. Each plays a different role in the experiment.'),
      style('Write the update rule as a function next(N, params). Then the loop, the tests and the plots can all use it.'),
      field('Test against the closed form: geometric growth N0 · R^t must match the simulation exactly.'),
      field('Long-run behaviour depends on the parameters: in the Ricker model, large r turns a steady state into cycles and chaos.'),
    ],
  },
  'update-order': {
    learn: 'why multi-variable models must update all variables simultaneously',
    tips: [
      disaster('Updating hosts, then computing parasitoids from the new host numbers. It compiles, runs and gives plausible but wrong dynamics.'),
      style('Compute every new value from the old state, then replace the whole state at once.'),
      field('The equations of a discrete-time model define a simultaneous update unless the biology says one process happens first.'),
    ],
  },
  'matrix-models': {
    learn: 'to project a stage-structured population and find its growth rate λ',
    tips: [
      field('Survival and transition entries leaving a stage must sum to at most 1. A column summing to more creates individuals from nothing.'),
      rule('Write the product into a new vector. Updating in place uses already-updated stages for later rows.'),
      deep('Normalise the vector at every step of the power method, or it overflows or underflows long before it converges.'),
      field('λ > 1 means long-term growth, but transient dynamics can make the first generations look very different.'),
    ],
  },
  // ── Numerical integration ────────────────────────────────────────────────
  odes: {
    learn: 'to read an ODE model as rates of change and represent it in C++',
    tips: [
      field('Keep the model (the ODE) separate from the method (Euler, RK4). Changing the method must never change the biology.'),
      rule('Any higher-order ODE becomes a system of first-order ones: introduce the velocity as a new variable.'),
      style('Write the right-hand side as one function that returns all derivatives from the current state.'),
    ],
  },
  'euler-method': {
    learn: 'to approximate an ODE step by step with Euler\'s method',
    tips: [
      field('Euler lags behind exponential growth: each step uses the slope at its start, which is the smallest slope of the step.'),
      disaster('Updating S before computing the infection term that uses S. Compute every derivative first, then update.'),
      style('Decouple output times from the step: record at fixed times, whatever step size you choose.'),
      rule('Shorten the last step so you land exactly on the end time.'),
    ],
  },
  'runge-kutta': {
    learn: 'to integrate ODEs accurately with Heun\'s method and RK4',
    tips: [
      rule('RK4 evaluates the right-hand side four times per step. Compare methods by evaluations, not by steps.'),
      field('Halving the step reduces RK4\'s error about sixteenfold, Euler\'s only twofold.'),
      style('Give RK4 the same interface as your Euler stepper, so swapping methods is a one-line change.'),
    ],
  },
  'numerical-error': {
    learn: 'how large the numerical error is, and how to tell it from real model behaviour',
    tips: [
      field('Halve the step and compare. If the answer moves noticeably, the step was too large.'),
      rule('Euler on dN/dt = -kN is stable only for h < 2/k. Beyond that, the solution oscillates and explodes.'),
      deep('Below a certain step size, round-off error grows again. Smaller is not always better.'),
      field('Check a conserved quantity, such as S + I + R, to catch errors that look like biology.'),
    ],
  },
  'adaptive-step-size': {
    learn: 'to let the integrator choose its own step size from an error estimate',
    tips: [
      rule('Combine absolute and relative tolerances, so that values near zero and large values are both controlled.'),
      style('Use a safety factor and cap how fast the step may grow or shrink, or the step size oscillates.'),
      disaster('No minimum step. A stiff model drives the step towards zero and the program never finishes.'),
      deep('For real work, use a tested library pair such as Dormand–Prince (RK45), available in Boost.Odeint.'),
    ],
  },
  // ── Stochastic modelling ─────────────────────────────────────────────────
  'pseudo-random-numbers': {
    learn: 'why models need chance, and how computers make reproducible random numbers',
    tips: [
      rule('A default-constructed std::mt19937 always starts from the same seed, so every run gives the same numbers.'),
      disaster('rand() % n. The generator is weak and the modulo favours small values.'),
      field('Record the seed with the results. A stochastic result you cannot reproduce cannot be checked.'),
      field('Use a stochastic model when chance matters for the question: small populations, extinction, or variation between replicates.'),
    ],
  },
  'random-library': {
    learn: 'to draw random values from the right distribution with engines and distribution objects',
    tips: [
      rule('std::exponential_distribution takes a rate, not a mean. A mean waiting time of 5 days is a rate of 0.2.'),
      rule('std::normal_distribution takes the standard deviation, not the variance.'),
      rule('uniform_int_distribution(a, b) includes both a and b.'),
      disaster('Creating a new engine with the same seed inside a function. Every call returns the same "random" number.'),
    ],
  },
  'weighted-lottery': {
    learn: 'to choose an event or a parent with probability proportional to its weight',
    tips: [
      style('std::discrete_distribution draws an index with probability proportional to its weight, with no hand-written loop.'),
      disaster('All weights zero. Handle that case before drawing; it usually means nothing can happen.'),
      field('Drawing the parents of each new generation with equal weights is neutral genetic drift: the Wright–Fisher model.'),
    ],
  },
  gillespie: {
    learn: 'to simulate a process exactly, one event at a time, with Gillespie\'s direct method',
    tips: [
      rule('The waiting time to the next event is exponential, with the sum of all propensities as its rate.'),
      disaster('A total propensity of zero. The process is absorbed; stop instead of drawing an infinite waiting time.'),
      field('The state at an output time is the state before the next event. Record on a regular grid, not only at event times.'),
      deep('For very large populations, events become so frequent that tau-leaping or an ODE may be the better tool.'),
    ],
  },
  'stochastic-replicates': {
    learn: 'to run and summarise many replicates of a stochastic model',
    tips: [
      field('One stochastic run is a sample of size one. Report the spread across replicates, not just one trajectory.'),
      rule('The standard error of a mean is the standard deviation divided by √n. Four times the replicates halves it.'),
      field('In nonlinear models the mean of the stochastic runs need not follow the deterministic model.'),
      style('Give every replicate its own recorded seed, so any single run can be repeated.'),
    ],
  },
  // ── Individual-based modelling ───────────────────────────────────────────
  'individual-based-models': {
    learn: 'when a question needs individuals, and how their rules relate to aggregate models',
    tips: [
      field('Use individuals when variation between them, local interactions or small numbers matter. Otherwise an ODE may do.'),
      style('Write the rules as a biologist would describe behaviour, then translate each rule into a function.'),
      field('With well-mixed individuals and many of them, an IBM should agree with its mean-field model. Use that as a test.'),
    ],
  },
  'ibm-design': {
    learn: 'to design the individuals, population and rules of an individual-based model',
    tips: [
      disaster('Appending newborns while looping over the population. They may reproduce in their birth step, and the loop may break.'),
      rule('On a torus, wrap coordinates with ((x % n) + n) % n so that negative positions land inside the grid.'),
      style('Build the model one rule at a time: movement, then death, then birth. Test each before adding the next.'),
      field('A tiny population you can follow by hand is the best first test of an IBM.'),
    ],
  },
  'ibm-scheduling': {
    learn: 'how the order in which individuals act shapes the outcome, and how to schedule them',
    tips: [
      field('Always visiting individuals in the same order gives the first in the list a systematic advantage.'),
      rule('Shuffle with std::shuffle and your engine. std::random_shuffle was removed in C++17.'),
      deep('Event-driven schedules keep each individual\'s next event time in a priority queue ordered by earliest time.'),
    ],
  },
  'emergence-and-validation': {
    learn: 'to recognise emergent patterns and validate an IBM against its mean-field limit',
    tips: [
      field('Clustering is measured against a null expectation, such as a random arrangement with the same density.'),
      field('Local crowding can lower abundance below the mean-field prediction: neighbours compete more than the average suggests.'),
      deep('Jensen\'s inequality explains why variation in crowding changes the average outcome of a nonlinear rule.'),
      style('Rerun with another seed and another schedule. A pattern that disappears was not robust.'),
    ],
  },
  // ── Scientific inference ─────────────────────────────────────────────────
  'simulation-experiments': {
    learn: 'to design simulation experiments the way you would design a lab experiment',
    tips: [
      field('Start from the question: which response do you measure, which factors do you vary, and over which levels?'),
      style('A Latin hypercube covers many parameters with few runs. A full factorial grows explosively with each factor.'),
      rule('Derive a distinct seed for every replicate with std::seed_seq, and write it to the output.'),
      field('Write down the result that would surprise you before you run the experiment.'),
    ],
  },
  'analysing-output': {
    learn: 'to summarise replicate output correctly in R or Python',
    tips: [
      style('Write long-format output: one row per replicate, time and variable. It summarises in one line with dplyr or pandas.'),
      rule('The standard deviation describes the spread of runs; the standard error describes how well you know the mean.'),
      field('Quantile bands show what a single population may do; a confidence interval shows what the average does.'),
    ],
  },
  'sensitivity-analysis': {
    learn: 'to measure how strongly results depend on each parameter',
    tips: [
      rule('A central difference, (f(p + h) - f(p - h)) / 2h, is more accurate than a one-sided one for the same h.'),
      field('The elasticities of λ to all the entries of a projection matrix sum to one, so they compare directly.'),
      deep('Local sensitivity misses interactions. Morris screening or Sobol indices explore the whole parameter range.'),
      disaster('Varying a parameter beyond any biologically plausible value. Choose ranges you can defend from data.'),
    ],
  },
  'verification-and-validation': {
    learn: 'to check that the code matches the model, and that the model matches nature',
    tips: [
      field('Verification asks "did I build the model right?"; validation asks "did I build the right model?"'),
      style('A self-checking test program that compares with known results is worth more than looking at plots.'),
      field('Fitting data well does not validate a model on its own. Test it on data it was not fitted to.'),
    ],
  },
  'interpreting-results': {
    learn: 'to turn simulation output into conclusions that hold up',
    tips: [
      field('Describe a pattern with numbers: "the peak falls from 830 to 410", not "the peak decreases".'),
      disaster('Reporting a numerical artefact as biology. Check step size, schedule and seed before explaining a pattern.'),
      field('Qualify every conclusion with the assumptions behind it, and say what the model cannot tell you.'),
    ],
  },
  'testing-and-reproducibility': {
    learn: 'to test model code and make every result reproducible',
    tips: [
      style('Test the smallest pieces first: an update rule with a hand-computed answer is the best unit test.'),
      field('Record the commit, compiler, flags, seed and parameters with every output. Without them, a result cannot be rerun.'),
      style('Tag the version of the code used in a paper with git tag, so readers can rebuild exactly that.'),
      disaster('Fixing a bug and silently changing published results. A regression test tells you when outputs move.'),
    ],
  },
  'parallel-replicates': {
    learn: 'to run replicates in parallel without mixing up their random numbers',
    tips: [
      disaster('Sharing one random engine between threads. That is a data race, and the results are no longer reproducible.'),
      style('Give each replicate its own engine with its own recorded seed. Then the scheduling of the work cannot change the results.'),
      shortcut('A shell loop over seeds is the simplest parallel program there is. For many runs, a cluster job array does the same at scale.'),
    ],
  },
};
