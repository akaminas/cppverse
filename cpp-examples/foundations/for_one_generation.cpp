// Title: Geometric growth, one generation at a time by hand
// Standard: C++17
// Without a loop, every generation needs its own copy of the update rule.

#include <iostream>

int main() {
    const double lambda = 1.5;   // growth factor per generation
    double N = 20.0;             // population size at generation 0

    N = lambda * N;              // generation 1
    std::cout << "N = " << N << '\n';
    N = lambda * N;              // generation 2
    std::cout << "N = " << N << '\n';
    N = lambda * N;              // generation 3
    std::cout << "N = " << N << '\n';
    return 0;
}
