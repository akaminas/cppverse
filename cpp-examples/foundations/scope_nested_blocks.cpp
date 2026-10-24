// Title: Blocks, scope and shadowing
// Standard: C++17
// A name exists from its declaration to the end of the enclosing block.
// An inner declaration with the same name hides (shadows) the outer one.

#include <iostream>

double temperature = 12.0;   // global: visible in the whole file

int main() {
    std::cout << "global temperature: " << temperature << '\n';

    int seedlings = 40;                       // local to main
    {
        const int germinated = 8;             // local to this block
        seedlings = seedlings + germinated;
        std::cout << "inside the block: " << seedlings << '\n';
    }                                         // germinated ends here
    std::cout << "after the block: " << seedlings << '\n';

    {
        const double temperature = 18.5;      // shadows the global
        std::cout << "local temperature: " << temperature << '\n';
        std::cout << "::temperature: " << ::temperature << '\n';
    }
    std::cout << "global again: " << temperature << '\n';
    return 0;
}
