// Title: Iterating to equilibrium with do-while
// Standard: C++17
// The change between generations can only be measured after one step, so
// the test comes after the body: a do-while loop always runs at least once.

#include <cmath>
#include <iomanip>
#include <iostream>

int main() {
    const double R0 = 2.0;          // growth factor at low density
    const double M = 50.0;          // density at which growth is halved
    const double tolerance = 0.01;  // stop when N changes by less than this
    const int max_generations = 1000;

    double N = 5.0;
    double change = 0.0;
    int t = 0;
    do {
        const double next = R0 * N / (1.0 + N / M);   // Beverton-Holt model
        change = std::abs(next - N);
        N = next;
        ++t;
    } while (change >= tolerance && t < max_generations);

    std::cout << std::fixed << std::setprecision(3);
    std::cout << "Settled after " << t << " generations at N = " << N << '\n';
    std::cout << "Equilibrium (R0 - 1) M = " << (R0 - 1.0) * M << '\n';
    return 0;
}
