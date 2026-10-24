// Title: Calling a function before it is declared
// Standard: C++17
// Expect: compile-error
// main calls next_generation, but the compiler has not seen it yet.

#include <iostream>

int main() {
    std::cout << next_generation(20.0, 1.5) << '\n';
    return 0;
}

double next_generation(double N, double lambda) {
    return lambda * N;
}
