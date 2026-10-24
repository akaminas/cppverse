// Title: Creating and changing vectors
// Standard: C++17
// The common ways to create a std::vector, and the member functions that
// add, remove and inspect elements.

#include <iostream>
#include <vector>

int main() {
    std::vector<int> nestsPerPlot(4);           // four elements, all 0
    std::vector<double> survival(3, 0.85);      // three copies of 0.85
    std::vector<int> clutchSizes{4, 6, 5, 3};   // exactly these four values
    std::vector<int> original = clutchSizes;    // an independent copy

    nestsPerPlot[2] = 7;                        // write the third element
    std::cout << "nests: " << nestsPerPlot[0] << ' ' << nestsPerPlot[1] << ' '
              << nestsPerPlot[2] << ' ' << nestsPerPlot[3] << '\n';
    std::cout << "survival of stage 1: " << survival[1] << '\n';

    clutchSizes.push_back(7);                   // append: size 4 -> 5
    clutchSizes.pop_back();                     // remove the last: size 5 -> 4
    clutchSizes.front() = 2;                    // overwrite the first element
    std::cout << "first " << clutchSizes.front() << ", last " << clutchSizes.back()
              << ", size " << clutchSizes.size() << '\n';
    std::cout << "the copy still starts with " << original.front() << '\n';

    int eggs = 0;
    for (int clutch : clutchSizes) {            // range-for: each element in turn
        eggs += clutch;
    }
    std::cout << "eggs in all clutches: " << eggs << '\n';

    std::vector<int> newPlot;                   // no elements at all
    std::cout << std::boolalpha << "new plot is empty: " << newPlot.empty() << '\n';
    return 0;
}
