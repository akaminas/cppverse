// Title: How a weighted lottery works
// Standard: C++17
// The cumulative sums of the weights split [0, total) into one interval per
// option, each as wide as its weight. A uniform number u in [0, 1), scaled
// by the total, lands in interval i with probability w_i / total. Fixed
// values of u are used here so that every line can be checked by hand.

#include <cstddef>
#include <iostream>
#include <vector>

// Index of the interval that contains u * total, found by a linear scan.
// Requires at least one weight, all weights >= 0, and a positive total.
std::size_t pickIndex(const std::vector<double>& weights, double u) {
    double total = 0.0;
    for (const double w : weights) total += w;
    const double target = u * total;
    double cumulative = 0.0;
    for (std::size_t i = 0; i < weights.size(); ++i) {
        cumulative += weights[i];
        if (target < cumulative) return i;
    }
    // Rounding can leave target just above the last sum: take the last
    // option that has a positive weight.
    std::size_t last = weights.size() - 1;
    while (last > 0 && weights[last] == 0.0) --last;
    return last;
}

int main() {
    // Eggs laid by five females; female 2 laid none.
    const std::vector<double> eggs{12.0, 30.0, 0.0, 8.0, 20.0};

    double cumulative = 0.0;
    for (std::size_t i = 0; i < eggs.size(); ++i) {
        std::cout << "female " << i << ": weight " << eggs[i] << ", interval ["
                  << cumulative << ", " << cumulative + eggs[i] << ")\n";
        cumulative += eggs[i];
    }

    for (const double u : {0.10, 0.30, 0.55, 0.60, 0.65, 0.80, 0.999}) {
        std::cout << "u = " << u << ", target " << u * cumulative << " -> female "
                  << pickIndex(eggs, u) << '\n';
    }
    return 0;
}
