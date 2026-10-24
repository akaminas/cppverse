// Title: Integer division and the remainder operator
// Standard: C++17
// With two int operands, / discards the fraction and % gives the remainder.
// Together they turn a running day count into a week and a day of the week,
// and keep an index on a ring of habitat patches within range.

#include <iostream>

int main() {
    const int day = 45;   // days since the start of an experiment (day 0)
    std::cout << "day " << day << " is in week " << day / 7
              << ", weekday " << day % 7 << '\n';

    std::cout << "7 / 2 = " << 7 / 2 << ", 7 % 2 = " << 7 % 2 << '\n';
    std::cout << "-7 / 2 = " << -7 / 2 << ", -7 % 2 = " << -7 % 2 << '\n';

    const int patches = 6;   // patches arranged in a ring: 0, 1, ..., 5
    const int patch = 5;
    std::cout << "neighbours of patch " << patch << ": "
              << (patch + patches - 1) % patches << " and "
              << (patch + 1) % patches << '\n';
    return 0;
}
