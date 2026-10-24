// Title: Precedence and associativity decide the grouping
// Standard: C++17
// The same numbers and operators give different results depending on how
// they are grouped. Parentheses make the intended grouping explicit.

#include <iostream>

int main() {
    const double N = 50.0;    // population size
    const double K = 200.0;   // carrying capacity
    const double r = 0.4;     // intrinsic growth rate per year

    std::cout << "r * N * (1 - N / K) = " << r * N * (1 - N / K) << '\n';
    std::cout << "r * N * 1 - N / K   = " << r * N * 1 - N / K << '\n';

    std::cout << "4 * 1 / 2    = " << 4 * 1 / 2 << '\n';
    std::cout << "1 / 2 * 4    = " << 1 / 2 * 4 << '\n';
    std::cout << "20 - 5 - 3   = " << 20 - 5 - 3 << '\n';
    std::cout << "20 - (5 - 3) = " << 20 - (5 - 3) << '\n';
    return 0;
}
