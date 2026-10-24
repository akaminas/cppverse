// Title: One class template, two classes
// Standard: C++17
// TimeSeries<int> records occupied patches in a simple metapopulation;
// TimeSeries<double> records plant cover. Both come from one template.

#include <cstddef>
#include <iomanip>
#include <iostream>
#include "time_series.hpp"

int main() {
    const int patches = 20;
    int occupied = 2;          // patches occupied (a count)
    double cover = 0.05;       // proportion of the plot covered by plants

    TimeSeries<int> occupancy;
    TimeSeries<double> plantCover;
    for (int year = 0; year < 6; ++year) {
        occupancy.record(occupied);
        plantCover.record(cover);
        // a third of the empty patches are colonised; a fifth of the occupied ones go extinct
        occupied = occupied + (patches - occupied) / 3 - occupied / 5;
        cover = cover + 0.9 * cover * (1.0 - cover);
    }

    std::cout << std::fixed << std::setprecision(3);
    std::cout << "year  occupied  cover\n";
    for (std::size_t t = 0; t < occupancy.size(); ++t) {
        std::cout << t << "     " << std::setw(2) << occupancy.at(t) << "        "
                  << plantCover.at(t) << '\n';
    }
    std::cout << "peaks: " << occupancy.peak() << " patches, cover " << plantCover.peak() << '\n';
    return 0;
}
