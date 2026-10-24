// Title: A small program to build and run
// Standard: C++17
// Growing degree-days for one day: the mean of the daily maximum and minimum
// temperature minus a base temperature below which a plant does not develop.

#include <iostream>

int main() {
    const double baseTemperature = 10.0;  // degrees C
    const double maxTemperature = 24.0;   // today's maximum, degrees C
    const double minTemperature = 12.0;   // today's minimum, degrees C

    const double meanTemperature = (maxTemperature + minTemperature) / 2.0;
    std::cout << "Mean temperature: " << meanTemperature << " C\n";
    std::cout << "Degree-days today: " << meanTemperature - baseTemperature << '\n';
    return 0;
}
