// Title: Developmental stage from accumulated degree-days
// Standard: C++17
// An else-if chain tests its conditions from the top and runs only the
// first branch whose condition is true. The thresholds are illustrative.

#include <iostream>

int main() {
    const double base = 10.0;              // no development below this (degrees C)
    const double mean_temperature = 17.5;  // mean daily temperature (degrees C)
    const int days = 30;

    const double degree_days = (mean_temperature - base) * days;
    std::cout << "Accumulated: " << degree_days << " degree-days\n";

    if (degree_days >= 400.0) {
        std::cout << "Stage: adult\n";
    } else if (degree_days >= 250.0) {
        std::cout << "Stage: pupa\n";
    } else if (degree_days >= 100.0) {
        std::cout << "Stage: larva\n";
    } else {
        std::cout << "Stage: egg\n";
    }
    return 0;
}
