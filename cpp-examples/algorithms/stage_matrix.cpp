// Title: A stage-structured plant population
// Standard: C++17
// Three stages (seedlings, vegetative rosettes, flowering plants) projected
// by a matrix: n(t+1) = A n(t). The dominant eigenvalue (lambda, the
// asymptotic growth rate) and the stable stage structure are found by
// renormalised iteration (the power method).
// Output: the matrix, a 20-year projection, then lambda and the structure.

#include <cmath>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <vector>

using Matrix = std::vector<std::vector<double>>;
using Vector = std::vector<double>;

struct StageParameters {
    double fecundity = 4.5;          // seedlings per flowering plant per year
    double seedlingSurvival = 0.12;  // seedlings that become rosettes
    double stasis = 0.5;             // rosettes that stay rosettes
    double flowering = 0.25;         // rosettes that flower next year
    double reversion = 0.35;         // flowering plants that revert to rosettes
    double reflowering = 0.4;        // flowering plants that flower again
};

Matrix stageMatrix(const StageParameters& p) {
    return {
        {0.0, 0.0, p.fecundity},
        {p.seedlingSurvival, p.stasis, p.reversion},
        {0.0, p.flowering, p.reflowering},
    };
}

// y = A x, written into a NEW vector so that every stage is updated from
// the same old state (a simultaneous update).
Vector multiply(const Matrix& A, const Vector& x) {
    Vector y(A.size(), 0.0);
    for (std::size_t i = 0; i < A.size(); ++i) {
        for (std::size_t j = 0; j < x.size(); ++j) {
            y[i] += A[i][j] * x[j];
        }
    }
    return y;
}

double total(const Vector& x) {
    double sum = 0.0;
    for (double v : x) sum += v;
    return sum;
}

struct Dominant {
    double lambda;
    Vector structure;
    int iterations;
};

Dominant powerIteration(const Matrix& A, double tolerance = 1e-10, int maxIterations = 10000) {
    if (A.empty()) throw std::invalid_argument("powerIteration: empty matrix");
    const std::size_t k = A.size();
    Vector n(k, 1.0 / static_cast<double>(k));
    for (int it = 1; it <= maxIterations; ++it) {
        Vector v = multiply(A, n);
        const double lambda = total(v);
        if (lambda <= 0.0) throw std::runtime_error("powerIteration: the population vanished");
        double change = 0.0;
        for (std::size_t i = 0; i < k; ++i) {
            v[i] /= lambda;
            change += (v[i] - n[i]) * (v[i] - n[i]);
        }
        n = v;
        if (change < tolerance * tolerance) return {lambda, n, it};
    }
    throw std::runtime_error("powerIteration: no convergence within the iteration limit");
}

int main() {
    try {
        const Matrix A = stageMatrix(StageParameters{});
        std::cout << std::fixed << std::setprecision(4);
        std::cout << "Projection matrix:\n";
        for (const auto& row : A) {
            for (double a : row) std::cout << std::setw(9) << a;
            std::cout << '\n';
        }

        std::cout << "\nyear,seedlings,vegetative,flowering,total\n";
        Vector n{100.0, 20.0, 5.0};
        for (int year = 0; year <= 20; ++year) {
            std::cout << year << ',' << n[0] << ',' << n[1] << ',' << n[2] << ',' << total(n) << '\n';
            n = multiply(A, n);
        }

        const Dominant d = powerIteration(A);
        std::cout << std::setprecision(10);
        std::cout << "\nlambda," << d.lambda << '\n';
        std::cout << "structure," << d.structure[0] << ',' << d.structure[1] << ',' << d.structure[2] << '\n';
        std::cout << "iterations," << d.iterations << '\n';
    } catch (const std::exception& e) {
        std::cerr << "error: " << e.what() << '\n';
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}
