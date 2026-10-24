// Title: A model, an algorithm and a program
// Standard: C++17
// Model: a population grows by the same factor lambda every year,
// N(t+1) = lambda * N(t). Algorithm: start from N(0) and apply the update
// once per year. This program is one implementation of that algorithm.

#include <iostream>

int main() {
    const double lambda = 1.5;   // growth factor per year (illustrative)
    double population = 40.0;    // individuals in year 0

    std::cout << "year 0: " << population << '\n';
    for (int year = 1; year <= 3; ++year) {
        population = lambda * population;
        std::cout << "year " << year << ": " << population << '\n';
    }
    return 0;
}
