// Title: A tour of <cmath>
// Standard: C++17
// Common mathematical functions from the standard library. They live in
// namespace std, take double arguments and return double results.

#include <cmath>
#include <iostream>

int main() {
    const double pi = 3.14159265358979323846;   // or std::acos(-1.0)

    std::cout << "exp(1)         = " << std::exp(1.0) << '\n';
    std::cout << "log(10)        = " << std::log(10.0) << '\n';
    std::cout << "log10(1000)    = " << std::log10(1000.0) << '\n';
    std::cout << "pow(2, 10)     = " << std::pow(2.0, 10.0) << '\n';
    std::cout << "sqrt(2)        = " << std::sqrt(2.0) << '\n';
    std::cout << "hypot(3, 4)    = " << std::hypot(3.0, 4.0) << '\n';
    std::cout << "sin(30)        = " << std::sin(30.0) << "  (30 radians)\n";
    std::cout << "sin(30 deg)    = " << std::sin(30.0 * pi / 180.0) << '\n';
    std::cout << "floor(-2.5)    = " << std::floor(-2.5) << '\n';
    std::cout << "ceil(-2.5)     = " << std::ceil(-2.5) << '\n';
    std::cout << "trunc(-2.5)    = " << std::trunc(-2.5) << '\n';
    std::cout << "round(-2.5)    = " << std::round(-2.5) << '\n';
    std::cout << "fmod(400, 365) = " << std::fmod(400.0, 365.0) << '\n';
    std::cout << "fmax(0, -3.2)  = " << std::fmax(0.0, -3.2) << '\n';
    std::cout << "abs(-3.2)      = " << std::abs(-3.2) << '\n';
    return 0;
}
