// Title: Model parameters from the command line
// Standard: C++17
// Usage: cli_args_bh [R0] [M] [N0] [generations]
// Arguments that are left out keep their defaults; malformed ones stop the program.

#include <cmath>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <string>

struct Parameters {
    double R0 = 2.2;       // growth factor per generation at low density
    double M = 40.0;       // density at which the growth factor is halved
    double N0 = 5.0;       // initial population size
    int generations = 30;  // number of generations to simulate
};

// The whole argument must be a number: "2.5x" is rejected, not read as 2.5.
double toDouble(const std::string& text) {
    std::size_t used{0};
    const double value = std::stod(text, &used);  // throws if there is no number at all
    if (used != text.size()) throw std::invalid_argument{"'" + text + "' is not a number"};
    return value;
}

int toInt(const std::string& text) {
    std::size_t used{0};
    const int value = std::stoi(text, &used);
    if (used != text.size()) throw std::invalid_argument{"'" + text + "' is not a whole number"};
    return value;
}

int main(int argc, char* argv[]) {
    if (argc > 5) {
        std::cerr << "usage: " << argv[0] << " [R0] [M] [N0] [generations]\n";
        return EXIT_FAILURE;
    }
    Parameters p;
    try {
        if (argc > 1) p.R0 = toDouble(argv[1]);
        if (argc > 2) p.M = toDouble(argv[2]);
        if (argc > 3) p.N0 = toDouble(argv[3]);
        if (argc > 4) p.generations = toInt(argv[4]);
    } catch (const std::exception& e) {  // std::invalid_argument or std::out_of_range
        std::cerr << "error: bad argument: " << e.what() << '\n';
        return EXIT_FAILURE;
    }
    const bool finite = std::isfinite(p.R0) && std::isfinite(p.M) && std::isfinite(p.N0);
    if (!finite || p.R0 <= 0.0 || p.M <= 0.0 || p.N0 < 0.0 || p.generations < 0) {
        std::cerr << "error: need R0 > 0, M > 0, N0 >= 0 and generations >= 0\n";
        return EXIT_FAILURE;
    }

    double N = p.N0;
    for (int t = 0; t < p.generations; ++t) {
        N = p.R0 * N / (1.0 + N / p.M);
    }
    std::cout << "arguments received: " << argc - 1 << '\n';
    std::cout << "R0 = " << p.R0 << ", M = " << p.M << ", N0 = " << p.N0
              << ", generations = " << p.generations << '\n';
    std::cout << "N after " << p.generations << " generations: "
              << std::fixed << std::setprecision(4) << N << '\n';
    return EXIT_SUCCESS;
}
