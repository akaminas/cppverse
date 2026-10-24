// Title: Packing DNA bases into bits
// Standard: C++17
// A base needs only two bits (A = 00, C = 01, G = 10, T = 11), so a short
// k-mer fits in one unsigned integer. Shifts and masks pack and unpack it.

#include <bitset>
#include <iostream>

int main() {
    unsigned kmer = 0u;
    kmer = (kmer << 2) | 2u;   // G
    kmer = (kmer << 2) | 0u;   // A
    kmer = (kmer << 2) | 3u;   // T
    kmer = (kmer << 2) | 1u;   // C
    std::cout << "GATC packed: " << kmer << '\n';
    std::cout << "as 8 bits:   " << std::bitset<8>(kmer) << '\n';
    std::cout << "first base:  " << ((kmer >> 6) & 3u) << '\n';   // 2 means G
    std::cout << "last base:   " << (kmer & 3u) << '\n';          // 1 means C

    const int a = 6;   // binary 110
    const int b = 3;   // binary 011
    std::cout << "a & b = " << (a & b) << ", a | b = " << (a | b)
              << ", a ^ b = " << (a ^ b) << '\n';
    const int c = 1;   // binary 001: no bit in common with a
    std::cout << "a & c = " << (a & c) << ", yet a != 0 && c != 0 is "
              << std::boolalpha << (a != 0 && c != 0) << '\n';
    std::cout << "~a = " << ~a << '\n';
    std::cout << "a << 2 = " << (a << 2) << ", a >> 1 = " << (a >> 1) << '\n';
    return 0;
}
