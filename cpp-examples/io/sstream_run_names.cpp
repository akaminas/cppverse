// Title: Building output file names with std::ostringstream
// Standard: C++17
// Formats a growth factor, a replicate number and a seed into one file name per
// run, using the same << and manipulators as std::cout.

#include <cstdint>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

std::string runFileName(double R0, int replicate, std::uint64_t seed) {
    std::ostringstream name;
    name << "bh_R0-" << std::fixed << std::setprecision(1) << R0
         << "_rep" << std::setw(2) << std::setfill('0') << replicate
         << "_seed" << seed << ".csv";
    return name.str();  // the text collected so far, as a std::string
}

int main() {
    const std::vector<double> growthFactors{1.5, 2.2, 3.0};
    const int replicates{2};
    std::uint64_t seed{42};  // one distinct, recorded seed per run

    for (std::size_t i = 0; i < growthFactors.size(); ++i) {
        for (int rep = 1; rep <= replicates; ++rep) {
            std::cout << runFileName(growthFactors[i], rep, seed) << '\n';
            ++seed;
        }
    }
    return 0;
}
