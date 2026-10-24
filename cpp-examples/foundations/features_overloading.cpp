// Title: Two overloads of total_biomass
// Standard: C++17
// Both functions answer the same question, so they share a name; at each
// call the compiler chooses the one whose parameters match the arguments.

#include <cstddef>
#include <iostream>
#include <vector>

// Biomass of n individuals that all have the same mass
double total_biomass(int n, double mass_each) {
    return n * mass_each;
}

// Biomass of individuals that were weighed one by one
double total_biomass(const std::vector<double>& masses) {
    double total = 0.0;
    for (std::size_t i = 0; i < masses.size(); ++i) {
        total += masses[i];
    }
    return total;
}

int main() {
    const std::vector<double> weighed{2.5, 3.0, 1.75, 2.25};   // grams
    std::cout << "estimated: " << total_biomass(40, 2.5) << " g\n";
    std::cout << "weighed:   " << total_biomass(weighed) << " g\n";
    return 0;
}
