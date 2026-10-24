// Title: Summarising a trajectory with standard algorithms
// Standard: C++17
// The logistic map x(t+1) = r x(t) (1 - x(t)) with r = 2.8 overshoots its
// equilibrium and settles in damped oscillations. Standard algorithms find
// the peak and its time, the mean, and when the trajectory has settled.

#include <algorithm>
#include <cmath>
#include <iomanip>
#include <iostream>
#include <iterator>
#include <numeric>
#include <vector>

int main() {
    const double r = 2.8;                       // maximum growth factor
    std::vector<double> x{0.05};                // scaled density in generation 0
    for (int t = 0; t < 30; ++t) {
        x.push_back(r * x.back() * (1.0 - x.back()));
    }
    const double equilibrium = 1.0 - 1.0 / r;

    const auto peak = std::max_element(x.begin(), x.end());
    const auto peakTime = std::distance(x.begin(), peak);
    const double mean = std::accumulate(x.begin(), x.end(), 0.0) / static_cast<double>(x.size());
    const auto above = std::count_if(x.begin(), x.end(),
                                     [equilibrium](double v) { return v > equilibrium; });
    const double tolerance = 0.01;
    const auto settled = std::find_if(x.begin(), x.end(), [&](double v) {
        return std::abs(v - equilibrium) < tolerance;
    });

    std::cout << std::fixed << std::setprecision(4);
    std::cout << "equilibrium 1 - 1/r: " << equilibrium << '\n';
    std::cout << "peak " << *peak << " in generation " << peakTime << '\n';
    std::cout << "mean of " << x.size() << " values: " << mean << '\n';
    std::cout << above << " values above the equilibrium\n";
    if (settled != x.end()) {
        std::cout << "first within " << tolerance << " of it: generation "
                  << std::distance(x.begin(), settled) << '\n';
    }
    return 0;
}
