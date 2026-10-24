// Title: Gillespie simulation of a birth–death process
// Standard: C++17
// Each individual gives birth at rate b and dies at rate d. With N
// individuals the two events have propensities b N and d N. Gillespie's
// direct method draws the waiting time to the next event from an
// exponential distribution with the total rate, then picks which event
// happens in proportion to its rate. When N = 0 the total rate is zero:
// nothing can ever happen again, so the run stops (extinction).
// Usage:  birth_death_gillespie [seed] [replicates]
// Output: one summary line per statistic, compared with the exact results
//     E[N(T)] = N0 e^{(b-d)T}
//     P(N(T) = 0) = [d (e^{(b-d)T} - 1) / (b e^{(b-d)T} - d)]^N0.

#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <random>
#include <string>
#include <vector>

struct Parameters {
    double birthRate = 1.0;  // per individual per unit time
    double deathRate = 0.8;  // per individual per unit time
    int initialSize = 5;
    double endTime = 4.0;
};

// One realisation of the process; returns the population size at endTime.
int simulateOnce(const Parameters& p, std::mt19937_64& rng) {
    int N = p.initialSize;
    double t = 0.0;
    std::uniform_real_distribution<double> uniform(0.0, 1.0);
    while (true) {
        const double birth = p.birthRate * N;
        const double death = p.deathRate * N;
        const double total = birth + death;
        if (total <= 0.0) return N;  // absorbing state: no event can occur

        std::exponential_distribution<double> waiting(total);
        const double tau = waiting(rng);
        if (t + tau > p.endTime) return N;  // the next event falls after the end
        t += tau;

        // Weighted choice between the two events.
        if (uniform(rng) * total < birth) ++N;
        else --N;
    }
}

int main(int argc, char* argv[]) {
    const std::uint64_t seed = argc > 1 ? std::stoull(argv[1]) : 20241024ULL;
    const int replicates = argc > 2 ? std::stoi(argv[2]) : 20000;
    const Parameters p{};

    std::mt19937_64 rng(seed);
    std::vector<int> finalSizes;
    finalSizes.reserve(static_cast<std::size_t>(replicates));
    for (int r = 0; r < replicates; ++r) finalSizes.push_back(simulateOnce(p, rng));

    double sum = 0.0;
    int extinct = 0;
    for (int n : finalSizes) {
        sum += n;
        if (n == 0) ++extinct;
    }
    const double mean = sum / replicates;
    double squares = 0.0;
    for (int n : finalSizes) squares += (n - mean) * (n - mean);
    const double sd = std::sqrt(squares / (replicates - 1));

    const double growth = std::exp((p.birthRate - p.deathRate) * p.endTime);
    const double exactMean = p.initialSize * growth;
    const double exactExtinction =
        std::pow(p.deathRate * (growth - 1.0) / (p.birthRate * growth - p.deathRate), p.initialSize);

    std::cout << std::setprecision(8);
    std::cout << "seed," << seed << '\n';
    std::cout << "replicates," << replicates << '\n';
    std::cout << "mean_N," << mean << '\n';
    std::cout << "sd_N," << sd << '\n';
    std::cout << "exact_mean_N," << exactMean << '\n';
    std::cout << "fraction_extinct," << static_cast<double>(extinct) / replicates << '\n';
    std::cout << "exact_extinction_probability," << exactExtinction << '\n';
    return EXIT_SUCCESS;
}
