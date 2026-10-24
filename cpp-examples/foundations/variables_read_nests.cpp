// Title: Reading values from the keyboard
// Standard: C++17
// Reads the number of nests found and their mean clutch size, then prints
// the expected number of eggs. Type two numbers, pressing Enter after each.

#include <iostream>

int main() {
    int nests = 0;
    double meanClutchSize = 0.0;

    std::cout << "Number of nests: ";
    std::cin >> nests;
    std::cout << "Mean clutch size: ";
    std::cin >> meanClutchSize;

    std::cout << "Expected number of eggs: " << nests * meanClutchSize << '\n';
    return 0;
}
