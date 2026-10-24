// Title: A silent error in a survival estimate
// Standard: C++17
// Both versions compile without a warning and run without crashing, but the
// first divides two integers, so the estimated survival is truncated to 0.

#include <iomanip>
#include <iostream>

int main() {
    const int ringed = 48;         // bats ringed in autumn
    const int recaptured = 30;     // ringed bats found again the next spring
    const double colony = 1200.0;  // bats in the colony this autumn

    const double survivalBug = recaptured / ringed;  // int / int: 30 / 48 is 0
    const double survival = static_cast<double>(recaptured) / ringed;

    std::cout << std::fixed << std::setprecision(3);
    std::cout << "survival (bug):   " << survivalBug << '\n';
    std::cout << "survival (fixed): " << survival << '\n';
    std::cout << std::setprecision(0);
    std::cout << "bats next spring (bug):   " << colony * survivalBug << '\n';
    std::cout << "bats next spring (fixed): " << colony * survival << '\n';
    return 0;
}
