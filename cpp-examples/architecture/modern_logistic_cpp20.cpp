// Title: A small model written with C++20 features
// Standard: C++20
// Designated initialisers name the parameters; a concept restricts a template
// to floating-point types; std::span passes part of a trajectory without
// copying; a ranges view filters it; std::format and std::numbers do the rest.

#include <concepts>
#include <cstddef>
#include <format>
#include <iostream>
#include <numbers>
#include <ranges>
#include <span>
#include <vector>

struct Parameters {
    double r = 0.5;      // per-capita growth rate (per year)
    double K = 500.0;    // carrying capacity (individuals)
    double N0 = 10.0;    // initial population size (individuals)
    int years = 10;      // length of the run
};

template <std::floating_point T>
T logisticStep(T N, T r, T K) {
    return N + r * N * (T{1} - N / K);
}

std::vector<double> simulate(const Parameters& p) {
    std::vector<double> N{p.N0};
    for (int t = 0; t < p.years; ++t) N.push_back(logisticStep(N.back(), p.r, p.K));
    return N;
}

double mean(std::span<const double> values) {
    double sum = 0.0;
    for (const double v : values) sum += v;
    return values.empty() ? 0.0 : sum / static_cast<double>(values.size());
}

int main() {
    const Parameters p{.r = 0.9, .K = 400.0, .N0 = 5.0, .years = 12};
    const std::vector<double> N = simulate(p);

    std::cout << std::format("{:>4} {:>8}\n", "year", "N");
    for (std::size_t t = 0; t < N.size(); ++t) std::cout << std::format("{:>4} {:>8.2f}\n", t, N[t]);

    const std::span<const double> lastFive = std::span{N}.last(5);
    std::cout << std::format("mean of the last {} years: {:.2f}\n", lastFive.size(), mean(lastFive));

    auto aboveHalf = N | std::views::filter([&p](double n) { return n > p.K / 2; });
    std::cout << std::format("years above K/2: {}\n", std::ranges::distance(aboveHalf));

    const double plotAreaKm2 = std::numbers::pi * 1.5 * 1.5;  // circular plot of radius 1.5 km
    std::cout << std::format("final density: {:.1f} per km2\n", N.back() / plotAreaKm2);
    return 0;
}
