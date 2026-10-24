// Title: Euler's method for the SIR model, with output every 10 days
// Standard: C++17
// A forward-Euler stepper advances S, I and R simultaneously. The driver
// integrates from one output time to the next and shortens the last step
// of each interval, so rows appear every 10 days whatever the step h is.

#include <algorithm>
#include <cmath>
#include <functional>
#include <iomanip>
#include <iostream>
#include <vector>

using State = std::vector<double>;
using RightHandSide = std::function<State(double, const State&)>;

// One Euler step. Every derivative is computed from the old state before
// any component of the new state is written.
State eulerStep(const RightHandSide& f, double t, const State& x, double h) {
    const State slope = f(t, x);
    State next(x.size());
    for (std::size_t i = 0; i < x.size(); ++i) next[i] = x[i] + h * slope[i];
    return next;
}

// Advance x from t0 to t1 in steps of at most h; the last step ends at t1.
State integrate(const RightHandSide& f, State x, double t0, double t1, double h) {
    const int n = static_cast<int>(std::ceil((t1 - t0) / h - 1e-9));
    double t = t0;
    for (int i = 0; i < n; ++i) {
        const double step = std::min(h, t1 - t);
        x = eulerStep(f, t, x, step);
        t = (i == n - 1) ? t1 : t + step;
    }
    return x;
}

int main() {
    const double beta = 0.5;   // transmission rate (per day)
    const double gamma = 0.2;  // recovery rate (per day)
    const RightHandSide sir = [beta, gamma](double /*t*/, const State& x) {
        const double infection = beta * x[0] * x[1];
        const double recovery = gamma * x[1];
        return State{-infection, infection - recovery, recovery};
    };

    const double h = 0.3;         // integration step (days)
    const int outputEvery = 10;   // days between output rows
    State x{0.999, 0.001, 0.0};   // S, I, R at day 0

    std::cout << "day,S,I,R\n" << std::fixed << std::setprecision(6);
    for (int day = 0; day <= 100; day += outputEvery) {
        if (day > 0) x = integrate(sir, x, day - outputEvery, day, h);
        std::cout << day << ',' << x[0] << ',' << x[1] << ',' << x[2] << '\n';
    }
    return 0;
}
