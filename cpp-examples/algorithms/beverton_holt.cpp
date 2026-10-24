// Title: Beverton–Holt population model
// Standard: C++17
// A discrete-time model of a population with compensatory density dependence:
//     N(t+1) = R0 * N(t) / (1 + N(t) / M)
// Usage:  beverton_holt [R0] [M] [N0] [generations]
// Output: CSV with the columns generation,N on standard output.

#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

struct Parameters {
    double R0 = 2.2;       // growth factor per generation at low density
    double M = 40.0;       // density at which the growth factor is halved
    double N0 = 5.0;       // initial population size
    int generations = 30;  // number of generations to simulate
};

// The update rule: one generation of the model.
double nextGeneration(double N, const Parameters& p) {
    return p.R0 * N / (1.0 + N / p.M);
}

// Run the model and keep every state: N(0), N(1), ..., N(generations).
std::vector<double> simulate(const Parameters& p) {
    std::vector<double> trajectory;
    trajectory.reserve(static_cast<std::size_t>(p.generations) + 1);
    double N = p.N0;
    trajectory.push_back(N);
    for (int t = 0; t < p.generations; ++t) {
        N = nextGeneration(N, p);
        trajectory.push_back(N);
    }
    return trajectory;
}

int main(int argc, char* argv[]) {
    Parameters p;
    if (argc > 1) p.R0 = std::stod(argv[1]);
    if (argc > 2) p.M = std::stod(argv[2]);
    if (argc > 3) p.N0 = std::stod(argv[3]);
    if (argc > 4) p.generations = std::stoi(argv[4]);

    if (p.R0 <= 0.0 || p.M <= 0.0 || p.N0 < 0.0 || p.generations < 0) {
        std::cerr << "error: R0 and M must be positive, N0 and generations non-negative\n";
        return EXIT_FAILURE;
    }

    const std::vector<double> N = simulate(p);
    std::cout << "generation,N\n" << std::setprecision(12);
    for (std::size_t t = 0; t < N.size(); ++t) {
        std::cout << t << ',' << N[t] << '\n';
    }
    return EXIT_SUCCESS;
}
