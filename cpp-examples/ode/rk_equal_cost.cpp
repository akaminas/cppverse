// Title: Euler, Heun and RK4 with the same budget of slope evaluations
// Standard: C++17
// The three steppers share one interface, so the driver can swap them.
// A counting wrapper around the model records how often each method
// evaluates the right-hand side. Output: error at t = 10 days per budget.

#include <cmath>
#include <functional>
#include <initializer_list>
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

State heun(const RightHandSide& f, double t, const State& x, double h) {
    const State a = f(t, x);                 // slope at the start
    const State b = f(t + h, axpy(x, h, a)); // slope at the predicted end
    State y(x.size());
    for (std::size_t i = 0; i < x.size(); ++i) y[i] = x[i] + (h / 2.0) * (a[i] + b[i]);
    return y;
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

int main() {
    const double r = 0.8, K = 100.0, N0 = 2.0, tEnd = 10.0;
    int evaluations = 0;
    const RightHandSide logistic = [r, K, &evaluations](double /*t*/, const State& x) {
        ++evaluations;
        return State{r * x[0] * (1.0 - x[0] / K)};
    };
    const double exact = K * N0 * std::exp(r * tEnd) / (K + N0 * (std::exp(r * tEnd) - 1.0));

    struct Method { std::string name; Stepper step; int stages; };
    const std::vector<Method> methods{{"euler", euler, 1}, {"heun", heun, 2}, {"rk4", rk4, 4}};

    std::cout << "budget,method,h,evaluations,abs_error\n";
    for (int budget : {40, 80, 160, 320, 640}) {
        for (const Method& m : methods) {
            const double h = tEnd * m.stages / budget;  // steps = budget / stages
            evaluations = 0;
            State x{N0};
            for (int i = 0; i < budget / m.stages; ++i) x = m.step(logistic, i * h, x, h);
            std::cout << budget << ',' << m.name << ',' << h << ',' << evaluations << ','
                      << std::scientific << std::setprecision(2) << std::abs(x[0] - exact)
                      << std::defaultfloat << std::setprecision(6) << '\n';
        }
    }
    return 0;
}
