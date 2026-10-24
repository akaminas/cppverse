// Title: Replicate trajectories in tidy (long) format
// Standard: C++17
// Simulates replicate trajectories of the linear birth–death process and
// records the population size on a regular time grid: one row per replicate
// and time point, the layout that R (dplyr) and Python (pandas) summarise
// most easily.   Usage: bd_trajectories_long [base_seed] [replicates]

#include <array>
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <random>
#include <string>

struct Parameters {
    double b = 1.0;   // birth rate per individual per year
    double d = 0.8;   // death rate per individual per year
    int N0 = 5;       // initial population size
    double T = 4.0;   // years simulated
    double dt = 0.1;  // spacing of the recording grid (not a time step)
};

std::uint64_t replicateSeed(std::uint32_t base, std::uint32_t replicate) {
    std::seed_seq sequence{base, replicate};
    std::array<std::uint32_t, 2> words{};
    sequence.generate(words.begin(), words.end());
    return (std::uint64_t{words[0]} << 32) | words[1];
}

// One exact (Gillespie) realisation, recorded at t = 0, dt, 2 dt, ..., T.
void writeReplicate(int replicate, std::uint64_t seed, const Parameters& p) {
    std::mt19937_64 rng(seed);
    std::uniform_real_distribution<double> uniform(0.0, 1.0);
    const auto waiting = [&rng, &p](int N) {
        return std::exponential_distribution<double>((p.b + p.d) * N)(rng);
    };
    int N = p.N0;
    double nextEvent = N > 0 ? waiting(N) : 0.0;
    const int points = static_cast<int>(std::lround(p.T / p.dt));
    for (int k = 0; k <= points; ++k) {
        const double time = k * p.dt;
        while (N > 0 && nextEvent <= time) {  // apply every event up to this time
            if (uniform(rng) * (p.b + p.d) < p.b) ++N;
            else --N;
            if (N > 0) nextEvent += waiting(N);
        }
        std::cout << replicate << ',' << seed << ',' << time << ',' << N << '\n';
    }
}

int main(int argc, char* argv[]) {
    const std::uint32_t baseSeed = argc > 1 ? static_cast<std::uint32_t>(std::stoul(argv[1])) : 7u;
    const int replicates = argc > 2 ? std::stoi(argv[2]) : 200;
    const Parameters p{};
    std::cout << "# model: linear birth-death process, b = " << p.b << ", d = " << p.d
              << ", N0 = " << p.N0 << "; base_seed: " << baseSeed << '\n'
              << "replicate,seed,time,N\n";
    for (int r = 0; r < replicates; ++r) {
        writeReplicate(r, replicateSeed(baseSeed, static_cast<std::uint32_t>(r)), p);
    }
    return EXIT_SUCCESS;
}
