// Title: Variables of four basic types
// Standard: C++17
// One record of a plant in a monitoring plot. Each value is stored in a
// variable whose type matches the kind of quantity: a count, a measurement,
// a yes/no state and a one-letter code.

#include <iostream>

int main() {
    const int leafCount = 14;        // a count: whole numbers only
    const double height = 23.5;      // a measurement, in centimetres
    const bool isFlowering = true;   // a yes/no state
    const char growthForm = 'H';     // a code: H = herb, S = shrub, T = tree

    std::cout << "leaves: " << leafCount << '\n';
    std::cout << "height (cm): " << height << '\n';
    std::cout << "flowering: " << isFlowering << '\n';
    std::cout << "flowering: " << std::boolalpha << isFlowering << '\n';
    std::cout << "growth form: " << growthForm << '\n';
    return 0;
}
