// Title: Update order in a ring of habitat patches
// Standard: C++17
// Nearest-neighbour dispersal around a ring of patches. The correct update
// reads every patch from the old state. The in-place loop reads a neighbour
// that has already been updated, so symmetric dispersal drifts to one side.

#include <cstddef>
#include <iomanip>
#include <iostream>
#include <vector>

using Densities = std::vector<double>;

// Correct: every new density is computed from the old vector.
Densities disperse(const Densities& old, double m) {
    const std::size_t k = old.size();
    Densities next(k, 0.0);
    for (std::size_t i = 0; i < k; ++i) {
        const double left = old[(i + k - 1) % k];
        const double right = old[(i + 1) % k];
        next[i] = (1.0 - m) * old[i] + 0.5 * m * (left + right);
    }
    return next;
}

// Bug: when patch i is updated, patch i - 1 already holds its NEW density.
void disperseInPlace(Densities& n, double m) {
    const std::size_t k = n.size();
    for (std::size_t i = 0; i < k; ++i) {
        const double left = n[(i + k - 1) % k];
        const double right = n[(i + 1) % k];
        n[i] = (1.0 - m) * n[i] + 0.5 * m * (left + right);
    }
}

void print(const char* label, const Densities& n) {
    double total = 0.0;
    std::cout << label;
    for (double v : n) {
        std::cout << std::setw(6) << v;
        total += v;
    }
    std::cout << "   total " << total << '\n';
}

int main() {
    const double m = 0.4;          // fraction of each patch that disperses per generation
    Densities correct(9, 0.0);     // nine patches arranged in a ring
    correct[4] = 100.0;            // all individuals released in the middle patch
    Densities buggy = correct;

    std::cout << std::fixed << std::setprecision(1);
    for (int t = 1; t <= 3; ++t) {
        correct = disperse(correct, m);
        disperseInPlace(buggy, m);
    }
    print("simultaneous ", correct);
    print("in place     ", buggy);
    return 0;
}
