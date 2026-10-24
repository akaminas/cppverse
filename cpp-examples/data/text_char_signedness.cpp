// Title: Is plain char signed?
// Standard: C++17
// The answer depends on the compiler and the processor, so this program
// prints what your platform does. Its output is not the same everywhere.

#include <iostream>
#include <limits>

int main() {
    std::cout << std::boolalpha;
    std::cout << "plain char is signed here: " << std::numeric_limits<char>::is_signed << '\n';
    std::cout << "signed char: " << static_cast<int>(std::numeric_limits<signed char>::min())
              << " to " << static_cast<int>(std::numeric_limits<signed char>::max()) << '\n';
    std::cout << "unsigned char: 0 to "
              << static_cast<int>(std::numeric_limits<unsigned char>::max()) << '\n';
    return 0;
}
