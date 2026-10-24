// Title: Multiplying a stage matrix by a population vector
// Standard: C++17
// Three years of a three-stage model, n(t+1) = A n(t). Element i of the new
// vector is the sum over j of A[i][j] * n[j].

#include <cstddef>
#include <iomanip>
#include <iostream>
#include <vector>

int main() {
    // Columns: stage this year; rows: stage next year (juvenile, subadult, adult).
    const std::vector<std::vector<double>> A{
        {0.0, 1.2, 3.0},   // offspring per subadult and per adult
        {0.3, 0.4, 0.0},   // juveniles that mature, subadults that stay
        {0.0, 0.5, 0.8},   // subadults that mature, adults that survive
    };
    std::vector<double> n{50.0, 20.0, 10.0};   // individuals per stage

    std::cout << std::fixed << std::setprecision(2);
    for (int year = 1; year <= 3; ++year) {
        std::vector<double> next(n.size(), 0.0);
        for (std::size_t i = 0; i < A.size(); ++i) {
            for (std::size_t j = 0; j < n.size(); ++j) {
                next[i] += A[i][j] * n[j];
            }
        }
        n = next;   // replace the whole state at once
        std::cout << "year " << year << ": " << n[0] << ' ' << n[1] << ' ' << n[2] << '\n';
    }
    return 0;
}
