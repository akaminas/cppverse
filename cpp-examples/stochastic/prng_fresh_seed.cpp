// Title: A fixed or a fresh seed, always recorded
// Standard: C++17
// With a seed on the command line the run can be repeated exactly; without
// one, std::random_device supplies a fresh seed. Either way the seed is the
// first line of the output, so every run can be reproduced later.
// Usage:  prng_fresh_seed [seed]

#include <cstdint>
#include <iostream>
#include <random>
#include <string>

// A seed from the operating system's source of randomness, where available.
std::uint64_t freshSeed() {
    std::random_device device;
    const std::uint64_t high = device();  // each call gives 32 random bits
    const std::uint64_t low = device();
    return (high << 32) | low;
}

int main(int argc, char* argv[]) {
    const std::uint64_t seed = argc > 1 ? std::stoull(argv[1]) : freshSeed();
    std::cout << "seed," << seed << '\n';  // record the seed with the results

    std::mt19937_64 engine(seed);
    for (int i = 1; i <= 3; ++i) {
        std::cout << "number_" << i << ',' << engine() << '\n';
    }
    return 0;
}
