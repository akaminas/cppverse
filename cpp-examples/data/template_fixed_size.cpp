// Title: Values as template parameters, defaults and static_assert
// Standard: C++17
// total works for a std::array of any length N, deduced at compile time.
// mean has a default result type, double, and rejects non-numeric elements.

#include <array>
#include <cstddef>
#include <iostream>
#include <type_traits>
#include <vector>

template <std::size_t N>
double total(const std::array<double, N>& state) {
    double sum = 0.0;
    for (double x : state) {
        sum += x;
    }
    return sum;
}

template <typename Result = double, typename T>
Result mean(const std::vector<T>& values) {   // values must not be empty
    static_assert(std::is_arithmetic_v<T>, "mean() needs a vector of numbers");
    Result sum{};
    for (const T& v : values) {
        sum += v;
    }
    return sum / static_cast<Result>(values.size());
}

int main() {
    const std::array<double, 3> stages{120.0, 45.5, 30.25};  // juveniles, subadults, adults
    const std::array<double, 2> sexes{61.0, 59.0};           // females, males
    std::cout << total(stages) << ' ' << total(sexes) << '\n';

    const std::vector<int> clutches{4, 5, 6, 6};
    std::cout << mean(clutches) << ' ' << mean<int>(clutches) << '\n';
    // mean(std::vector<std::string>{"a"}) would stop at the static_assert.
    return 0;
}
