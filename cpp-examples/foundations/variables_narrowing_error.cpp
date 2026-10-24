// Title: Braces refuse a narrowing conversion
// Standard: C++17
// Expect: compile-error
// An int cannot hold 4.5. With = the fraction would be dropped silently;
// with braces the compiler rejects the initialisation on line 10.

#include <iostream>

int main() {
    int meanClutchSize{4.5};
    std::cout << meanClutchSize << '\n';
    return 0;
}
