// Title: Finding the week in which an outbreak peaks
// Standard: C++17
// Simulates a weekly census of a disease in a closed host population, then
// finds the peak of the infected count with a single linear scan.

#include <cstddef>
#include <iomanip>
#include <iostream>
#include <vector>

// Infected hosts in weeks 0, 1, ..., weeks of a discrete-time SIR model.
std::vector<double> simulateInfected(int weeks) {
    const double hosts = 500.0;       // total host population (constant)
    const double transmission = 0.9;  // infections caused per infected host per week, all hosts susceptible
    const double recovery = 0.4;      // fraction of infected hosts that recover each week
    double S = 499.0;                 // susceptible hosts
    double I = 1.0;                   // infected hosts
    std::vector<double> infected{I};
    for (int week = 1; week <= weeks; ++week) {
        const double newInfections = transmission * S * I / hosts;
        const double recoveries = recovery * I;
        S = S - newInfections;
        I = I + newInfections - recoveries;
        infected.push_back(I);
    }
    return infected;
}

// Linear scan: remember where the largest value seen so far was.
// Precondition: values is not empty.
std::size_t indexOfMaximum(const std::vector<double>& values) {
    std::size_t best = 0;
    for (std::size_t i = 1; i < values.size(); ++i) {
        if (values[i] > values[best]) best = i;
    }
    return best;
}

int main() {
    const std::vector<double> infected = simulateInfected(20);
    std::cout << std::fixed << std::setprecision(1);
    std::cout << "week,infected\n";
    for (std::size_t week = 0; week < infected.size(); ++week) {
        std::cout << week << ',' << infected[week] << '\n';
    }
    const std::size_t peak = indexOfMaximum(infected);
    std::cout << "Peak: week " << peak << ", " << infected[peak] << " infected hosts\n";
    return 0;
}
