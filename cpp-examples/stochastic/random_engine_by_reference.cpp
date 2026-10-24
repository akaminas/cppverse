// Title: Pass the engine by reference
// Standard: C++17
// A function that takes the engine BY VALUE draws from a copy: every call
// returns the same number and the caller's engine never moves on. Creating
// a new engine inside a loop restarts the sequence in the same way. Only
// raw engine output is printed, so the output is the same everywhere.

#include <cstdint>
#include <iostream>
#include <random>

std::uint64_t drawFromCopy(std::mt19937_64 engine) { return engine(); }      // bug
std::uint64_t drawFromShared(std::mt19937_64& engine) { return engine(); }   // correct

int main() {
    const std::uint64_t seed = 99;
    std::mt19937_64 engine(seed);

    std::cout << "engine passed by value:\n";
    for (int call = 0; call < 3; ++call) std::cout << "  " << drawFromCopy(engine) << '\n';

    std::cout << "engine passed by reference:\n";
    for (int call = 0; call < 3; ++call) std::cout << "  " << drawFromShared(engine) << '\n';

    std::cout << "new engine in every iteration:\n";
    for (int call = 0; call < 3; ++call) {
        std::mt19937_64 restarted(seed);  // bug: back to the start each time
        std::cout << "  " << restarted() << '\n';
    }
    return 0;
}
