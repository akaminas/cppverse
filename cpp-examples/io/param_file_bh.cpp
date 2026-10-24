// Title: Model parameters from a key-value file
// Standard: C++17
// Usage: param_file_bh [parameter file]   (default: bh_params.txt)
// Every key must be known and appear exactly once; '#' starts a comment.

#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <stdexcept>
#include <string>
#include <vector>

struct Parameters {
    double R0{0.0};
    double M{0.0};
    double N0{0.0};
    int generations{0};
    bool writeTrajectory{false};
    std::string outputFile;
};

bool contains(const std::vector<std::string>& list, const std::string& word) {
    for (const std::string& item : list) {
        if (item == word) return true;
    }
    return false;
}

Parameters readParameters(const std::string& fileName) {
    std::ifstream in{fileName};
    if (!in.is_open()) throw std::runtime_error{"cannot open " + fileName};
    in >> std::boolalpha;  // read bool values as the words true and false

    const std::vector<std::string> keys{"R0", "M", "N0", "generations", "write_trajectory", "output_file"};
    std::vector<std::string> seen;
    Parameters p;
    std::string key;
    while (in >> key) {
        if (key.front() == '#') {  // a comment runs to the end of the line
            in.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            continue;
        }
        if (!contains(keys, key)) throw std::runtime_error{"unknown key '" + key + "'"};
        if (contains(seen, key)) throw std::runtime_error{"key '" + key + "' appears twice"};
        seen.push_back(key);

        if (key == "R0") in >> p.R0;
        else if (key == "M") in >> p.M;
        else if (key == "N0") in >> p.N0;
        else if (key == "generations") in >> p.generations;
        else if (key == "write_trajectory") in >> p.writeTrajectory;
        else in >> p.outputFile;
        if (in.fail()) throw std::runtime_error{"bad or missing value for '" + key + "'"};
    }
    for (const std::string& k : keys) {
        if (!contains(seen, k)) throw std::runtime_error{"missing key '" + k + "'"};
    }
    if (!(p.R0 > 0.0 && p.M > 0.0 && p.N0 >= 0.0 && p.generations >= 0)) {  // false for NaN too
        throw std::runtime_error{"need R0 > 0, M > 0, N0 >= 0 and generations >= 0"};
    }
    return p;
}

int main(int argc, char* argv[]) {
    std::string fileName{"bh_params.txt"};
    if (argc > 1) fileName = argv[1];

    Parameters p;
    try {
        p = readParameters(fileName);
    } catch (const std::exception& e) {
        std::cerr << "error in " << fileName << ": " << e.what() << '\n';
        return EXIT_FAILURE;
    }
    std::clog << "parameters read from " << fileName << '\n';  // progress log

    std::cout << std::boolalpha << "R0 = " << p.R0 << ", M = " << p.M << ", N0 = " << p.N0
              << ", generations = " << p.generations << ", write_trajectory = " << p.writeTrajectory << '\n';

    std::ofstream out;
    if (p.writeTrajectory) {
        out.open(p.outputFile);
        if (!out.is_open()) {
            std::cerr << "error: cannot create " << p.outputFile << '\n';
            return EXIT_FAILURE;
        }
        out << "generation,N\n" << std::setprecision(std::numeric_limits<double>::max_digits10);
    }
    double N = p.N0;
    if (p.writeTrajectory) out << 0 << ',' << N << '\n';
    for (int t = 1; t <= p.generations; ++t) {
        N = p.R0 * N / (1.0 + N / p.M);
        if (p.writeTrajectory) out << t << ',' << N << '\n';
    }
    std::cout << "N after " << p.generations << " generations: "
              << std::fixed << std::setprecision(4) << N << '\n';
    if (p.writeTrajectory) std::cout << "trajectory written to " << p.outputFile << '\n';
    return EXIT_SUCCESS;
}
