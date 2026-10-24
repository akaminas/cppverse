// Title: Characters are small integers
// Standard: C++17
// A char holds one character, stored as a numeric code. Arithmetic on codes
// turns grid-column letters into indices; escape sequences write special
// characters such as tabs and quotes.

#include <iostream>

int main() {
    const char column = 'C';                      // grid columns are labelled A, B, C, ...
    std::cout << "column " << column << " is stored as the number "
              << static_cast<int>(column) << '\n';

    const int columnIndex = column - 'A';         // 'C' - 'A' is 2
    const char nextColumn = static_cast<char>(column + 1);
    std::cout << "index " << columnIndex << ", next column " << nextColumn << '\n';

    const char digit = '7';
    std::cout << "the character '7' has code " << static_cast<int>(digit)
              << " and digit value " << digit - '0' << '\n';

    std::cout << "plot\tnests\n";                 // \t is a tab
    std::cout << "C2\t12\n";
    std::cout << "a quote \", a backslash \\ and an apostrophe " << '\'' << '\n';
    return 0;
}
