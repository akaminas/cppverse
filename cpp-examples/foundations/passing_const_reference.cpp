// Title: Reading a sample through a const reference
// Standard: C++17
// mean and count_above read the whole sample without copying it, and const
// guarantees that they cannot change it. to_kilograms is meant to modify
// its argument, so it takes a plain reference. The masses are illustrative.

#include <cstddef>
#include <iomanip>
#include <iostream>
#include <vector>

double mean(const std::vector<double>& values) {
    double sum = 0.0;
    for (std::size_t i = 0; i < values.size(); ++i) {
        sum += values[i];
    }
    return sum / values.size();
}

int count_above(const std::vector<double>& values, double threshold) {
    int count = 0;
    for (std::size_t i = 0; i < values.size(); ++i) {
        if (values[i] > threshold) {
            ++count;
        }
    }
    return count;
}

void to_kilograms(std::vector<double>& values) {
    for (std::size_t i = 0; i < values.size(); ++i) {
        values[i] = values[i] / 1000.0;
    }
}

int main() {
    std::vector<double> masses{412.0, 388.5, 455.0, 401.5, 437.0};   // grams
    std::cout << std::fixed << std::setprecision(1);
    std::cout << "mean mass: " << mean(masses) << " g\n";
    std::cout << "heavier than 420 g: " << count_above(masses, 420.0) << '\n';

    to_kilograms(masses);
    std::cout << std::setprecision(4);
    std::cout << "mean mass: " << mean(masses) << " kg\n";
    return 0;
}
