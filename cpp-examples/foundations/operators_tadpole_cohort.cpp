// Title: Compound assignment and increment
// Standard: C++17
// A cohort of tadpoles loses a fixed fraction each week. Compound assignment
// and ++ express such updates compactly; prefix and postfix ++ differ in the
// value they hand back.

#include <iostream>

int main() {
    double tadpoles = 800.0;
    const double weeklySurvival = 0.75;
    int week = 0;

    tadpoles *= weeklySurvival;   // tadpoles = tadpoles * weeklySurvival
    ++week;
    std::cout << "week " << week << ": " << tadpoles << '\n';

    tadpoles *= weeklySurvival;
    ++week;
    std::cout << "week " << week << ": " << tadpoles << '\n';

    tadpoles -= 50.0;             // a predation event removes 50 more
    std::cout << "after predation: " << tadpoles << '\n';

    int metamorphosed = 3;
    const int before = metamorphosed++;   // postfix: old value, then increment
    const int after = ++metamorphosed;    // prefix: increment, then new value
    std::cout << before << ' ' << after << ' ' << metamorphosed << '\n';
    return 0;
}
