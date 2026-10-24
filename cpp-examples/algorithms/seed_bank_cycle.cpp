// Title: The annual cycle of a plant with a seed bank
// Standard: C++17
// One year of an annual plant, decomposed into the steps of its life cycle:
// germination, survival to flowering, seed set and winter survival of the
// seed bank. Densities are expected numbers per square metre.

#include <iomanip>
#include <iostream>

int main() {
    const double germination = 0.3;     // fraction of banked seeds that germinate in spring
    const double establishment = 0.05;  // fraction of seedlings that survive to flower
    const double seedsPerPlant = 40.0;  // seeds set by each flowering plant
    const double winterSurvival = 0.8;  // fraction of banked seeds that survive the winter
    const int years = 8;

    double seeds = 200.0;  // the state: seeds in the bank at the spring census
    std::cout << std::fixed << std::setprecision(1);
    std::cout << "year,seedlings,flowering,seeds next spring\n";
    for (int year = 1; year <= years; ++year) {
        // Step 1: germination splits the bank into seedlings and dormant seeds.
        const double seedlings = germination * seeds;
        const double dormant = seeds - seedlings;
        // Step 2: some seedlings survive to flower.
        const double flowering = establishment * seedlings;
        // Step 3: each flowering plant adds new seeds to the bank.
        const double newSeeds = seedsPerPlant * flowering;
        // Step 4: old and new seeds overwinter in the bank.
        seeds = winterSurvival * (dormant + newSeeds);
        std::cout << year << ',' << seedlings << ',' << flowering << ',' << seeds << '\n';
    }
    return 0;
}
