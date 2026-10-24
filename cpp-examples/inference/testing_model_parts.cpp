// Title: A minimal test runner for the parts of a model
// Standard: C++17
// Unit tests for the components of the plant model (torus distance, wrapping,
// the survival rule) and an analytical test: at the mean-field equilibrium N*,
// survival times (1 + f) must equal 1. A failed check gives a non-zero exit
// status, so a build script or continuous integration stops on it.

#include <cmath>
#include <cstdlib>
#include <iostream>
#include <string>

constexpr double kPi = 3.14159265358979323846;

// ── The model components under test ─────────────────────────────────────────
double torusDelta(double a, double b) {
    const double d = std::abs(a - b);
    return d > 0.5 ? 1.0 - d : d;
}
double wrap(double v) { return v - std::floor(v); }
double survival(double s0, double c, double crowding) { return s0 / (1.0 + c * crowding); }
double meanFieldEquilibrium(double s0, double c, double R, double f) {
    return (s0 * (1.0 + f) - 1.0) / (c * kPi * R * R);
}

// ── A minimal test runner ───────────────────────────────────────────────────
struct Tests {
    int run = 0;
    int failed = 0;
    void check(bool ok, const std::string& name) {
        ++run;
        if (!ok) ++failed;
        std::cout << (ok ? "pass  " : "FAIL  ") << name << '\n';
    }
};
bool approxEqual(double a, double b, double tolerance = 1e-12) { return std::abs(a - b) <= tolerance; }

int main() {
    Tests t;
    t.check(approxEqual(torusDelta(0.1, 0.3), 0.2), "torusDelta: plants 0.2 apart");
    t.check(approxEqual(torusDelta(0.95, 0.05), 0.1), "torusDelta: shortest path crosses the edge");
    t.check(approxEqual(torusDelta(0.3, 0.8), torusDelta(0.8, 0.3)), "torusDelta: symmetric");
    t.check(approxEqual(wrap(1.25), 0.25) && approxEqual(wrap(-0.25), 0.75), "wrap: positions return to [0, 1)");
    t.check(approxEqual(survival(0.9, 0.25, 0.0), 0.9), "survival: an uncrowded plant survives with s0");
    t.check(survival(0.9, 0.25, 4.0) < survival(0.9, 0.25, 3.0), "survival: falls as crowding rises");

    const double s0 = 0.9, c = 0.25, R = 0.05, f = 1.2;
    const double Nstar = meanFieldEquilibrium(s0, c, R, f);
    const double crowdingAtNstar = Nstar * kPi * R * R;
    t.check(approxEqual(survival(s0, c, crowdingAtNstar) * (1.0 + f), 1.0), "equilibrium: s(N*) (1 + f) = 1");
    t.check(meanFieldEquilibrium(0.4, c, R, 1.0) < 0.0, "equilibrium: none when s0 (1 + f) < 1");

    std::cout << t.run - t.failed << " of " << t.run << " checks passed\n";
    return t.failed == 0 ? EXIT_SUCCESS : EXIT_FAILURE;
}
