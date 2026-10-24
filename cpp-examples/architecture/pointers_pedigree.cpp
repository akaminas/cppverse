// Title: A pedigree stored as values, with parents referred to by index
// Standard: C++17
// Individuals live by value in one std::vector, and each parent is recorded as
// an index into that vector. Indices stay valid when the vector grows and
// reallocates; pointers or references to its elements would not.

#include <algorithm>
#include <cstddef>
#include <iostream>
#include <limits>
#include <string>
#include <utility>
#include <vector>

constexpr std::size_t kUnknown = std::numeric_limits<std::size_t>::max();  // no recorded parent

struct Individual {
    std::string ring;    // ring code of the bird
    std::size_t mother;  // index in the pedigree, or kUnknown for a founder
    std::size_t father;
};

using Pedigree = std::vector<Individual>;

Individual founder(std::string ring) {
    return {std::move(ring), kUnknown, kUnknown};
}

// Number of generations back to the most distant founder.
int depth(const Pedigree& ped, std::size_t i) {
    int d = 0;
    if (ped[i].mother != kUnknown) d = std::max(d, 1 + depth(ped, ped[i].mother));
    if (ped[i].father != kUnknown) d = std::max(d, 1 + depth(ped, ped[i].father));
    return d;
}

void printMaternalLine(const Pedigree& ped, std::size_t i) {
    std::cout << ped[i].ring;
    for (std::size_t m = ped[i].mother; m != kUnknown; m = ped[m].mother) std::cout << " <- " << ped[m].ring;
    std::cout << '\n';
}

std::size_t addOffspring(Pedigree& ped, std::string ring, std::size_t mother, std::size_t father) {
    ped.push_back({std::move(ring), mother, father});  // may reallocate; indices survive
    return ped.size() - 1;
}

int main() {
    Pedigree ped{founder("F1"), founder("M1"), founder("F2"), founder("M2")};
    const std::size_t a = addOffspring(ped, "A", 0, 1);
    const std::size_t b = addOffspring(ped, "B", 2, 3);
    const std::size_t c = addOffspring(ped, "C", a, b);
    addOffspring(ped, "D", c, 3);
    for (std::size_t i = 0; i < ped.size(); ++i) {
        std::cout << ped[i].ring << ": depth " << depth(ped, i) << ", maternal line ";
        printMaternalLine(ped, i);
    }
    return 0;
}
