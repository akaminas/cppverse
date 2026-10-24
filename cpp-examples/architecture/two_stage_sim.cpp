// Title: A complete procedural simulation of a juvenile-adult population
// Standard: C++17
//     J(t+1) = b A(t) / (1 + A(t) / M)        A(t+1) = sj J(t) + sa A(t)
// Usage: two_stage_sim [b] [sj] [sa] [generations]   Output: two_stage_output.csv

#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <stdexcept>
#include <string>
#include <vector>

struct Parameters {
    double b = 4.0;         // juveniles recruited per adult at low adult density
    double sj = 0.3;        // probability that a juvenile survives to become an adult
    double sa = 0.5;        // probability that an adult survives one generation
    double M = 50.0;        // adult density at which recruitment per adult is halved
    double J0 = 0.0;        // initial juveniles
    double A0 = 10.0;       // initial adults
    int generations = 30;
};

struct State {
    double juveniles = 0.0;
    double adults = 0.0;
};

void validate(const Parameters& p) {  // written so that NaN fails every test
    const bool ok = p.b > 0.0 && p.M > 0.0 && p.sj >= 0.0 && p.sj <= 1.0 && p.sa >= 0.0 &&
                    p.sa < 1.0 && p.J0 >= 0.0 && p.A0 >= 0.0 && p.generations >= 1;
    if (!ok) throw std::invalid_argument{"need b, M > 0; 0 <= sj <= 1; 0 <= sa < 1; generations >= 1"};
}

// One generation. Both new values are computed from the current state.
State step(State s, const Parameters& p) {
    const double recruits = p.b * s.adults / (1.0 + s.adults / p.M);
    const double adults = p.sj * s.juveniles + p.sa * s.adults;
    return State{recruits, adults};
}

std::vector<State> simulate(const Parameters& p) {
    std::vector<State> trajectory{State{p.J0, p.A0}};
    for (int t = 0; t < p.generations; ++t) {
        trajectory.push_back(step(trajectory.back(), p));
    }
    return trajectory;
}

double number(const std::string& text) {  // the whole argument must be a number
    std::size_t used{0};
    const double value = std::stod(text, &used);
    if (used != text.size()) throw std::invalid_argument{"'" + text + "' is not a number"};
    return value;
}

int wholeNumber(const std::string& text) {
    std::size_t used{0};
    const int value = std::stoi(text, &used);
    if (used != text.size()) throw std::invalid_argument{"'" + text + "' is not a whole number"};
    return value;
}

void writeCsv(const std::string& fileName, const Parameters& p, const std::vector<State>& trajectory) {
    std::ofstream out{fileName};
    if (!out.is_open()) throw std::runtime_error{"cannot create " + fileName};
    out << std::setprecision(std::numeric_limits<double>::digits10)
        << "# model: two-stage juvenile-adult population, Beverton-Holt recruitment\n"
        << "# b: " << p.b << "\n# sj: " << p.sj << "\n# sa: " << p.sa << "\n# M: " << p.M
        << "\n# J0: " << p.J0 << "\n# A0: " << p.A0 << "\n# generations: " << p.generations
        << "\n# program: two_stage_sim 1.0.0\n"
        << "generation,stage,count\n" << std::setprecision(std::numeric_limits<double>::max_digits10);
    for (std::size_t t = 0; t < trajectory.size(); ++t) {
        out << t << ",juvenile," << trajectory[t].juveniles << '\n'
            << t << ",adult," << trajectory[t].adults << '\n';
    }
    out.close();
    if (out.fail()) throw std::runtime_error{"writing " + fileName + " failed"};
}

int main(int argc, char* argv[]) {
    Parameters p;
    try {
        if (argc > 5) throw std::invalid_argument{"usage: two_stage_sim [b] [sj] [sa] [generations]"};
        if (argc > 1) p.b = number(argv[1]);
        if (argc > 2) p.sj = number(argv[2]);
        if (argc > 3) p.sa = number(argv[3]);
        if (argc > 4) p.generations = wholeNumber(argv[4]);
        validate(p);
        const std::vector<State> trajectory = simulate(p);
        writeCsv("two_stage_output.csv", p, trajectory);

        const double R0 = p.b * p.sj / (1.0 - p.sa);  // recruits per adult lifetime at low density
        const State last = trajectory.back();
        std::cout << std::fixed << std::setprecision(2) << "R0 = " << R0 << '\n'
                  << "generation " << p.generations << ": juveniles " << last.juveniles
                  << ", adults " << last.adults << '\n';
        if (R0 > 1.0) {
            const double adults = p.M * (R0 - 1.0);
            std::cout << "equilibrium:   juveniles " << (1.0 - p.sa) * adults / p.sj
                      << ", adults " << adults << '\n';
        }
    } catch (const std::exception& e) {
        std::cerr << "error: " << e.what() << '\n';
        return EXIT_FAILURE;
    }
    std::cout << "wrote two_stage_output.csv\n";
    return EXIT_SUCCESS;
}
