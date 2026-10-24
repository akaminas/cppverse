// Title: Writing a Beverton-Holt trajectory to a CSV file
// Standard: C++17
// One run of N(t+1) = R0 N(t) / (1 + N(t)/M), written to beverton_holt_output.csv:
// '#' metadata lines, a header row, then one row per generation at full precision.

#include <cstdlib>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <string>
#include <vector>

const std::string programVersion{"1.0.0"};

struct Parameters {
    double R0 = 2.2;       // growth factor per generation at low density
    double M = 40.0;       // density at which the growth factor is halved
    double N0 = 5.0;       // initial population size
    int generations = 30;  // number of generations to simulate
};

double nextGeneration(double N, const Parameters& p) {
    return p.R0 * N / (1.0 + N / p.M);
}

std::vector<double> simulate(const Parameters& p) {
    std::vector<double> trajectory{p.N0};  // one element so far: N(0)
    for (int t = 0; t < p.generations; ++t) {
        trajectory.push_back(nextGeneration(trajectory.back(), p));
    }
    return trajectory;
}

// Works for any output stream: a file, or std::cout while testing.
void writeTrajectory(std::ostream& out, const Parameters& p, const std::vector<double>& N) {
    const std::time_t now = std::time(nullptr);
    out << "# model: Beverton-Holt, N(t+1) = R0 * N(t) / (1 + N(t) / M)\n"
        << std::setprecision(std::numeric_limits<double>::digits10)  // parameters as typed
        << "# R0: " << p.R0 << "\n# M: " << p.M << "\n# N0: " << p.N0
        << "\n# generations: " << p.generations << '\n'
        << "# seed: none (deterministic model)\n"
        << "# program: bh_trajectory_csv " << programVersion << '\n'
        << "# created: " << std::put_time(std::gmtime(&now), "%Y-%m-%dT%H:%M:%SZ") << '\n';
    out << "generation,N\n"
        << std::setprecision(std::numeric_limits<double>::max_digits10);  // every bit
    for (std::size_t t = 0; t < N.size(); ++t) {
        out << t << ',' << N[t] << '\n';
    }
}

int main() {
    const Parameters p{};  // the default values above
    const std::vector<double> N = simulate(p);

    const std::string fileName{"beverton_holt_output.csv"};
    std::ofstream out{fileName};
    if (!out.is_open()) {
        std::cerr << "error: cannot create " << fileName << '\n';
        return EXIT_FAILURE;
    }
    writeTrajectory(out, p, N);
    out.close();  // close now, so that a failed write can still be detected
    if (out.fail()) {
        std::cerr << "error: writing " << fileName << " failed\n";
        return EXIT_FAILURE;
    }
    std::cout << "wrote " << N.size() << " rows to " << fileName << '\n';
    return EXIT_SUCCESS;
}
