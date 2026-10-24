// Title: Allele frequency from genotype counts
// Standard: C++17
// Counts are integers; frequencies are not. Dividing two ints discards the
// fraction, so one operand is converted to double before the division.

#include <iomanip>
#include <iostream>

int main() {
    const int nAA = 38;   // genotype counts in a sample (illustrative)
    const int nAa = 47;
    const int naa = 15;

    const int individuals = nAA + nAa + naa;
    const int allelesA = 2 * nAA + nAa;   // AA carries two copies of A, Aa one
    const int allelesTotal = 2 * individuals;

    const int wrong = allelesA / allelesTotal;                      // int / int
    const double p = static_cast<double>(allelesA) / allelesTotal;  // double / int
    const double q = 1.0 - p;

    std::cout << std::fixed << std::setprecision(3);
    std::cout << "A alleles: " << allelesA << " of " << allelesTotal << '\n';
    std::cout << "with integer division: " << wrong << '\n';
    std::cout << "p = " << p << ", q = " << q << '\n';
    std::cout << "expected heterozygosity 2pq = " << 2.0 * p * q << '\n';
    std::cout << "observed heterozygosity = "
              << static_cast<double>(nAa) / individuals << '\n';
    return 0;
}
