// Title: A first population simulation
// Standard: C++17
// Five generations of the Beverton–Holt model, printed as they are computed.

#include <iomanip>
#include <iostream>

int main() {
    const double R0 = 2.2;      // offspring per individual at low density
    const double M = 40.0;      // density at which the growth factor is halved
    const int generations = 5;  // how many generations to simulate
    double N = 5.0;             // the state: population size, starting in generation 0

    std::cout << std::fixed << std::setprecision(2);
    std::cout << "generation 0: N = " << N << '\n';
    for (int t = 1; t <= generations; ++t) {
        N = R0 * N / (1.0 + N / M);
        std::cout << "generation " << t << ": N = " << N << '\n';
    }
    return 0;
}
