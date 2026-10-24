// Title: pi from <numbers>
// Standard: C++20
// C++20 provides mathematical constants such as std::numbers::pi, so pi no
// longer needs to be typed by hand or computed as std::acos(-1.0).

#include <cmath>
#include <iomanip>
#include <iostream>
#include <numbers>

int main() {
    const double radius = 5.64;   // metres: a circular plot of about 100 m^2
    const double area = std::numbers::pi * radius * radius;

    const double turnDegrees = 45.0;   // turning angle of a moving animal
    const double turnRadians = turnDegrees * std::numbers::pi / 180.0;

    std::cout << std::fixed << std::setprecision(2);
    std::cout << "plot area: " << area << " m^2\n";
    std::cout << "45 degrees = " << turnRadians << " radians\n";
    std::cout << "cos(45 degrees) = " << std::cos(turnRadians) << '\n';
    return 0;
}
