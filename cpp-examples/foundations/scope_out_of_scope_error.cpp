// Title: Using a name outside its block
// Standard: C++17
// Expect: compile-error
// germinated is declared inside the inner block, so line 15 cannot see it.

#include <iostream>

int main() {
    int seedlings = 40;
    {
        const int germinated = 8;
        seedlings = seedlings + germinated;
    }
    std::cout << seedlings << '\n';
    std::cout << germinated << '\n';
    return 0;
}
