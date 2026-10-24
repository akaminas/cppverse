// Title: The same header reached twice
// Standard: C++17
// Expect: compile-error
// stage_counts.hpp is included directly and again through census.hpp. Without
// an include guard the compiler sees the definition of StageCounts twice.

#include "stage_counts.hpp"
#include "census.hpp"  // includes stage_counts.hpp a second time

#include <iostream>

int main() {
    const StageCounts plot{12, 30};
    std::cout << plot.juveniles + plot.adults << '\n';
    return 0;
}
