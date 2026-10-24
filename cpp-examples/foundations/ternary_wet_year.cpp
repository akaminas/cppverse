// Title: Choosing a value with the conditional operator
// Standard: C++17
// condition ? a : b is an expression, so it can initialise a const variable
// and choose between two pieces of text inside an output statement.

#include <iostream>

int main() {
    const double rainfall = 640.0;   // millimetres this year
    const double growth_factor = rainfall > 600.0 ? 1.3 : 0.8;
    std::cout << "Growth factor: " << growth_factor << '\n';

    const int seedlings_a = 1;
    const int seedlings_b = 4;
    std::cout << "Plot A: " << seedlings_a
              << (seedlings_a == 1 ? " seedling\n" : " seedlings\n");
    std::cout << "Plot B: " << seedlings_b
              << (seedlings_b == 1 ? " seedling\n" : " seedlings\n");
    return 0;
}
