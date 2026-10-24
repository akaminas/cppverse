// Title: Short-circuit evaluation as a guard
// Standard: C++17
// && evaluates its right operand only when the left one is true, so a
// test of the sample size can protect the division that follows it.

#include <iostream>

int main() {
    int nests_a = 8;                // nests found in plot A (normally read from data)
    const double eggs_a = 30.0;     // eggs counted in those nests
    int nests_b = 0;                // no nests found in plot B
    const double eggs_b = 0.0;

    if (nests_a > 0 && eggs_a / nests_a > 3.0) {
        std::cout << "Plot A: large clutches (mean " << eggs_a / nests_a << ")\n";
    } else {
        std::cout << "Plot A: no evidence of large clutches\n";
    }

    if (nests_b > 0 && eggs_b / nests_b > 3.0) {
        std::cout << "Plot B: large clutches (mean " << eggs_b / nests_b << ")\n";
    } else {
        std::cout << "Plot B: no evidence of large clutches\n";
    }
    return 0;
}
