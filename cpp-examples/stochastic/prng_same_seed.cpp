// Title: The same seed gives the same sequence
// Standard: C++17
// A pseudo-random generator produces a fixed, deterministic sequence of
// numbers. Engines given the same seed produce identical numbers; another
// seed selects another sequence. Raw std::mt19937_64 output is fully
// specified by the C++ standard, so this output is the same everywhere.

#include <cstdint>
#include <iostream>
#include <random>

// Print the first `count` numbers of an engine started from `seed`.
void printFirstNumbers(std::uint64_t seed, int count) {
    std::mt19937_64 engine(seed);
    std::cout << "seed " << seed << ':';
    for (int i = 0; i < count; ++i) {
        std::cout << ' ' << engine();
    }
    std::cout << '\n';
}

int main() {
    printFirstNumbers(2718, 3);
    printFirstNumbers(2718, 3);  // same seed: the same three numbers
    printFirstNumbers(2719, 3);  // neighbouring seed: unrelated numbers
    return 0;
}
