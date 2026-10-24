// Title: How literals are written
// Standard: C++17
// Literals are values written directly in the code. Their notation decides
// their type: integer or floating point, decimal, hexadecimal, binary or octal.

#include <iostream>

int main() {
    const long long genomeLength = 3'100'000'000LL;  // base pairs (illustrative)
    const double mutationRate = 1.2e-8;              // per base pair per generation

    std::cout << "genome length: " << genomeLength << " bp\n";
    std::cout << "mutation rate: " << mutationRate << '\n';
    std::cout << "new mutations per genome copy: " << genomeLength * mutationRate << '\n';

    std::cout << "0x3F = " << 0x3F << '\n';
    std::cout << "0b1010 = " << 0b1010 << '\n';
    std::cout << "017 = " << 017 << " (a leading zero means octal)\n";
    std::cout << "7 / 2 = " << 7 / 2 << ", but 7.0 / 2 = " << 7.0 / 2 << '\n';
    return 0;
}
