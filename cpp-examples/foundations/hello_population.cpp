// Title: Printing text and computed values
// Standard: C++17
// std::cout prints text and numbers; << chains several items together.

#include <iostream>

int main() {
    std::cout << "A first population census\n";
    std::cout << "Adults counted: " << 120 << '\n';
    std::cout << "Juveniles counted: " << 45 << '\n';
    std::cout << "Total: " << 120 + 45 << '\n';
    return 0;
}
