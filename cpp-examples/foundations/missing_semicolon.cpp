// Title: A program with a deliberate error
// Standard: C++17
// Expect: compile-error
// The statement on line 9 has no semicolon, so the compiler rejects the program.

#include <iostream>

int main() {
    std::cout << "Census complete\n"
    return 0;
}
