// Title: Verification tests for two population models
// Standard: C++17
// Each test compares a simulation with something known independently of the
// code: a closed-form solution, a fixed point, an invariant, or the theoretical
// order of convergence of a numerical method. The program returns a failure
// status if any test fails, so a build script can run it after every change.

#include <algorithm>
#include <cassert>
#include <cmath>
#include <cstdlib>
#include <iomanip>
#include <initializer_list>
#include <iostream>

// Prints PASS or FAIL and counts failures; the caller completes the line.
void check(bool passed, int& failures) {
    std::cout << (passed ? "PASS  " : "FAIL  ");
    if (!passed) ++failures;
}

double bevertonHolt(double N, double R0, double M) { return R0 * N / (1.0 + N / M); }

double bevertonHoltExact(double N0, int t, double R0, double M) {
    const double K = (R0 - 1.0) * M;
    return K * N0 / (N0 + (K - N0) * std::pow(R0, -t));
}

// Largest relative difference between the recurrence and its closed form.
double closedFormError(double R0, double M, double N0, int generations) {
    double N = N0;
    double worst = 0.0;
    for (int t = 1; t <= generations; ++t) {
        N = bevertonHolt(N, R0, M);
        assert(N >= 0.0 && "a population size can never be negative");
        const double exact = bevertonHoltExact(N0, t, R0, M);
        worst = std::max(worst, std::abs(N - exact) / exact);
    }
    return worst;
}

// Logistic growth dN/dt = r N (1 - N/K), N(0) = 2, integrated with Euler or Heun.
double logistic(bool heun, double tEnd, int steps) {
    const double r = 0.8;
    const double K = 100.0;
    const double h = tEnd / steps;
    const auto f = [r, K](double N) { return r * N * (1.0 - N / K); };
    double N = 2.0;
    for (int i = 0; i < steps; ++i) {
        const double a = f(N);
        N += heun ? 0.5 * h * (a + f(N + h * a)) : h * a;
    }
    return N;
}

// Observed order p from the errors with 400 and 800 steps, if error ~ C h^p.
double observedOrder(bool heun) {
    const double e = std::exp(0.8 * 10.0);
    const double exact = 100.0 * 2.0 * e / (100.0 + 2.0 * (e - 1.0));
    const double coarse = std::abs(logistic(heun, 10.0, 400) - exact);
    const double fine = std::abs(logistic(heun, 10.0, 800) - exact);
    return std::log2(coarse / fine);
}

int main() {
    int failures = 0;
    for (const double R0 : {0.8, 2.2, 3.0}) {
        check(closedFormError(R0, 40.0, 5.0, 60) < 1e-10, failures);
        std::cout << "Beverton-Holt matches its closed form, R0 = " << R0 << '\n';
    }
    const double K = (2.2 - 1.0) * 40.0;
    check(std::abs(bevertonHolt(K, 2.2, 40.0) - K) <= 1e-12 * K, failures);
    std::cout << "K = (R0 - 1) M is a fixed point\n";

    const double eulerOrder = observedOrder(false);
    const double heunOrder = observedOrder(true);
    std::cout << std::fixed << std::setprecision(2);
    check(std::abs(eulerOrder - 1.0) < 0.1, failures);
    std::cout << "Euler converges at order 1 (observed " << eulerOrder << ")\n";
    check(std::abs(heunOrder - 2.0) < 0.1, failures);
    std::cout << "Heun converges at order 2 (observed " << heunOrder << ")\n";

    std::cout << failures << " test(s) failed\n";
    return failures == 0 ? EXIT_SUCCESS : EXIT_FAILURE;
}
