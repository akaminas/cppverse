// Title: Right-hand sides of the logistic and SIR models
// Standard: C++17
// An ODE model is a function from the current time and state to the rates
// of change. The program evaluates two such functions at a few states;
// nothing is integrated yet. That is the job of a separate numerical method.

#include <array>
#include <initializer_list>
#include <iomanip>
#include <iostream>

// Logistic growth, dN/dt = r N (1 - N/K): one state variable.
struct LogisticParameters {
    double r = 0.8;    // maximum per-capita growth rate (per day)
    double K = 100.0;  // carrying capacity (individuals)
};

double logisticRate(double /*t*/, double N, const LogisticParameters& p) {
    return p.r * N * (1.0 - N / p.K);
}

// The SIR model in proportions: three state variables that change together.
using SirState = std::array<double, 3>;  // S, I, R

struct SirParameters {
    double beta = 0.5;   // transmission rate (per day)
    double gamma = 0.2;  // recovery rate (per day)
};

SirState sirRates(double /*t*/, const SirState& x, const SirParameters& p) {
    const double infection = p.beta * x[0] * x[1];  // flow from S to I
    const double recovery = p.gamma * x[1];         // flow from I to R
    return {-infection, infection - recovery, recovery};
}

int main() {
    const LogisticParameters logistic{};
    std::cout << std::fixed << std::setprecision(3);
    std::cout << "N,dN/dt\n";
    for (int N : {0, 25, 50, 75, 100, 125}) {
        std::cout << N << ',' << logisticRate(0.0, N, logistic) << '\n';
    }

    const SirParameters sir{};
    const SirState x{0.7, 0.1, 0.2};
    const SirState rates = sirRates(0.0, x, sir);
    std::cout << "\nS,I,R,dS/dt,dI/dt,dR/dt\n";
    std::cout << x[0] << ',' << x[1] << ',' << x[2] << ',' << rates[0] << ',' << rates[1] << ',' << rates[2] << '\n';
    std::cout << "sum of rates: " << rates[0] + rates[1] + rates[2] << '\n';
    return 0;
}
