// Title: Counting the kinds of individual a model would have to track
// Standard: C++17
// Each individual carries a genotype at L biallelic loci, one of 10 age
// classes and one of 3 body conditions. An aggregate model needs a state
// variable for every possible kind; an individual-based model needs one
// record per individual that is actually alive.

#include <cstdint>
#include <iomanip>
#include <iostream>

int main() {
    const std::uint64_t ageClasses = 10;
    const std::uint64_t conditions = 3;     // poor, fair or good body condition
    const std::uint64_t population = 5000;  // individuals alive in the simulation

    std::cout << "loci   genotypes   kinds of individual   kinds > individuals?\n";
    std::uint64_t genotypes = 1;
    for (int loci = 1; loci <= 12; ++loci) {
        genotypes *= 3;  // AA, Aa or aa at each additional locus
        const std::uint64_t kinds = genotypes * ageClasses * conditions;
        std::cout << std::setw(4) << loci << std::setw(12) << genotypes << std::setw(22) << kinds
                  << "   " << (kinds > population ? "yes" : "no") << '\n';
    }
    return 0;
}
