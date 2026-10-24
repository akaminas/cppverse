// Title: Geometric growth over generations
// Standard: C++17
// A for loop repeats the one-generation update, turning it into a
// simulation of the whole trajectory.

#include <iostream>

int main() {
    const double lambda = 1.5;   // growth factor per generation
    const int generations = 4;   // number of generations to simulate
    double N = 20.0;             // population size at generation 0

    std::cout << "t = 0  N = " << N << '\n';
    for (int t = 1; t <= generations; ++t) {
        N = lambda * N;
        std::cout << "t = " << t << "  N = " << N << '\n';
    }
    return 0;
}
