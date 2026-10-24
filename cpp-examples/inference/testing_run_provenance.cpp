// Title: Writing provenance at the top of every output file
// Standard: C++17
// Before any results, the program records what produced them: model version,
// git commit, compiler, language standard, build flags, seed and parameters.
// The commit and the flags are passed in when compiling, for example
//   g++ -std=c++17 -O2 -DGIT_COMMIT="\"$(git rev-parse --short HEAD)\"" -DBUILD_FLAGS="\"-O2\"" ...
// Usage: testing_run_provenance [seed]

#include <cstdint>
#include <iostream>
#include <random>
#include <string>

#ifndef GIT_COMMIT
#define GIT_COMMIT "unrecorded"
#endif
#ifndef BUILD_FLAGS
#define BUILD_FLAGS "unrecorded"
#endif

constexpr const char* kModelVersion = "1.2.0";

struct Parameters {
    double s0 = 0.9;   // survival of an uncrowded plant
    double a = 0.002;  // crowding per plant in the plot
    double f = 1.2;    // mean seeds per survivor
    int years = 10;
};

std::string compilerName() {
#if defined(__clang__)
    return "clang " + std::to_string(__clang_major__) + "." + std::to_string(__clang_minor__);
#elif defined(__GNUC__)
    return "gcc " + std::to_string(__GNUC__) + "." + std::to_string(__GNUC_MINOR__);
#elif defined(_MSC_VER)
    return "msvc " + std::to_string(_MSC_VER);
#else
    return "unknown";
#endif
}

void writeProvenance(std::ostream& out, const Parameters& p, std::uint64_t seed) {
    out << "# model version " << kModelVersion << ", commit " << GIT_COMMIT << '\n'
        << "# compiler " << compilerName() << ", __cplusplus " << __cplusplus << ", flags " << BUILD_FLAGS << '\n'
        << "# engine std::mt19937_64, seed " << seed << '\n'
        << "# s0 " << p.s0 << ", a " << p.a << ", f " << p.f << ", years " << p.years << '\n';
}

int main(int argc, char* argv[]) {
    const std::uint64_t seed = argc > 1 ? std::stoull(argv[1]) : 12345ULL;
    const Parameters p{};
    writeProvenance(std::cout, p, seed);

    std::mt19937_64 rng(seed);
    int N = 50;
    std::cout << "year,N\n0," << N << '\n';
    for (int year = 1; year <= p.years; ++year) {
        const double expected = N * p.s0 / (1.0 + p.a * N) * (1.0 + p.f);
        N = expected > 0.0 ? std::poisson_distribution<int>(expected)(rng) : 0;
        std::cout << year << ',' << N << '\n';
    }
    return 0;
}
