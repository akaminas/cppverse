// Title: When does Euler's method stay stable for first-order elimination?
// Standard: C++17
// For dC/dt = -k C, one Euler step multiplies C by g = 1 - h k. The program
// integrates 24 hours with several step sizes and classifies the behaviour
// of the numerical solution by g. The true solution always decays smoothly.

#include <cmath>
#include <initializer_list>
#include <iomanip>
#include <iostream>
#include <string>

std::string behaviour(double g) {
    if (g == 0.0) return "drops to zero in one step";
    if (g > 0.0 && g < 1.0) return "monotone decay";
    if (g > -1.0 && g < 0.0) return "decay with sign changes";
    if (g == -1.0) return "oscillation that never decays";
    return "oscillating growth";
}

int main() {
    const double k = 0.5;      // elimination rate (per hour)
    const double C0 = 10.0;    // initial concentration (mg per litre)
    const double tEnd = 24.0;  // hours

    std::cout << "exact C(24) = " << std::scientific << std::setprecision(3)
              << C0 * std::exp(-k * tEnd) << "\n\n";
    std::cout << "h,g,steps,C(24),behaviour\n";
    for (double h : {0.5, 1.0, 2.0, 3.0, 4.0, 6.0, 8.0}) {
        const int steps = static_cast<int>(tEnd / h);  // every h divides 24
        double C = C0;
        for (int n = 0; n < steps; ++n) C = C + h * (-k * C);  // Euler step
        const double g = 1.0 - h * k;
        std::cout << std::defaultfloat << h << ',' << g << ',' << steps << ','
                  << std::scientific << C << ',' << behaviour(g) << '\n';
    }
    return 0;
}
