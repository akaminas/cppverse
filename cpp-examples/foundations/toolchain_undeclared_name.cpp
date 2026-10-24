// Title: A misspelt variable name
// Standard: C++17
// Expect: compile-error
// Line 11 uses a name that was never declared (a typo), so compilation stops.

#include <iostream>

int main() {
    const double meanTemperature = 18.0;
    const double baseTemperature = 10.0;
    std::cout << meanTempreature - baseTemperature << '\n';
    return 0;
}
