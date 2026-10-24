// Title: Leaving nested loops with a flag
// Standard: C++17
// The outer loop tries increasing harvest percentages; the inner loop
// simulates 50 years of harvesting. break leaves only the inner loop, so a
// flag tells the outer loop to stop once a harvest causes a collapse.

#include <iostream>

int main() {
    const double R0 = 2.5;   // growth factor at low density (Beverton-Holt)
    const double M = 40.0;   // density at which growth is halved
    const int years = 50;

    bool collapsed = false;
    for (int percent = 10; percent <= 90 && !collapsed; percent += 10) {
        const double harvest = percent / 100.0;
        double N = (R0 - 1.0) * M;   // start at the unharvested equilibrium
        for (int year = 1; year <= years; ++year) {
            N = (1.0 - harvest) * (R0 * N / (1.0 + N / M));
            if (N < 1.0) {
                std::cout << "Harvesting " << percent << "% collapses the population in year "
                          << year << '\n';
                collapsed = true;
                break;   // leaves the inner loop only
            }
        }
        if (!collapsed) {
            std::cout << "Harvesting " << percent << "% is sustained for " << years << " years\n";
        }
    }
    return 0;
}
