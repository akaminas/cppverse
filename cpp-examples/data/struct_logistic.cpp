// Title: A parameter set and a model state as structs
// Standard: C++17
// Discrete logistic growth, N(t+1) = N(t) + r N(t) (1 - N(t)/K). The two
// parameters travel together in one struct; each state records its year.

#include <cstddef>
#include <iomanip>
#include <iostream>
#include <vector>

struct Parameters {
    double r;   // growth rate per year
    double K;   // carrying capacity (individuals)
};

struct State {
    int year;
    double N;   // population size (individuals)
};

int main() {
    const Parameters p{0.8, 500.0};
    std::vector<State> trajectory;
    trajectory.push_back({0, 20.0});               // the initial state

    for (int t = 0; t < 8; ++t) {
        const State now = trajectory.back();
        const State next{now.year + 1, now.N + p.r * now.N * (1.0 - now.N / p.K)};
        trajectory.push_back(next);
    }

    std::cout << std::fixed << std::setprecision(1);
    std::cout << "year\tN\n";
    for (std::size_t i = 0; i < trajectory.size(); ++i) {
        std::cout << trajectory[i].year << '\t' << trajectory[i].N << '\n';
    }
    return 0;
}
