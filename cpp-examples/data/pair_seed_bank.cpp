// Title: (time, value) samples as pairs
// Standard: C++17
// A seed bank loses 30 per cent of its seeds each year. Every second year
// the year and the seed density are stored together as a std::pair.

#include <cstddef>
#include <iomanip>
#include <iostream>
#include <utility>
#include <vector>

int main() {
    std::vector<std::pair<int, double>> samples;   // (year, seeds per square metre)

    double seeds = 800.0;
    for (int year = 0; year <= 8; ++year) {
        if (year % 2 == 0) {
            samples.push_back({year, seeds});      // braces build the pair
        }
        seeds *= 0.7;
    }

    std::cout << std::fixed << std::setprecision(1);
    for (std::size_t i = 0; i < samples.size(); ++i) {
        std::cout << "year " << samples[i].first << ": " << samples[i].second << '\n';
    }

    const std::pair<int, double> last = samples.back();
    const auto [year, density] = last;             // structured binding (C++17)
    std::cout << "last sample: year " << year << ", " << density << " seeds\n";

    const std::pair<int, double> early{2, 1000.0};
    std::cout << std::boolalpha << "(2, 1000.0) < (4, 192.1): " << (early < samples[2]) << '\n';
    return 0;
}
