// Title: Fixed-size containers: std::array and std::bitset
// Standard: C++17
// An SIR state has exactly three compartments, so it fits a std::array.
// Occupancy of ten habitat patches is a set of yes/no flags: a std::bitset.

#include <array>
#include <bitset>
#include <iostream>
#include <stdexcept>

int main() {
    std::array<double, 3> sir{0.99, 0.01, 0.0};      // S, I, R as proportions
    std::cout << "compartments: " << sir.size() << ", I = " << sir[1] << '\n';
    try {
        sir.at(3) = 0.5;                              // there is no fourth compartment
    } catch (const std::out_of_range&) {
        std::cout << "at(3) is out of range\n";
    }

    std::bitset<10> occupied;                         // ten patches, all empty
    occupied.set(0);
    occupied.set(3);
    occupied.set(4);
    occupied.flip(9);                                 // empty -> occupied
    std::cout << "occupied:           " << occupied << " (" << occupied.count() << " patches)\n";

    const std::bitset<10> suitable("1110011011");    // leftmost character is patch 9
    const std::bitset<10> colonisable = suitable & ~occupied;
    std::cout << "suitable:           " << suitable << '\n';
    std::cout << "suitable and empty: " << colonisable << '\n';
    std::cout << std::boolalpha << "patch 3 occupied: " << occupied.test(3)
              << "; colonisable patches: " << colonisable.count() << '\n';

    occupied.reset(3);                                // local extinction
    std::cout << "after extinction:   " << occupied << '\n';
    return 0;
}
