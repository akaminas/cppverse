// Title: Stopping a simulation at extinction
// Standard: C++17
// break leaves the loop as soon as the population is extinct; continue
// skips the output step in generations that are not recorded.

#include <iomanip>
#include <iostream>

int main() {
    const double lambda = 0.7;        // growth factor per generation
    const int max_generations = 100;
    const int record_every = 5;       // print every fifth generation

    double N = 50.0;
    int extinct_at = 0;               // 0 means "not extinct"

    std::cout << std::fixed << std::setprecision(2);
    for (int t = 1; t <= max_generations; ++t) {
        N = lambda * N;
        if (N < 1.0) {
            extinct_at = t;
            break;                    // nothing left to simulate
        }
        if (t % record_every != 0) {
            continue;                 // not a recording generation
        }
        std::cout << "t = " << t << "  N = " << N << '\n';
    }

    if (extinct_at > 0) {
        std::cout << "Extinct in generation " << extinct_at << '\n';
    }
    return 0;
}
