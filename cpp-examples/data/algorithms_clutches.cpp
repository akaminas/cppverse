// Title: Sorting, searching and counting with standard algorithms
// Standard: C++17
// Clutch sizes from a nest survey (illustrative values) processed with
// algorithms from <algorithm> and <numeric>, and with lambdas written on the spot.

#include <algorithm>
#include <functional>
#include <iostream>
#include <iterator>
#include <numeric>
#include <string>
#include <vector>

template <typename T>
void print(const std::string& label, const std::vector<T>& values) {
    std::cout << label << ':';
    for (const T& v : values) {
        std::cout << ' ' << v;
    }
    std::cout << '\n';
}

int main() {
    std::vector<int> clutches{5, 3, 6, 4, 6, 2, 5};   // eggs per nest

    std::sort(clutches.begin(), clutches.end());
    print("ascending", clutches);
    std::sort(clutches.begin(), clutches.end(), std::greater<int>());
    print("descending", clutches);

    const auto four = std::find(clutches.begin(), clutches.end(), 4);
    if (four != clutches.end()) {
        std::cout << "first clutch of 4 at position " << std::distance(clutches.begin(), four) << '\n';
    }

    const int eggs = std::accumulate(clutches.begin(), clutches.end(), 0);
    const auto large = std::count_if(clutches.begin(), clutches.end(), [](int c) { return c >= 5; });
    const auto [smallest, largest] = std::minmax_element(clutches.begin(), clutches.end());
    std::cout << eggs << " eggs, " << large << " clutches of 5 or more, sizes "
              << *smallest << " to " << *largest << '\n';

    int threshold = 4;
    const auto atLeast = [threshold](int c) { return c >= threshold; };  // copies threshold now
    threshold = 6;
    std::cout << "threshold is now " << threshold << ", but the lambda still counts "
              << std::count_if(clutches.begin(), clutches.end(), atLeast) << " clutches of 4 or more\n";

    int eggsInLarge = 0;
    std::for_each(clutches.begin(), clutches.end(), [&eggsInLarge](int c) {  // refers to eggsInLarge
        if (c >= 5) eggsInLarge += c;
    });
    std::cout << eggsInLarge << " eggs in large clutches\n";

    std::vector<double> fledglings(clutches.size());
    std::transform(clutches.begin(), clutches.end(), fledglings.begin(),
                   [](int c) { return 0.6 * c; });            // 60 per cent survive to fledging
    print("expected fledglings", fledglings);
    return 0;
}
