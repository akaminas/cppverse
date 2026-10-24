// Title: One engine per replicate, derived from a master seed
// Standard: C++17
// Replicate r gets its own std::mt19937_64, seeded through a std::seed_seq
// built from the master seed and r. Its result then depends only on
// (master seed, r): it is the same whether replicates run in sequence, in
// separate processes or on separate threads, and in whatever order.
// Usage: parallel_seed_streams [master-seed] [first-replicate] [last-replicate]

#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <random>
#include <string>
#include <vector>

std::mt19937_64 engineFor(std::uint64_t master, std::uint32_t replicate) {
    // seed_seq keeps only 32 bits of each value, so split the 64-bit master seed.
    std::seed_seq sequence{static_cast<std::uint32_t>(master), static_cast<std::uint32_t>(master >> 32),
                           replicate};
    return std::mt19937_64(sequence);
}

// One replicate: 40 years of a population with Poisson numbers of recruits.
int finalPopulation(std::uint64_t master, std::uint32_t replicate) {
    std::mt19937_64 rng = engineFor(master, replicate);
    int N = 8;
    for (int year = 0; year < 40 && N > 0; ++year) {
        const double expected = 1.6 * N / (1.0 + 0.02 * N);
        N = std::poisson_distribution<int>(expected)(rng);
    }
    return N;
}

int main(int argc, char* argv[]) {
    const std::uint64_t master = argc > 1 ? std::stoull(argv[1]) : 20261024ULL;
    const std::uint32_t first = argc > 2 ? static_cast<std::uint32_t>(std::stoul(argv[2])) : 0;
    const std::uint32_t last = argc > 3 ? static_cast<std::uint32_t>(std::stoul(argv[3])) : 7;

    if (last < first) {
        std::cerr << "usage: parallel_seed_streams [master-seed] [first-replicate] [last-replicate]\n";
        return EXIT_FAILURE;
    }
    std::cout << "# master seed " << master << "\nreplicate,final_N\n";
    std::vector<int> results;
    for (std::uint32_t k = 0; k <= last - first; ++k) {
        const std::uint32_t r = last - k;  // deliberately in reverse order
        results.push_back(finalPopulation(master, r));
        std::cout << r << ',' << results.back() << '\n';
    }
    // Rerunning one replicate on its own reproduces its result exactly.
    const bool same = !results.empty() && finalPopulation(master, first) == results.back();
    std::cout << "# replicate " << first << " rerun alone: " << (same ? "identical" : "different") << '\n';
    return EXIT_SUCCESS;
}
