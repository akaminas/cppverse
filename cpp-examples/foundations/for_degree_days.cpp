// Title: Accumulating degree-days over a season
// Standard: C++17
// A running total is declared before the loop and updated inside it.
// Only the part of each day's temperature above the threshold counts.

#include <iostream>

int main() {
    const double base = 10.0;       // development threshold (degrees C)
    const int season_length = 20;   // days
    double degree_days = 0.0;       // running total

    for (int day = 1; day <= season_length; ++day) {
        const double temperature = 8.0 + 0.5 * day;   // a steady spring warming
        if (temperature > base) {
            degree_days += temperature - base;
        }
        if (day % 5 == 0) {
            std::cout << "day " << day << ": " << temperature << " C, total "
                      << degree_days << " degree-days\n";
        }
    }
    return 0;
}
