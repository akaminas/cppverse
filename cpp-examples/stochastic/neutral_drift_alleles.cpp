// Title: Neutral drift of five alleles by multinomial sampling
// Standard: C++17
// A haploid population of N individuals carries five neutral alleles. Each
// generation, every offspring copies the allele of a randomly chosen
// parent: a weighted lottery with the current allele counts as weights.
// Without any selection, chance alone removes alleles until one is fixed.
// Usage:  neutral_drift_alleles [seed]

#include <cstddef>
#include <cstdint>
#include <iostream>
#include <random>
#include <string>
#include <vector>

int main(int argc, char* argv[]) {
    const std::uint64_t seed = argc > 1 ? std::stoull(argv[1]) : 1859ULL;
    std::mt19937_64 rng(seed);
    std::cout << "seed " << seed << '\n';

    const int N = 25;                          // population size, constant
    const std::string names = "ABCDE";         // one letter per allele
    std::vector<int> count{5, 5, 5, 5, 5};     // carriers of each allele
    int present = 5;                           // alleles still present
    int generation = 0;

    while (present > 1) {
        ++generation;
        // A new distribution each generation, because the weights changed.
        std::discrete_distribution<std::size_t> parentAllele(count.begin(), count.end());
        std::vector<int> next(count.size(), 0);
        for (int offspring = 0; offspring < N; ++offspring) ++next[parentAllele(rng)];

        for (std::size_t i = 0; i < count.size(); ++i) {
            if (count[i] > 0 && next[i] == 0) {
                --present;
                std::cout << "generation " << generation << ": allele " << names[i]
                          << " lost, " << present << " remain\n";
            }
        }
        count = next;
    }

    for (std::size_t i = 0; i < count.size(); ++i) {
        if (count[i] == N) {
            std::cout << "allele " << names[i] << " fixed after " << generation << " generations\n";
        }
    }
    return 0;
}
