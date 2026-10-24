// Title: Von Bertalanffy growth: the program
// Standard: C++17
// Uses the growth model only through its header. Build both source files:
//     g++ -std=c++17 -Wall -Wextra -pedantic main.cpp growth.cpp -o growth

#include "growth.hpp"

#include <iomanip>
#include <iostream>

int main() {
    const GrowthParameters fish{};  // the defaults declared in growth.hpp

    std::cout << "age (years)  length (cm)\n" << std::fixed << std::setprecision(2);
    for (int age = 0; age <= 10; age += 2) {
        std::cout << std::setw(11) << age << std::setw(13) << lengthAtAge(age, fish) << '\n';
    }
    std::cout << "age at 50 cm: " << ageAtLength(50.0, fish) << " years\n";
    return 0;
}
