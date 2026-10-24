// Title: An extinction check after one winter
// Standard: C++17
// An if-else statement chooses between two actions: report quasi-extinction
// when fewer than one individual is expected, otherwise report persistence.

#include <iostream>

int main() {
    const double survival = 0.3;    // fraction of individuals surviving the winter
    const double fecundity = 2.5;   // offspring per survivor in spring
    double N = 1.2;                 // expected population size in autumn

    N = N * survival * fecundity;
    std::cout << "Expected size next autumn: " << N << '\n';

    if (N < 1.0) {
        std::cout << "Fewer than one individual: treat as extinct\n";
    } else {
        std::cout << "The population persists\n";
    }
    return 0;
}
