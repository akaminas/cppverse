// Title: Three biological equations in C++
// Standard: C++17
// Von Bertalanffy growth, Q10 temperature scaling and a Hill function, each
// transcribed from its equation. Parameter values are illustrative.

#include <cmath>
#include <iomanip>
#include <iostream>

int main() {
    std::cout << std::fixed << std::setprecision(3);

    // Von Bertalanffy growth: L(t) = Linf * (1 - exp(-k * (t - t0)))
    const double lengthInfinity = 62.0;   // asymptotic length, cm
    const double k = 0.25;                // growth coefficient, per year
    const double t0 = -0.5;               // age at which L would be 0, years
    const double age = 4.0;               // years
    const double length = lengthInfinity * (1.0 - std::exp(-k * (age - t0)));
    std::cout << "length at age 4: " << length << " cm\n";

    // Q10 scaling: R(T) = Rref * Q10^((T - Tref) / 10)
    const double rateRef = 3.2;           // rate at Tref, in the units of R
    const double q10 = 2.1;               // factor per 10 degrees C
    const double temperatureRef = 15.0;   // degrees C
    const double temperature = 22.0;      // degrees C
    const double rate = rateRef * std::pow(q10, (temperature - temperatureRef) / 10.0);
    std::cout << "rate at 22 C: " << rate << '\n';

    // Hill function: f(S) = S^n / (K^n + S^n)
    const double signal = 3.0;            // concentration, same units as K
    const double halfSaturation = 2.0;    // K: concentration giving f = 0.5
    const double hillCoefficient = 2.0;   // n: steepness
    const double sn = std::pow(signal, hillCoefficient);
    const double response = sn / (std::pow(halfSaturation, hillCoefficient) + sn);
    std::cout << "response at S = 3: " << response << '\n';
    return 0;
}
