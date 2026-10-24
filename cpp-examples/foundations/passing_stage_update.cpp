// Title: Updating a stage-structured state in place
// Standard: C++17
// step receives the juvenile and adult numbers by reference and replaces
// them with next year's values. Both new values are computed from the old
// ones before either variable is overwritten.

#include <iostream>

void step(double& juveniles, double& adults, double fecundity,
          double juvenile_survival, double adult_survival) {
    const double new_juveniles = fecundity * adults;
    const double new_adults = juvenile_survival * juveniles + adult_survival * adults;
    juveniles = new_juveniles;
    adults = new_adults;
}

int main() {
    double juveniles = 20.0;
    double adults = 10.0;
    std::cout << "year 0: J = " << juveniles << ", A = " << adults << '\n';
    for (int year = 1; year <= 3; ++year) {
        step(juveniles, adults, 3.0, 0.25, 0.5);
        std::cout << "year " << year << ": J = " << juveniles << ", A = " << adults << '\n';
    }
    return 0;
}
