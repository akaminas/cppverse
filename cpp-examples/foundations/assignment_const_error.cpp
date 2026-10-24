// Title: A const variable cannot be assigned
// Standard: C++17
// Expect: compile-error
// Line 11 tries to change a constant, and the compiler refuses.

#include <iostream>

int main() {
    const double hatchingProbability = 0.8;
    std::cout << hatchingProbability << '\n';
    hatchingProbability = 0.9;
    return 0;
}
