// Title: A factorial simulation experiment with recorded seeds
// Standard: C++17
// Runs the linear birth–death process at every combination of two factors
// (death rate d and initial size N0), with a distinct, recorded seed for each
// replicate, and writes one tidy CSV: metadata lines starting with '#', then
// one row per replicate.   Usage: bd_factorial_design [base_seed] [replicates]

#include <array>
#include <cstdint>
#include <cstdlib>
#include <ctime>
#include <iostream>
#include <random>
#include <string>
#include <vector>

#ifndef MODEL_VERSION
#define MODEL_VERSION "unversioned"  // compile with -DMODEL_VERSION=\"$(git describe --always)\"
#endif

// A distinct 64-bit seed for each (base seed, design point, replicate).
std::uint64_t replicateSeed(std::uint32_t base, std::uint32_t point, std::uint32_t replicate) {
    std::seed_seq sequence{base, point, replicate};
    std::array<std::uint32_t, 2> words{};
    sequence.generate(words.begin(), words.end());
    return (std::uint64_t{words[0]} << 32) | words[1];
}

// Population size at time T in one realisation (Gillespie's direct method).
int finalSize(double b, double d, int N0, double T, std::mt19937_64& rng) {
    std::uniform_real_distribution<double> uniform(0.0, 1.0);
    int N = N0;
    double t = 0.0;
    while (N > 0) {
        t += std::exponential_distribution<double>((b + d) * N)(rng);
        if (t > T) break;
        if (uniform(rng) * (b + d) < b) ++N;
        else --N;
    }
    return N;
}

int main(int argc, char* argv[]) {
    const std::uint32_t baseSeed = argc > 1 ? static_cast<std::uint32_t>(std::stoul(argv[1])) : 2024u;
    const int replicates = argc > 2 ? std::stoi(argv[2]) : 100;
    if (replicates < 1) {
        std::cerr << "error: at least one replicate is needed\n";
        return EXIT_FAILURE;
    }
    const double b = 1.0;  // birth rate per individual per year (fixed)
    const double T = 4.0;  // years simulated
    const std::vector<double> deathRates{0.6, 0.8, 1.0};  // factor 1, three levels
    const std::vector<int> initialSizes{2, 5, 10};         // factor 2, three levels

    std::array<char, 32> date{};
    const std::time_t now = std::time(nullptr);
    if (const std::tm* utc = std::gmtime(&now)) std::strftime(date.data(), date.size(), "%Y-%m-%dT%H:%M:%SZ", utc);
#ifdef __VERSION__
    const std::string compiler = __VERSION__;
#else
    const std::string compiler = "unknown";
#endif
    std::cout << "# model: linear birth-death process, Gillespie direct method\n"
              << "# model_version: " << MODEL_VERSION << '\n'
              << "# fixed: b = " << b << ", T = " << T << '\n'
              << "# design: full factorial, d in {0.6, 0.8, 1}, N0 in {2, 5, 10}, "
              << replicates << " replicates per point\n"
              << "# base_seed: " << baseSeed << '\n'
              << "# run_date_utc: " << date.data() << '\n'
              << "# compiler: " << compiler << ", __cplusplus " << __cplusplus << '\n'
              << "death_rate,initial_size,replicate,seed,final_size,extinct\n";

    std::uint32_t point = 0;
    for (const double d : deathRates) {
        for (const int N0 : initialSizes) {
            for (int r = 0; r < replicates; ++r) {
                const std::uint64_t seed = replicateSeed(baseSeed, point, static_cast<std::uint32_t>(r));
                std::mt19937_64 rng(seed);
                const int N = finalSize(b, d, N0, T, rng);
                std::cout << d << ',' << N0 << ',' << r << ',' << seed << ',' << N << ',' << (N == 0) << '\n';
            }
            ++point;
        }
    }
    return EXIT_SUCCESS;
}
