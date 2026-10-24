// Title: Elasticities of a plant population's growth rate
// Standard: C++17
// Local sensitivity analysis of the three-stage plant model: each parameter
// p is raised and lowered by a fraction delta, and the elasticity
//     e_p = (p / lambda) dlambda/dp ~ (lambda(+) - lambda(-)) / (2 delta lambda)
// is estimated by a central finite difference.

#include <array>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

using Matrix = std::vector<std::vector<double>>;
using Parameters = std::array<double, 6>;

const std::array<std::string, 6> names{"fecundity", "seedling_survival", "stasis",
                                       "flowering", "reversion", "reflowering"};

Matrix stageMatrix(const Parameters& p) {
    return {{0.0, 0.0, p[0]}, {p[1], p[2], p[4]}, {0.0, p[3], p[5]}};
}

// Dominant eigenvalue by the power method (see algorithms/stage_matrix.cpp).
double growthRate(const Matrix& A, double tolerance = 1e-10) {
    std::vector<double> n(A.size(), 1.0 / static_cast<double>(A.size()));
    for (int it = 0; it < 10000; ++it) {
        std::vector<double> v(A.size(), 0.0);
        for (std::size_t i = 0; i < A.size(); ++i)
            for (std::size_t j = 0; j < n.size(); ++j) v[i] += A[i][j] * n[j];
        double lambda = 0.0;
        for (const double x : v) lambda += x;
        double change = 0.0;
        for (std::size_t i = 0; i < v.size(); ++i) {
            v[i] /= lambda;
            change += (v[i] - n[i]) * (v[i] - n[i]);
        }
        n = v;
        if (change < tolerance * tolerance) return lambda;
    }
    throw std::runtime_error("growthRate: the power method did not converge");
}

int main() {
    const Parameters baseline{4.5, 0.12, 0.5, 0.25, 0.35, 0.4};
    const double delta = 1e-3;  // relative perturbation: 0.1 %
    const double lambda = growthRate(stageMatrix(baseline));

    std::cout << std::fixed << std::setprecision(6) << "lambda," << lambda << '\n';
    std::cout << "parameter,value,elasticity\n" << std::setprecision(4);
    double sum = 0.0;
    for (std::size_t k = 0; k < baseline.size(); ++k) {
        Parameters up = baseline;
        Parameters down = baseline;
        up[k] *= 1.0 + delta;
        down[k] *= 1.0 - delta;
        const double lambdaUp = growthRate(stageMatrix(up));
        const double lambdaDown = growthRate(stageMatrix(down));
        const double elasticity = (lambdaUp - lambdaDown) / (2.0 * delta * lambda);
        sum += elasticity;
        std::cout << names[k] << ',' << baseline[k] << ',' << elasticity << '\n';
    }
    std::cout << "sum," << sum << '\n';
    return EXIT_SUCCESS;
}
