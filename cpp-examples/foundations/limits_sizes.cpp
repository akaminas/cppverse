// Title: Sizes and ranges of the built-in types
// Standard: C++17
// Sizes and limits are implementation-defined, so the output depends on the
// compiler and the platform: run it on your own machine and compare.

#include <cstdint>
#include <iostream>
#include <limits>

int main() {
    std::cout << "integer types: bytes, largest value\n";
    std::cout << "short         " << sizeof(short) << "  "
              << std::numeric_limits<short>::max() << '\n';
    std::cout << "int           " << sizeof(int) << "  "
              << std::numeric_limits<int>::max() << '\n';
    std::cout << "long          " << sizeof(long) << "  "
              << std::numeric_limits<long>::max() << '\n';
    std::cout << "long long     " << sizeof(long long) << "  "
              << std::numeric_limits<long long>::max() << '\n';
    std::cout << "std::int64_t  " << sizeof(std::int64_t) << "  "
              << std::numeric_limits<std::int64_t>::max() << '\n';

    std::cout << "\nfloating-point types: bytes, decimal digits, epsilon\n";
    std::cout << "float         " << sizeof(float) << "  "
              << std::numeric_limits<float>::digits10 << "  "
              << std::numeric_limits<float>::epsilon() << '\n';
    std::cout << "double        " << sizeof(double) << "  "
              << std::numeric_limits<double>::digits10 << "  "
              << std::numeric_limits<double>::epsilon() << '\n';
    std::cout << "long double   " << sizeof(long double) << "  "
              << std::numeric_limits<long double>::digits10 << "  "
              << std::numeric_limits<long double>::epsilon() << '\n';

    const int eggs = 3;
    const int seeds = 2'000'000'000;
    std::cout << '\n' << eggs << " eggs: " << sizeof eggs << " bytes; "
              << seeds << " seeds: " << sizeof seeds << " bytes\n";
    return 0;
}
