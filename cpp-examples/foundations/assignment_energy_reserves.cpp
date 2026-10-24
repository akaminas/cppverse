// Title: Assignment updates a state
// Standard: C++17
// A small bird's fat reserves change through one winter day. Each assignment
// replaces the old value of the variable by a new value computed from it.

#include <iostream>

int main() {
    double reserves = 2.0;            // grams of fat at dawn (illustrative)
    std::cout << "dawn: " << reserves << " g\n";

    reserves = reserves + 0.75;       // morning foraging
    std::cout << "noon: " << reserves << " g\n";

    reserves = reserves - 0.5;        // a cold afternoon
    std::cout << "dusk: " << reserves << " g\n";

    const double overnightCost = 1.25;
    reserves = reserves - overnightCost;
    std::cout << "next dawn: " << reserves << " g\n";
    return 0;
}
