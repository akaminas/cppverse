// Title: Arithmetic on a predator-prey state
// Standard: C++17
// Overloaded operators let a Lotka-Volterra update read like its mathematics:
// s += (h / 2) * (k1 + k2) is one step of Heun's method. The member += does the
// work; the non-members + and scalar * are built from it, and << prints a state.

#include <iomanip>
#include <iostream>

struct State {
    double prey = 0.0;       // prey density (per km2)
    double predators = 0.0;  // predator density (per km2)

    State& operator+=(const State& other) {
        prey += other.prey;
        predators += other.predators;
        return *this;
    }
};

State operator+(State lhs, const State& rhs) {  // lhs is a copy we may change
    lhs += rhs;
    return lhs;
}

State operator*(double k, const State& s) {
    return {k * s.prey, k * s.predators};
}

std::ostream& operator<<(std::ostream& os, const State& s) {
    return os << "prey " << s.prey << ", predators " << s.predators;
}

struct Parameters {
    double r = 1.0;  // prey growth rate (per year)
    double a = 0.1;  // attack rate (km2 per predator per year)
    double e = 0.5;  // conversion efficiency (predators per prey eaten)
    double m = 0.5;  // predator mortality rate (per year)
};

// The model's right-hand side: the rate of change of both densities.
State rates(const State& s, const Parameters& p) {
    return {p.r * s.prey - p.a * s.prey * s.predators,
            p.e * p.a * s.prey * s.predators - p.m * s.predators};
}

int main() {
    const Parameters p{};
    const double h = 0.05;  // time step (years)
    State s{20.0, 5.0};
    std::cout << std::fixed << std::setprecision(3);
    std::cout << "t = " << 0.0 << ": " << s << '\n';
    for (int step = 1; step <= 200; ++step) {
        const State k1 = rates(s, p);
        const State k2 = rates(s + h * k1, p);
        s += (h / 2.0) * (k1 + k2);
        if (step % 40 == 0) std::cout << "t = " << step * h << ": " << s << '\n';
    }
    return 0;
}
