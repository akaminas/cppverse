// Title: Reading a data file that contains entries that are not numbers
// Standard: C++17
// Reads one body mass per line from vole_masses_field.txt. A line that is not a
// number is reported on std::cerr and skipped with clear() and ignore().

#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <vector>

int main() {
    std::ifstream in{"vole_masses_field.txt"};
    if (!in.is_open()) {
        std::cerr << "error: cannot open vole_masses_field.txt\n";
        return EXIT_FAILURE;
    }

    std::vector<double> masses;
    int line{0};
    int skipped{0};
    double mass{0.0};
    while (true) {
        if (in >> mass) {                // a number: keep it
            ++line;
            masses.push_back(mass);
        } else if (in.eof()) {           // nothing left to read
            break;
        } else if (in.bad()) {           // the stream itself is broken
            std::cerr << "error: reading failed after line " << line << '\n';
            return EXIT_FAILURE;
        } else {                         // failbit only: this line is not a number
            ++line;
            ++skipped;
            std::cerr << "warning: line " << line << " is not a number; skipped\n";
            in.clear();                  // reset the error flags, then
            in.ignore(std::numeric_limits<std::streamsize>::max(), '\n');  // discard the line
        }
    }

    double sum{0.0};
    for (std::size_t i = 0; i < masses.size(); ++i) {
        sum += masses[i];
    }
    std::cout << "valid masses: " << masses.size() << ", skipped lines: " << skipped << '\n';
    if (!masses.empty()) {
        const double mean = sum / static_cast<double>(masses.size());
        std::cout << "mean of the valid masses: " << std::fixed << std::setprecision(2) << mean << " g\n";
    }
    return EXIT_SUCCESS;
}
