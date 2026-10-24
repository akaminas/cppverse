// Title: Constraining a template with a concept
// Standard: C++20
// std::floating_point accepts only floating-point types (float, double,
// long double), so a call with an int argument is rejected by name.

#include <concepts>
#include <iomanip>
#include <iostream>

template <std::floating_point T>
T survivalOver(T dailySurvival, int days) {
    T s = 1;
    for (int d = 0; d < days; ++d) {
        s *= dailySurvival;
    }
    return s;
}

int main() {
    std::cout << std::fixed << std::setprecision(4);
    std::cout << "30-day survival at 0.98 per day: " << survivalOver(0.98, 30) << '\n';
    // survivalOver(1, 30);  // error: int does not satisfy std::floating_point
    return 0;
}
