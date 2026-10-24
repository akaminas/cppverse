// Title: A const reference cannot be used to modify
// Standard: C++17
// Expect: compile-error
// mean promises, through its const reference parameter, only to read the
// sample. The line that tries to convert the values in place is rejected.

#include <cstddef>
#include <iostream>
#include <vector>

double mean(const std::vector<double>& values) {
    double sum = 0.0;
    for (std::size_t i = 0; i < values.size(); ++i) {
        values[i] = values[i] / 1000.0;   // error: values is read-only here
        sum += values[i];
    }
    return sum / values.size();
}

int main() {
    const std::vector<double> masses{412.0, 388.5, 455.0};
    std::cout << mean(masses) << '\n';
    return 0;
}
