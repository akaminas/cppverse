// Title: How fast a Beverton–Holt population approaches equilibrium
// Standard: C++17
// Prints each generation's population N, its distance K - N from the
// equilibrium K = (R0 - 1) M, and the ratio of successive distances. Near K
// the ratio approaches 1 / R0: the gap shrinks by that factor every generation.

#include <cstdlib>
#include <iomanip>
#include <iostream>

int main() {
    const double R0 = 2.2;   // growth factor per generation at low density
    const double M = 40.0;   // density at which the growth factor is halved
    const double K = (R0 - 1.0) * M;
    double N = 5.0;
    double gap = K - N;

    std::cout << std::fixed << std::setprecision(4);
    std::cout << "generation,N,gap,ratio\n";
    std::cout << 0 << ',' << N << ',' << gap << ",\n";
    for (int t = 1; t <= 12; ++t) {
        N = R0 * N / (1.0 + N / M);
        const double newGap = K - N;
        std::cout << t << ',' << N << ',' << newGap << ',' << newGap / gap << '\n';
        gap = newGap;
    }
    std::cout << "1/R0," << 1.0 / R0 << '\n';
    return EXIT_SUCCESS;
}
