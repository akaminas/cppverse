// Title: Measuring the order of a method without an exact solution
// Standard: C++17
// The SIR model has no closed-form trajectory. Halving the step twice still
// reveals the order p: successive differences in I(30) shrink by about 2^p.
// Output: I(30) for each step size, then the observed order of each method.

#include <cmath>
#include <functional>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

using State = std::vector<double>;
using RightHandSide = std::function<State(double, const State&)>;
using Stepper = State (*)(const RightHandSide&, double, const State&, double);

State axpy(const State& x, double h, const State& k) {  // x + h k
    State y(x.size());
    for (std::size_t i = 0; i < x.size(); ++i) y[i] = x[i] + h * k[i];
    return y;
}

State euler(const RightHandSide& f, double t, const State& x, double h) {
    return axpy(x, h, f(t, x));
}

State rk4(const RightHandSide& f, double t, const State& x, double h) {
    const State k1 = f(t, x);
    const State k2 = f(t + h / 2.0, axpy(x, h / 2.0, k1));
    const State k3 = f(t + h / 2.0, axpy(x, h / 2.0, k2));
    const State k4 = f(t + h, axpy(x, h, k3));
    State y(x.size());
    for (std::size_t i = 0; i < x.size(); ++i) y[i] = x[i] + (h / 6.0) * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]);
    return y;
}

// Proportion infectious at tEnd, integrated with a fixed step h.
double infectiousAt(Stepper step, const RightHandSide& f, double tEnd, double h) {
    State x{0.999, 0.001, 0.0};
    const long n = std::lround(tEnd / h);
    for (long i = 0; i < n; ++i) x = step(f, static_cast<double>(i) * h, x, h);
    return x[1];
}

int main() {
    const double beta = 0.5, gamma = 0.2;  // per day
    const RightHandSide sir = [beta, gamma](double /*t*/, const State& x) {
        const double infection = beta * x[0] * x[1];
        return State{-infection, infection - gamma * x[1], gamma * x[1]};
    };
    struct Run { std::string name; Stepper step; double h; };
    const std::vector<Run> runs{{"euler", euler, 0.1}, {"rk4", rk4, 0.5}};

    std::cout << std::fixed;
    for (const Run& run : runs) {
        const double a = infectiousAt(run.step, sir, 30.0, run.h);
        const double b = infectiousAt(run.step, sir, 30.0, run.h / 2.0);
        const double c = infectiousAt(run.step, sir, 30.0, run.h / 4.0);
        std::cout << std::setprecision(10) << run.name << " I(30): " << a << ", " << b << ", " << c << '\n';
        std::cout << std::setprecision(2) << run.name << " observed order: "
                  << std::log2(std::abs(a - b) / std::abs(b - c)) << '\n';
    }
    return 0;
}
