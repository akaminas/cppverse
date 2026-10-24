// Title: Building and checking a projection matrix
// Standard: C++17
// The projection matrix of a perennial plant is the sum A = U + F of a
// survival-and-transition matrix U and a fecundity matrix F. No column of U
// may sum to more than 1: a stage cannot send on more plants than it holds.

#include <cstddef>
#include <initializer_list>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

using Matrix = std::vector<std::vector<double>>;
using Vector = std::vector<double>;

const std::vector<std::string> stages{"seedlings", "vegetative", "flowering"};

// Throws std::invalid_argument if U is not a valid survival matrix.
void checkSurvival(const Matrix& U) {
    for (std::size_t j = 0; j < U.size(); ++j) {
        double surviving = 0.0;  // fraction of stage j alive next year, in any stage
        for (std::size_t i = 0; i < U.size(); ++i) {
            if (U[i][j] < 0.0) {
                throw std::invalid_argument(std::string("negative entry in the ") + stages[j] + " column");
            }
            surviving += U[i][j];
        }
        // The small margin allows for rounding when the entries sum to exactly 1.
        if (surviving > 1.0 + 1e-12) {
            throw std::invalid_argument(std::string("survival out of ") + stages[j] + " exceeds 1");
        }
    }
}

Matrix add(const Matrix& U, const Matrix& F) {
    Matrix A = U;
    for (std::size_t i = 0; i < A.size(); ++i)
        for (std::size_t j = 0; j < A[i].size(); ++j) A[i][j] += F[i][j];
    return A;
}

// n(t+1) = A n(t), written into a new vector.
Vector project(const Matrix& A, const Vector& n) {
    Vector next(n.size(), 0.0);
    for (std::size_t i = 0; i < A.size(); ++i)
        for (std::size_t j = 0; j < n.size(); ++j) next[i] += A[i][j] * n[j];
    return next;
}

int main() {
    const Matrix F{{0.0, 0.0, 4.5}, {0.0, 0.0, 0.0}, {0.0, 0.0, 0.0}};
    const Matrix survival{{0.0, 0.0, 0.0}, {0.12, 0.5, 0.35}, {0.0, 0.25, 0.4}};
    const Matrix mistyped{{0.0, 0.0, 0.0}, {0.12, 0.8, 0.35}, {0.0, 0.25, 0.4}};  // 0.8 typed for 0.5

    std::cout << std::fixed << std::setprecision(2);
    for (const Matrix& U : {survival, mistyped}) {
        try {
            checkSurvival(U);
            const Vector next = project(add(U, F), Vector{100.0, 20.0, 5.0});
            std::cout << "accepted; next year:";
            for (std::size_t i = 0; i < next.size(); ++i) std::cout << ' ' << stages[i] << ' ' << next[i];
            std::cout << '\n';
        } catch (const std::invalid_argument& e) {
            std::cout << "rejected: " << e.what() << '\n';
        }
    }
    return 0;
}
