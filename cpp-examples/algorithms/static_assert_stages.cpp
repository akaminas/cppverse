// Title: static_assert stops an inconsistent model at compile time
// Standard: C++17
// Expect: compile-error
// The model was extended to four stages, but the list of stage labels was not
// updated. The static_assert turns this into a compiler error.

#include <array>
#include <cstddef>
#include <iostream>

constexpr std::size_t numberOfStages = 4;
constexpr std::array<const char*, 3> stageLabels{"seedling", "rosette", "flowering"};

static_assert(stageLabels.size() == numberOfStages, "every stage needs exactly one label");

int main() {
    for (const char* label : stageLabels) std::cout << label << '\n';
    return 0;
}
