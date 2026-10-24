// Title: Positions in a container
// Standard: C++17
// begin() and end() mark a half-open range; *it reads or writes the element
// at a position; std::distance, std::next and std::advance work with positions.

#include <iostream>
#include <iterator>
#include <list>
#include <vector>

int main() {
    std::vector<double> masses{12.5, 9.8, 14.1, 11.0};   // body masses in grams

    // Write through an iterator: every individual gains 0.5 g.
    for (std::vector<double>::iterator it = masses.begin(); it != masses.end(); ++it) {
        *it += 0.5;
    }

    // A const_iterator can only read.
    std::cout << "masses:";
    for (std::vector<double>::const_iterator it = masses.cbegin(); it != masses.cend(); ++it) {
        std::cout << ' ' << *it;
    }
    std::cout << '\n';

    // Search for the first individual heavier than 14 g.
    auto it = masses.cbegin();
    while (it != masses.cend() && *it <= 14.0) {
        ++it;
    }
    if (it != masses.cend()) {
        std::cout << "first above 14 g: " << *it << " at position "
                  << std::distance(masses.cbegin(), it) << '\n';
    }

    // Random access: jump straight to a position.
    const auto third = masses.cbegin() + 2;
    std::cout << "third: " << *third << ", the next one: " << *std::next(third) << '\n';

    // A list iterator moves one step at a time, forwards or backwards.
    std::list<int> ages{1, 3, 2, 5};
    auto pos = ages.begin();
    std::advance(pos, 2);
    std::cout << "third age: " << *pos;
    --pos;
    std::cout << ", the one before it: " << *pos << '\n';
    return 0;
}
