// Title: Host–parasitoid dynamics and update order
// Standard: C++17
// Nicholson–Bailey dynamics with host self-limitation:
//     H(t+1) = H(t) exp(r (1 - H(t)/K) - a P(t))
//     P(t+1) = c H(t) (1 - exp(-a P(t)))
// Both equations use the state of generation t. The function
// sequentialStep shows a common bug: it overwrites H before computing P.
// Usage:  host_parasitoid [simultaneous|sequential] [generations]
// Output: CSV with the columns generation,H,P on standard output.

#include <cmath>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <string>

struct Parameters {
    double r = 1.2;   // host growth rate per generation
    double K = 80.0;  // host carrying capacity without parasitoids
    double a = 0.06;  // parasitoid searching efficiency
    double c = 0.8;   // parasitoids emerging per parasitised host
};

struct State {
    double H;  // hosts
    double P;  // parasitoids
};

// Correct: both right-hand sides are evaluated from the old state.
State simultaneousStep(const State& now, const Parameters& p) {
    const double nextH = now.H * std::exp(p.r * (1.0 - now.H / p.K) - p.a * now.P);
    const double nextP = p.c * now.H * (1.0 - std::exp(-p.a * now.P));
    return State{nextH, nextP};
}

// Bug: s.H is overwritten first, so the parasitoid equation sees the NEW hosts.
State sequentialStep(State s, const Parameters& p) {
    const double oldP = s.P;
    s.H = s.H * std::exp(p.r * (1.0 - s.H / p.K) - p.a * oldP);
    s.P = p.c * s.H * (1.0 - std::exp(-p.a * oldP));
    return s;
}

int main(int argc, char* argv[]) {
    const std::string order = argc > 1 ? argv[1] : "simultaneous";
    const int generations = argc > 2 ? std::stoi(argv[2]) : 80;
    if (order != "simultaneous" && order != "sequential") {
        std::cerr << "error: the update order must be 'simultaneous' or 'sequential'\n";
        return EXIT_FAILURE;
    }

    const Parameters p{};
    State s{20.0, 2.0};
    std::cout << "generation,H,P\n" << std::setprecision(12);
    std::cout << 0 << ',' << s.H << ',' << s.P << '\n';
    for (int t = 1; t <= generations; ++t) {
        s = (order == "simultaneous") ? simultaneousStep(s, p) : sequentialStep(s, p);
        std::cout << t << ',' << s.H << ',' << s.P << '\n';
    }
    return EXIT_SUCCESS;
}
