// Title: Nested loops: one simulation per growth factor
// Standard: C++17
// The outer loop chooses a growth factor; the inner loop runs a complete
// simulation with it, starting afresh on every pass of the outer loop.

#include <iomanip>
#include <iostream>

int main() {
    const int generations = 10;
    std::cout << std::fixed << std::setprecision(2);

    for (int k = 0; k < 3; ++k) {
        const double lambda = 0.9 + 0.1 * k;   // 0.9, 1.0, 1.1
        double N = 100.0;                       // every run starts from 100
        for (int t = 1; t <= generations; ++t) {
            N = lambda * N;
        }
        std::cout << "lambda = " << lambda << "  N after " << generations
                  << " generations = " << N << '\n';
    }
    return 0;
}
