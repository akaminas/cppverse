// Title: A function for survival probability
// Standard: C++17
// survival_probability packages one formula behind a name; main calls it
// three times with different arguments.

#include <cmath>
#include <iomanip>
#include <iostream>

// Probability of surviving a number of days at a constant daily mortality rate
double survival_probability(double daily_mortality, int days) {
    return std::exp(-daily_mortality * days);
}

int main() {
    const double mortality = 0.05;   // per day
    std::cout << std::fixed << std::setprecision(3);
    std::cout << "10 days: " << survival_probability(mortality, 10) << '\n';
    std::cout << "30 days: " << survival_probability(mortality, 30) << '\n';
    std::cout << "60 days: " << survival_probability(mortality, 60) << '\n';
    return 0;
}
