// Title: Comparing floating-point values with a tolerance
// Standard: C++17
// 0.1 + 0.2 is not exactly 0.3 in binary floating point, so == reports
// false; a comparison with a tolerance gives the intended answer.

#include <cmath>
#include <iomanip>
#include <iostream>

int main() {
    const double eaten_by_ants = 0.1;     // proportion of seeds removed by ants
    const double eaten_by_rodents = 0.2;  // proportion removed by rodents
    const double removed = eaten_by_ants + eaten_by_rodents;

    std::cout << std::boolalpha;
    std::cout << "removed == 0.3:   " << (removed == 0.3) << '\n';
    std::cout << "removed (17 digits): " << std::setprecision(17) << removed << '\n';

    const double tolerance = 1e-9;
    const bool close = std::abs(removed - 0.3) <= tolerance;
    std::cout << "within tolerance: " << close << '\n';
    return 0;
}
