// Title: Adaptive Heun–Euler integration of the SIR model
// Standard: C++17
// Euler and Heun share their first slope; their difference estimates the
// local error. Each attempted step is accepted or rejected against a mixed
// tolerance, and the step size is adjusted after every attempt.

#include <algorithm>
#include <cmath>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <vector>

using State = std::vector<double>;

struct Controller {
    double atol = 1e-6;      // absolute tolerance (proportion of the population)
    double rtol = 1e-6;      // relative tolerance
    double safety = 0.9;     // aim a little below the predicted step
    double maxGrow = 5.0;    // h may grow by at most this factor
    double maxShrink = 0.1;  // h may shrink by at most this factor
    double hMin = 1e-10;     // give up below this step (days)
};

State sir(const State& x) {  // beta = 0.5 and gamma = 0.2 per day
    const double infection = 0.5 * x[0] * x[1];
    const double recovery = 0.2 * x[1];
    return {-infection, infection - recovery, recovery};
}

// One attempt. Returns true (and advances t and x) if the step is accepted.
// In both cases h is replaced by the step size to try next.
bool tryStep(double& t, State& x, double& h, const Controller& c) {
    const State a = sir(x);                // shared first slope
    State predictor(x.size());
    for (std::size_t i = 0; i < x.size(); ++i) predictor[i] = x[i] + h * a[i];
    const State b = sir(predictor);        // slope at the Euler end point
    State heun(x.size());
    double E = 0.0;                        // largest scaled error estimate
    for (std::size_t i = 0; i < x.size(); ++i) {
        heun[i] = x[i] + (h / 2.0) * (a[i] + b[i]);
        const double scale = c.atol + c.rtol * std::max(std::abs(x[i]), std::abs(heun[i]));
        E = std::max(E, std::abs((h / 2.0) * (b[i] - a[i])) / scale);
    }
    const double factor = (E > 0.0) ? c.safety / std::sqrt(E) : c.maxGrow;
    if (E > 1.0) {                         // reject: shrink and retry
        h *= std::max(c.maxShrink, factor);
        if (h < c.hMin) throw std::runtime_error("step size underflow");
        return false;
    }
    t += h;                                // accept the higher-order value
    x = heun;
    h *= std::min(c.maxGrow, factor);
    return true;
}

int main() {
    const Controller control{};
    const double tEnd = 400.0;  // days
    double t = 0.0;
    double h = 1.0;             // first trial step (days)
    State x{0.999, 0.001, 0.0};
    int accepted = 0, rejected = 0;
    double hSmallest = tEnd, hLargest = 0.0;
    std::vector<int> perWindow(8, 0);  // accepted steps in each 50-day window
    try {
        while (t < tEnd) {
            h = std::min(h, tEnd - t);
            const double attempted = h;
            if (!tryStep(t, x, h, control)) { ++rejected; continue; }
            ++accepted;
            hSmallest = std::min(hSmallest, attempted);
            hLargest = std::max(hLargest, attempted);
            ++perWindow[static_cast<std::size_t>(std::min(7.0, std::floor(t / 50.0)))];
        }
    } catch (const std::runtime_error& e) {
        std::cerr << "integration failed at t = " << t << ": " << e.what() << '\n';
        return 1;
    }
    std::cout << "accepted," << accepted << "\nrejected," << rejected
              << "\nevaluations," << 2 * (accepted + rejected) << '\n' << std::setprecision(3)
              << "smallest_h," << hSmallest << "\nlargest_h," << hLargest << '\n';
    for (std::size_t w = 0; w < perWindow.size(); ++w)
        std::cout << "steps_days_" << 50 * w << '_' << 50 * (w + 1) << ',' << perWindow[w] << '\n';
    std::cout << std::fixed << std::setprecision(8) << "final_S," << x[0] << '\n';
    return 0;
}
