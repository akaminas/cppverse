// Title: Validating model parameters with exceptions
// Standard: C++17
// Reads Beverton–Holt scenarios (name R0 M N0) from standard input. An
// impossible parameter value rejects one scenario and the run continues;
// unreadable input is a fatal error that is reported in main.

#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>

struct Scenario {
    std::string name;
    double R0 = 0.0;  // growth factor per generation at low density
    double M = 0.0;   // density at which the growth factor is halved
    double N0 = 0.0;  // initial population size
};

// Throws std::invalid_argument if a value is biologically impossible.
void validate(const Scenario& s) {
    std::ostringstream problem;
    if (!(s.R0 > 0.0)) problem << "R0 must be positive (got " << s.R0 << ')';
    else if (!(s.M > 0.0)) problem << "M must be positive (got " << s.M << ')';
    else if (!(s.N0 >= 0.0)) problem << "N0 cannot be negative (got " << s.N0 << ')';
    if (!problem.str().empty()) throw std::invalid_argument(problem.str());
}

// Returns false at the end of the input; throws if a line is malformed.
bool readScenario(std::istream& in, Scenario& s) {
    if (!(in >> s.name)) return false;
    if (!(in >> s.R0 >> s.M >> s.N0)) {
        throw std::runtime_error(std::string("scenario '") + s.name + "': expected three numbers");
    }
    return true;
}

int main() {
    try {
        Scenario s;
        int accepted = 0;
        std::cout << std::fixed << std::setprecision(1);
        while (readScenario(std::cin, s)) {
            try {
                validate(s);
                ++accepted;
                if (s.R0 > 1.0) std::cout << s.name << ": equilibrium " << (s.R0 - 1.0) * s.M << '\n';
                else std::cout << s.name << ": declines to extinction\n";
            } catch (const std::invalid_argument& e) {
                std::cout << s.name << ": rejected, " << e.what() << '\n';
            }
        }
        std::cout << accepted << " scenarios accepted\n";
    } catch (const std::exception& e) {
        std::cerr << "fatal error: " << e.what() << '\n';
        return EXIT_FAILURE;
    } catch (...) {
        std::cerr << "fatal error: unknown exception\n";
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}
