// Title: One function template, several types
// Standard: C++17
// clampTo keeps a value inside [low, high] and total adds up a vector. The
// compiler writes a separate version of each for every type it is used with.

#include <iostream>
#include <vector>

template <typename T>
T clampTo(T value, T low, T high) {
    if (value < low) {
        return low;
    }
    if (value > high) {
        return high;
    }
    return value;
}

template <typename T>
T total(const std::vector<T>& values) {
    T sum{};                                 // zero of type T
    for (const T& v : values) {
        sum += v;
    }
    return sum;
}

int main() {
    // Occupied nest boxes cannot exceed the 12 boxes available ...
    const int occupied = clampTo(14, 0, 12);              // T = int
    // ... and an estimated probability must lie in [0, 1].
    const double survival = clampTo(1.08, 0.0, 1.0);      // T = double
    const double germination = clampTo<double>(0.35, 0, 1);  // T given explicitly
    std::cout << occupied << ' ' << survival << ' ' << germination << '\n';

    const std::vector<int> eggs{4, 6, 5};
    const std::vector<double> biomass{0.5, 1.25};         // grams
    std::cout << total(eggs) << ' ' << total(biomass) << '\n';
    return 0;
}
