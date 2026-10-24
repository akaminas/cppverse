// Title: A const_iterator cannot write
// Standard: C++17
// Expect: compile-error
// cbegin() returns a const_iterator: the element it refers to is read-only,
// so the assignment through it is rejected by the compiler.

#include <vector>

int main() {
    std::vector<double> masses{12.5, 9.8};
    std::vector<double>::const_iterator it = masses.cbegin();
    *it = 13.0;
    return 0;
}
