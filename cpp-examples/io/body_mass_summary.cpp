// Title: Summarising body masses read from a file
// Standard: C++17
// Reads body masses (g) from vole_masses.txt with the loop while (in >> mass),
// prints the sample size, mean and standard deviation, and writes them to a file.

#include <cmath>
#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <vector>

int main() {
    std::ifstream in{"vole_masses.txt"};
    if (!in.is_open()) {
        std::cerr << "error: cannot open vole_masses.txt\n";
        return EXIT_FAILURE;
    }

    std::vector<double> masses;
    double sum{0.0};
    double mass{0.0};
    while (in >> mass) {  // the read itself is the loop condition
        masses.push_back(mass);
        sum += mass;
    }
    if (!in.eof()) {  // the loop stopped before the end of the file
        std::cerr << "error: entry " << masses.size() + 1 << " is not a number\n";
        return EXIT_FAILURE;
    }
    if (masses.size() < 2) {
        std::cerr << "error: need at least two masses\n";
        return EXIT_FAILURE;
    }

    const double n = static_cast<double>(masses.size());
    const double mean = sum / n;
    double squares{0.0};
    for (std::size_t i = 0; i < masses.size(); ++i) {
        squares += (masses[i] - mean) * (masses[i] - mean);
    }
    const double sd = std::sqrt(squares / (n - 1.0));

    std::cout << std::fixed << std::setprecision(2);
    std::cout << "n    = " << masses.size() << '\n';
    std::cout << "mean = " << mean << " g\n";
    std::cout << "sd   = " << sd << " g\n";

    std::ofstream out{"vole_mass_summary.csv"};  // created, or emptied if it exists
    if (!out.is_open()) {
        std::cerr << "error: cannot create vole_mass_summary.csv\n";
        return EXIT_FAILURE;
    }
    out << "n,mean_g,sd_g\n";  // out has its own settings: std::fixed above was for cout
    out << masses.size() << ',' << mean << ',' << sd << '\n';
    std::cout << "summary written to vole_mass_summary.csv\n";
    return EXIT_SUCCESS;
}  // in and out are closed here, when they go out of scope
