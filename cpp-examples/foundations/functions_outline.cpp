// Title: main as an outline, with prototypes
// Standard: C++17
// Prototypes at the top declare each function, so main can call them before
// their definitions appear. main then reads as a summary of the model run.

#include <iostream>

// Declarations (prototypes): return type, name and parameter types
void print_header(double lambda, double N0);
double next_generation(double N, double lambda);
double simulate(double N0, double lambda, int generations);

int main() {
    const double lambda = 1.25;   // growth factor per generation
    const double N0 = 32.0;       // initial population size
    const int generations = 6;

    print_header(lambda, N0);                                   // 1. describe the run
    const double N_final = simulate(N0, lambda, generations);   // 2. simulate
    std::cout << "N after " << generations << " generations: "  // 3. report
              << N_final << '\n';
    return 0;
}

void print_header(double lambda, double N0) {
    std::cout << "Geometric growth, lambda = " << lambda << ", N0 = " << N0 << '\n';
}

double next_generation(double N, double lambda) {
    return lambda * N;
}

double simulate(double N0, double lambda, int generations) {
    double N = N0;
    for (int t = 0; t < generations; ++t) {
        N = next_generation(N, lambda);
    }
    return N;
}
