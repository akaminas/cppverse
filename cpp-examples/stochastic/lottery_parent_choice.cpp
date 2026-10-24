// Title: Choosing mothers in proportion to their eggs
// Standard: C++17
// std::discrete_distribution returns index i with probability w_i / sum(w).
// The weights are the egg counts of five females. Assigning many offspring
// to mothers shows each female's share approaching her share of the eggs;
// the female with no eggs is never chosen.
// Usage:  lottery_parent_choice [seed]

#include <cstddef>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <random>
#include <string>
#include <vector>

int main(int argc, char* argv[]) {
    const std::uint64_t seed = argc > 1 ? std::stoull(argv[1]) : 5150ULL;
    std::mt19937_64 rng(seed);
    std::cout << "seed " << seed << '\n';

    const std::vector<double> eggs{12.0, 30.0, 0.0, 8.0, 20.0};
    // Built from an iterator range: the distribution copies the weights.
    std::discrete_distribution<std::size_t> pickMother(eggs.begin(), eggs.end());

    const int offspring = 7000;
    std::vector<int> count(eggs.size(), 0);
    for (int k = 0; k < offspring; ++k) ++count[pickMother(rng)];

    const std::vector<double> p = pickMother.probabilities();  // w_i / sum(w)
    std::cout << std::fixed << std::setprecision(3);
    std::cout << "female  eggs  P(mother)  observed share\n";
    for (std::size_t i = 0; i < eggs.size(); ++i) {
        std::cout << std::setw(6) << i << std::setw(6) << static_cast<int>(eggs[i])
                  << std::setw(11) << p[i]
                  << std::setw(16) << static_cast<double>(count[i]) / offspring << '\n';
    }

    // For a short, fixed list of weights, an initializer list is simplest.
    std::discrete_distribution<int> nestSite{1.0, 3.0};  // P(0) = 0.25, P(1) = 0.75
    std::cout << "nest site of the next female: "
              << (nestSite(rng) == 0 ? "ground" : "shrub") << '\n';
    return 0;
}
