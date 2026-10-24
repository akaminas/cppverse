// Title: The SIR epidemic integrated with RK4
// Standard: C++17
// Proportions susceptible (S), infectious (I) and recovered (R):
//     dS/dt = -beta S I,   dI/dt = beta S I - gamma I,   dR/dt = gamma I.
// Two checks verify the integration: S + I + R stays 1, and the final
// proportion susceptible satisfies the final-size relation
//     ln(S_inf / S0) = R0 (S_inf - 1),   with R0 = beta / gamma.
// Output: a thinned trajectory, then the verification summary.

#include <array>
#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <iomanip>
#include <iostream>

using State = std::array<double, 3>;  // S, I, R

struct SirParameters {
    double beta = 0.5;   // transmission rate per day
    double gamma = 0.2;  // recovery rate per day
};

State rhs(const State& x, const SirParameters& p) {
    const double infection = p.beta * x[0] * x[1];
    const double recovery = p.gamma * x[1];
    return {-infection, infection - recovery, recovery};
}

State rk4Step(const State& x, double h, const SirParameters& p) {
    auto shifted = [&x](const State& k, double scale) {
        return State{x[0] + scale * k[0], x[1] + scale * k[1], x[2] + scale * k[2]};
    };
    const State k1 = rhs(x, p);
    const State k2 = rhs(shifted(k1, h / 2.0), p);
    const State k3 = rhs(shifted(k2, h / 2.0), p);
    const State k4 = rhs(shifted(k3, h), p);
    State y{};
    for (std::size_t i = 0; i < 3; ++i) y[i] = x[i] + (h / 6.0) * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]);
    return y;
}

// Solve the final-size relation for S_inf in (0, S0) by bisection.
double finalSusceptible(double S0, const SirParameters& p) {
    const double R0 = p.beta / p.gamma;
    double lo = 1e-12;
    double hi = S0 * (1.0 - 1e-12);
    for (int i = 0; i < 200; ++i) {
        const double mid = 0.5 * (lo + hi);
        if (std::log(mid / S0) - R0 * (mid - 1.0) > 0.0) hi = mid;
        else lo = mid;
    }
    return 0.5 * (lo + hi);
}

int main() {
    const SirParameters p{};
    const double h = 0.05;     // days
    const double tEnd = 400.0; // days
    const int steps = static_cast<int>(std::lround(tEnd / h));
    State x{0.999, 0.001, 0.0};
    double worstDrift = 0.0;

    std::cout << "day,S,I,R\n" << std::setprecision(10);
    for (int n = 0; n <= steps; ++n) {
        if (n % 200 == 0) std::cout << n * h << ',' << x[0] << ',' << x[1] << ',' << x[2] << '\n';
        worstDrift = std::max(worstDrift, std::abs(x[0] + x[1] + x[2] - 1.0));
        if (n < steps) x = rk4Step(x, h, p);
    }

    std::cout << "\nfinal_S," << x[0] << '\n';
    std::cout << "final_size_relation_S," << finalSusceptible(0.999, p) << '\n';
    std::cout << "max_conservation_error," << worstDrift << '\n';
    return EXIT_SUCCESS;
}
