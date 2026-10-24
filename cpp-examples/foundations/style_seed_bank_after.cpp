// Title: The same seed-bank calculation, tidied
// Standard: C++17
// An annual plant with a persistent seed bank, counted each spring:
//     S(t+1) = S(t) * (g * s * f + (1 - g) * v)
// Names follow the model, and each pathway of the model has its own line.

#include <iostream>

// One year of the seed-bank model; all probabilities are per year.
//   seeds             S(t): seeds in the soil before germination
//   germination       g: probability that a seed germinates this spring
//   seedlingSurvival  s: probability that a seedling survives to flower
//   seedsPerPlant     f: seeds produced by one flowering plant
//   seedSurvival      v: probability that a dormant seed survives the year
double nextSeedBank(double seeds, double germination, double seedlingSurvival,
                    double seedsPerPlant, double seedSurvival) {
    const double fromFlowering = seeds * germination * seedlingSurvival * seedsPerPlant;
    const double stillDormant = seeds * (1.0 - germination) * seedSurvival;
    return fromFlowering + stillDormant;
}

int main() {
    const double germination = 0.3;
    const double seedlingSurvival = 0.2;
    const double seedsPerPlant = 12.0;
    const double seedSurvival = 0.6;

    double seeds = 500.0;  // illustrative initial seed bank
    for (int year = 1; year <= 3; ++year) {
        seeds = nextSeedBank(seeds, germination, seedlingSurvival, seedsPerPlant, seedSurvival);
        std::cout << "year " << year << ": " << seeds << " seeds\n";
    }
    return 0;
}
