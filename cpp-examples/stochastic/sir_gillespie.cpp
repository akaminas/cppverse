// Title: A stochastic SIR epidemic with Gillespie's direct method
// Standard: C++17
// Infection (S + I -> 2 I) has propensity beta S I / N and recovery
// (I -> R) has propensity gamma I. The state is recorded every 10 days, so
// that runs with different seeds can be compared at the same times. When
// no host is infectious the epidemic is over: an absorbing state.
// Usage:  sir_gillespie [seed]

#include <cstdint>
#include <iostream>
#include <random>
#include <string>

struct Hosts {
    int S = 0;  // susceptible
    int I = 0;  // infectious
    int R = 0;  // recovered
};

int main(int argc, char* argv[]) {
    const std::uint64_t seed = argc > 1 ? std::stoull(argv[1]) : 1927ULL;
    const double beta = 0.3;     // transmission rate per day
    const double gamma = 0.1;    // recovery rate per day
    const int N = 500;           // hosts in the closed population
    const int saves = 20;        // record at days 0, 10, ..., 200
    const double saveEvery = 10.0;

    std::mt19937_64 rng(seed);
    Hosts x{N - 5, 5, 0};
    double t = 0.0;           // time of the last event (or save time)
    double lastEvent = 0.0;

    std::cout << "# seed " << seed << '\n' << "day,S,I,R\n";
    for (int k = 0; k <= saves; ++k) {
        const double saveTime = k * saveEvery;
        while (true) {
            const double infection = beta * x.S * x.I / N;
            const double recovery = gamma * x.I;
            const double total = infection + recovery;
            if (total <= 0.0) break;  // I = 0: no event can ever happen again

            std::exponential_distribution<double> waiting(total);
            const double tau = waiting(rng);
            if (t + tau > saveTime) {  // the next event lies beyond saveTime;
                t = saveTime;          // memoryless, so restart the clock here
                break;
            }
            t += tau;
            lastEvent = t;

            std::discrete_distribution<int> which{infection, recovery};
            switch (which(rng)) {
                case 0: --x.S; ++x.I; break;  // infection
                case 1: --x.I; ++x.R; break;  // recovery
            }
        }
        std::cout << saveTime << ',' << x.S << ',' << x.I << ',' << x.R << '\n';
    }
    if (x.I == 0) std::cout << "# epidemic over: last recovery on day " << lastEvent << '\n';
    else std::cout << "# still " << x.I << " infectious hosts on the last day\n";
    return 0;
}
