// Title: Summarising replicate runs of a birth–death process
// Standard: C++17
// Each replicate has its own seed, made from a base seed and the replicate
// number, so any single run can be repeated on its own. The population size
// is recorded on a time grid; for each time the program prints the mean and
// the fraction extinct with their standard errors, next to the exact values.
// Usage:  birth_death_replicate_summary [base-seed] [replicates]

#include <cmath>
#include <cstddef>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <random>
#include <string>
#include <vector>

struct Parameters {
    double birthRate = 1.0;  // per individual per year
    double deathRate = 0.8;  // per individual per year
    int initialSize = 5;
};

// Population size at each grid time in one run of the direct method.
std::vector<int> runReplicate(const Parameters& p, const std::vector<double>& grid,
                              std::mt19937_64& rng) {
    std::uniform_real_distribution<double> uniform(0.0, 1.0);
    std::vector<int> sizes;
    int N = p.initialSize;
    double t = 0.0;
    for (const double saveTime : grid) {
        while (N > 0) {  // N = 0 is absorbing: nothing more happens
            const double total = (p.birthRate + p.deathRate) * N;
            std::exponential_distribution<double> waiting(total);
            const double tau = waiting(rng);
            if (t + tau > saveTime) { t = saveTime; break; }  // memoryless restart
            t += tau;
            if (uniform(rng) * total < p.birthRate * N) ++N;
            else --N;
        }
        sizes.push_back(N);
    }
    return sizes;
}

int main(int argc, char* argv[]) {
    const std::uint32_t baseSeed =
        argc > 1 ? static_cast<std::uint32_t>(std::stoul(argv[1])) : 20261024u;
    const int replicates = argc > 2 ? std::stoi(argv[2]) : 4000;
    const Parameters p{};
    std::vector<double> grid;
    for (int k = 0; k <= 8; ++k) grid.push_back(0.5 * k);  // years 0, 0.5, ..., 4

    std::vector<double> sum(grid.size(), 0.0), sumSquares(grid.size(), 0.0);
    std::vector<int> extinct(grid.size(), 0);
    for (int r = 0; r < replicates; ++r) {
        std::seed_seq seeds{baseSeed, static_cast<std::uint32_t>(r)};
        std::mt19937_64 rng(seeds);
        const std::vector<int> sizes = runReplicate(p, grid, rng);
        for (std::size_t k = 0; k < grid.size(); ++k) {
            sum[k] += sizes[k];
            sumSquares[k] += static_cast<double>(sizes[k]) * sizes[k];
            if (sizes[k] == 0) ++extinct[k];
        }
    }

    std::cout << "# base seed " << baseSeed << ", " << replicates << " replicates\n";
    std::cout << "t,mean_N,se_mean,exact_mean,p_extinct,se_p,exact_p\n";
    std::cout << std::fixed << std::setprecision(4);
    for (std::size_t k = 0; k < grid.size(); ++k) {
        const double n = replicates;
        const double mean = sum[k] / n;
        const double variance = (sumSquares[k] - n * mean * mean) / (n - 1.0);
        const double pHat = extinct[k] / n;
        const double growth = std::exp((p.birthRate - p.deathRate) * grid[k]);
        const double exactP =
            std::pow(p.deathRate * (growth - 1.0) / (p.birthRate * growth - p.deathRate), p.initialSize);
        std::cout << grid[k] << ',' << mean << ',' << std::sqrt(variance / n) << ','
                  << p.initialSize * growth << ',' << pHat << ',' << std::sqrt(pHat * (1.0 - pHat) / n)
                  << ',' << exactP << '\n';
    }
    return 0;
}
