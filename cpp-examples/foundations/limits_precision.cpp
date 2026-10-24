// Title: Limited precision of floating-point numbers
// Standard: C++17
// Three consequences of finite precision: a small increment absorbed by a
// large total, a decimal fraction that is not stored exactly, and a product
// of many probabilities that underflows to zero while its logarithm does not.

#include <cmath>
#include <iomanip>
#include <iostream>

int main() {
    // 1. Absorption: a float keeps only about 7 significant decimal digits.
    float biomassFloat = 2.0e7f;   // grams
    double biomassDouble = 2.0e7;
    biomassFloat += 0.5f;
    biomassDouble += 0.5;
    std::cout << std::fixed << std::setprecision(1);
    std::cout << "float total:  " << biomassFloat << '\n';
    std::cout << "double total: " << biomassDouble << '\n';

    // 2. 0.1 has no exact binary form, so ten of them do not sum to 1.
    double sum = 0.0;
    for (int i = 0; i < 10; ++i) {
        sum += 0.1;
    }
    std::cout << std::setprecision(17) << std::boolalpha;
    std::cout << "sum of ten 0.1: " << sum << '\n';
    std::cout << "sum == 1.0: " << (sum == 1.0) << '\n';
    std::cout << "within 1e-12 of 1.0: " << (std::abs(sum - 1.0) < 1e-12) << '\n';

    // 3. Underflow: the likelihood of 400 independent observations.
    const double probability = 0.01;   // probability of each observation
    double likelihood = 1.0;
    double logLikelihood = 0.0;
    int zeroAfter = 0;
    for (int i = 1; i <= 400; ++i) {
        likelihood *= probability;
        logLikelihood += std::log(probability);
        if (likelihood == 0.0 && zeroAfter == 0) {
            zeroAfter = i;
        }
    }
    std::cout << std::setprecision(4);
    std::cout << "likelihood: " << likelihood << '\n';
    std::cout << "it became exactly 0 after " << zeroAfter << " observations\n";
    std::cout << "log-likelihood: " << logLikelihood << '\n';
    return 0;
}
