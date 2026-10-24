// Title: Asserting model invariants
// Standard: C++17
// A source patch and a sink patch linked by dispersal. assert checks three
// invariants: the dispersal fraction is a probability, densities are never
// negative, and dispersal moves individuals without creating or losing any.

#include <cassert>
#include <cmath>
#include <iomanip>
#include <iostream>

struct Patches {
    double source;  // density in the source patch (individuals per hectare)
    double sink;    // density in the sink patch (individuals per hectare)
};

double total(const Patches& n) { return n.source + n.sink; }

// A fraction m of each patch moves to the other patch.
Patches disperse(const Patches& n, double m) {
    assert(m >= 0.0 && m <= 1.0 && "the dispersal fraction must be a probability");
    const Patches next{(1.0 - m) * n.source + m * n.sink, (1.0 - m) * n.sink + m * n.source};
    assert(std::abs(total(next) - total(n)) <= 1e-12 * total(n) && "dispersal must conserve individuals");
    return next;
}

// Beverton–Holt growth in each patch; the sink cannot replace itself (R < 1).
Patches grow(const Patches& n, double Rsource, double Rsink, double M) {
    assert(n.source >= 0.0 && n.sink >= 0.0 && "densities cannot be negative");
    return Patches{Rsource * n.source / (1.0 + n.source / M), Rsink * n.sink / (1.0 + n.sink / M)};
}

int main() {
    const double m = 0.2;        // fraction dispersing per generation
    const double Rsource = 2.0;  // growth factor at low density in the source
    const double Rsink = 0.6;    // growth factor at low density in the sink
    const double M = 50.0;       // density at which the growth factor is halved

    Patches n{10.0, 0.0};
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "generation,source,sink\n";
    std::cout << 0 << ',' << n.source << ',' << n.sink << '\n';
    for (int t = 1; t <= 8; ++t) {
        n = grow(disperse(n, m), Rsource, Rsink, M);
        std::cout << t << ',' << n.source << ',' << n.sink << '\n';
    }
    return 0;
}
