// Title: Distributions for biological chance events
// Standard: C++17
// One engine feeds several distributions: survival (Bernoulli), survivors
// of a cohort (binomial), clutch size (Poisson), waiting time (exponential,
// given by its RATE) and body mass (normal, given by mean and standard
// deviation). Parameter values are illustrative, not data.
// Usage:  random_distributions_tour [seed]

#include <cstdint>
#include <iostream>
#include <random>
#include <string>

int main(int argc, char* argv[]) {
    const std::uint32_t seed = argc > 1 ? static_cast<std::uint32_t>(std::stoul(argv[1])) : 31415u;
    std::seed_seq seedSequence{seed};
    std::mt19937_64 rng(seedSequence);
    std::cout << "seed " << seed << '\n';

    std::bernoulli_distribution survivesWinter(0.7);           // probability 0.7
    std::binomial_distribution<int> cohortSurvivors(40, 0.7);  // of 40 fledglings
    std::poisson_distribution<int> clutchSize(3.2);            // mean 3.2 eggs
    std::exponential_distribution<double> nextVisit(0.25);     // 0.25 visits per hour
    std::normal_distribution<double> bodyMass(21.0, 2.5);      // mean and sd in grams
    std::uniform_real_distribution<double> position(0.0, 100.0);  // metres, [0, 100)
    std::uniform_int_distribution<int> quadrat(1, 25);         // 1, 2, ..., 25

    std::cout << "one bird survives the winter: " << (survivesWinter(rng) ? "yes" : "no") << '\n';
    std::cout << "survivors out of 40:          " << cohortSurvivors(rng) << '\n';
    std::cout << "clutch sizes of five nests:  ";
    for (int nest = 0; nest < 5; ++nest) std::cout << ' ' << clutchSize(rng);
    std::cout << '\n';
    std::cout << "hours until the next visit:   " << nextVisit(rng) << '\n';
    std::cout << "body mass (g):                " << bodyMass(rng) << '\n';
    std::cout << "position on the transect (m): " << position(rng) << '\n';
    std::cout << "quadrat to sample:            " << quadrat(rng) << '\n';

    // The exponential distribution is given by its rate: the mean is 1 / rate.
    const int draws = 100000;
    double total = 0.0;
    for (int i = 0; i < draws; ++i) total += nextVisit(rng);
    std::cout << "mean of " << draws << " waiting times: " << total / draws
              << " h (expected " << 1.0 / nextVisit.lambda() << " h)\n";
    return 0;
}
