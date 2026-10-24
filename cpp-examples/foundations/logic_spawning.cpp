// Title: Naming conditions with bool
// Standard: C++17
// Relational operators produce bool values; && and ! combine them.
// std::boolalpha prints bool values as true and false instead of 1 and 0.

#include <iostream>

int main() {
    const double water_temperature = 13.5;  // degrees C
    const double day_length = 14.5;         // hours of daylight
    const bool pond_dry = false;

    const bool warm_enough = water_temperature >= 12.0;
    const bool long_days = day_length > 14.0;
    const bool can_spawn = warm_enough && long_days && !pond_dry;

    std::cout << "warm enough: " << warm_enough << '\n';
    std::cout << std::boolalpha;
    std::cout << "warm enough: " << warm_enough << '\n';
    std::cout << "long days:   " << long_days << '\n';
    std::cout << "can spawn:   " << can_spawn << '\n';

    if (can_spawn) {
        std::cout << "Spawning begins\n";
    }
    return 0;
}
