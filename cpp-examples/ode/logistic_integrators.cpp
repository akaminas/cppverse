// Title: Euler, Heun and RK4 on the logistic equation
// Standard: C++17
// The model, dN/dt = r N (1 - N/K), is kept separate from the numerical
// methods that approximate it. Each method is a "stepper" with the same
// interface, so they can be swapped and compared against the exact solution
//     N(t) = K N0 e^{rt} / (K + N0 (e^{rt} - 1)).
// Output: CSV with the columns method,h,steps,N_end,abs_error.

#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <functional>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

using State = std::vector<double>;
using RightHandSide = std::function<State(double, const State&)>;
using Stepper = State (*)(const RightHandSide&, double, const State&, double);

// x + h k, component by component.
State axpy(const State& x, double h, const State& k) {
    State y(x.size());
    for (std::size_t i = 0; i < x.size(); ++i) y[i] = x[i] + h * k[i];
    return y;
}

State eulerStep(const RightHandSide& f, double t, const State& x, double h) {
    return axpy(x, h, f(t, x));
}

State heunStep(const RightHandSide& f, double t, const State& x, double h) {
    const State a = f(t, x);
    const State b = f(t + h, axpy(x, h, a));
    State y(x.size());
    for (std::size_t i = 0; i < x.size(); ++i) y[i] = x[i] + (h / 2.0) * (a[i] + b[i]);
    return y;
}

State rk4Step(const RightHandSide& f, double t, const State& x, double h) {
    const State k1 = f(t, x);
    const State k2 = f(t + h / 2.0, axpy(x, h / 2.0, k1));
    const State k3 = f(t + h / 2.0, axpy(x, h / 2.0, k2));
    const State k4 = f(t + h, axpy(x, h, k3));
    State y(x.size());
    for (std::size_t i = 0; i < x.size(); ++i) y[i] = x[i] + (h / 6.0) * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]);
    return y;
}

// Integrate from t0 to t1 with step h; the last step is shortened so that
// the solution ends exactly at t1. Returns the final state.
State integrate(Stepper step, const RightHandSide& f, State x, double t0, double t1, double h, int& steps) {
    const int n = static_cast<int>(std::ceil((t1 - t0) / h - 1e-9));
    double t = t0;
    for (int i = 0; i < n; ++i) {
        const double hh = std::min(h, t1 - t);
        x = step(f, t, x, hh);
        t = (i == n - 1) ? t1 : t + hh;
    }
    steps = n;
    return x;
}

int main() {
    const double r = 0.8;   // per day
    const double K = 100.0; // individuals
    const double N0 = 2.0;
    const double tEnd = 10.0;

    // The biological model: only this function knows about logistic growth.
    const RightHandSide logistic = [r, K](double /*t*/, const State& x) {
        return State{r * x[0] * (1.0 - x[0] / K)};
    };
    const double e = std::exp(r * tEnd);
    const double exact = K * N0 * e / (K + N0 * (e - 1.0));

    struct Method {
        std::string name;
        Stepper step;
    };
    const std::vector<Method> methods{{"euler", eulerStep}, {"heun", heunStep}, {"rk4", rk4Step}};
    const std::vector<double> stepSizes{1.0, 0.5, 0.25, 0.125, 0.0625, 0.03125};

    std::cout << "method,h,steps,N_end,abs_error\n" << std::setprecision(15);
    for (const Method& m : methods) {
        for (double h : stepSizes) {
            int steps = 0;
            const State end = integrate(m.step, logistic, State{N0}, 0.0, tEnd, h, steps);
            std::cout << m.name << ',' << h << ',' << steps << ',' << end[0] << ',' << std::abs(end[0] - exact) << '\n';
        }
    }
    std::cout << "exact,0,0," << exact << ",0\n";
    return EXIT_SUCCESS;
}
