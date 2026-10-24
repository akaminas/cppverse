// Title: Two string literals cannot be added
// Standard: C++17
// Expect: compile-error
// "PLOT" and "07" are arrays of characters, not std::string objects, so +
// has nothing to work with. Making either operand a std::string fixes it.

#include <iostream>
#include <string>

int main() {
    const std::string code = "PLOT" + "07";
    std::cout << code << '\n';
    return 0;
}
