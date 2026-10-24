// Title: Generations until a population falls below a threshold
// Standard: C++17
// A while loop runs for as long as its condition holds, so the number of
// passes need not be known in advance. A cap on the number of generations
// guarantees that the loop ends even if the population never declines.

#include <iomanip>
#include <iostream>

int main() {
    const double lambda = 0.8;          // growth factor per generation
    const double threshold = 10.0;      // quasi-extinction threshold
    const int max_generations = 1000;   // safety cap

    double N = 120.0;
    int t = 0;
    while (N >= threshold && t < max_generations) {
        N = lambda * N;
        ++t;
    }

    std::cout << std::fixed << std::setprecision(2);
    if (N < threshold) {
        std::cout << "Below the threshold after " << t << " generations (N = " << N << ")\n";
    } else {
        std::cout << "Still above the threshold after " << t << " generations\n";
    }
    return 0;
}
