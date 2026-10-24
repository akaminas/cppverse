// Title: A table for people and a file for programs
// Standard: C++17
// Basal metabolic rate from Kleiber's rule, B = B0 * mass^(3/4), printed as an
// aligned table with <iomanip> and written to a CSV file at full precision.

#include <cmath>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <string>
#include <vector>

struct Species {
    std::string name;
    double massKg;  // round, approximate adult body mass, for illustration
};

int main() {
    const double B0{3.4};  // W per kg^(3/4), a typical value for mammals
    const std::vector<Species> species{
        {"shrew", 0.005}, {"vole", 0.03}, {"hare", 3.5}, {"red deer", 120.0}, {"elephant", 4000.0}};

    // Console table: widths apply to one field only, so they are repeated.
    std::cout << std::left << std::setw(10) << "species" << std::right << std::setw(11) << "mass (kg)"
              << std::setw(9) << "B (W)" << std::setw(12) << "B/M (W/kg)" << '\n';
    for (const Species& s : species) {
        const double B = B0 * std::pow(s.massKg, 0.75);
        std::cout << std::left << std::setw(10) << s.name << std::right
                  << std::scientific << std::setprecision(2) << std::setw(11) << s.massKg
                  << std::fixed << std::setw(9) << B << std::setw(12) << B / s.massKg << '\n';
    }  // setprecision(2) above also governed the two fixed columns: precision is sticky

    // Notation and precision are sticky: they still apply here.
    std::cout << "B0 = " << B0 << '\n';
    std::cout << std::defaultfloat << std::setprecision(6) << "B0 = " << B0 << '\n';

    // Six significant digits hide the rounding error; max_digits10 shows every digit.
    const double sum = 0.1 + 0.2;
    std::cout << "0.1 + 0.2 = " << sum << '\n';
    std::cout << "0.1 + 0.2 = " << std::setprecision(std::numeric_limits<double>::max_digits10) << sum << '\n';

    // Machine-readable output: no padding, a plain separator, round-trip precision.
    std::ofstream out{"kleiber_rates.csv"};
    out << "species,mass_kg,bmr_w\n" << std::setprecision(std::numeric_limits<double>::max_digits10);
    for (const Species& s : species) {
        out << s.name << ',' << s.massKg << ',' << B0 * std::pow(s.massKg, 0.75) << '\n';
    }
    std::cout << "wrote kleiber_rates.csv\n";
    return 0;
}
