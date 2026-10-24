// Title: Storing a population trajectory in a vector
// Standard: C++17
// An insect population grows by 50 per cent per generation. Each new size
// is appended with push_back, so the whole trajectory is kept.

#include <cstddef>
#include <iostream>
#include <vector>

int main() {
    const double growthFactor = 1.5;  // offspring per individual per generation
    const int generations = 4;

    std::vector<double> N;            // empty: nothing stored yet
    N.push_back(40.0);                // generation 0

    for (int t = 0; t < generations; ++t) {
        N.push_back(growthFactor * N.back());
    }

    std::cout << "Stored " << N.size() << " values\n";
    for (std::size_t t = 0; t < N.size(); ++t) {
        std::cout << "generation " << t << ": " << N[t] << '\n';
    }
    return 0;
}
