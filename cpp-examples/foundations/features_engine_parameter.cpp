// Title: Passing a random-number engine instead of hiding it
// Standard: C++17
// survivors draws from the engine it is given. Each replicate creates its
// own engine from a printed seed, so any run can be repeated exactly.

#include <cstdint>
#include <iostream>
#include <random>

int survivors(int n, double p_survive, std::mt19937_64& engine) {
    std::bernoulli_distribution survives{p_survive};
    int count = 0;
    for (int i = 0; i < n; ++i) {
        if (survives(engine)) {
            ++count;
        }
    }
    return count;
}

int main() {
    for (std::uint64_t seed = 1; seed <= 3; ++seed) {
        std::mt19937_64 engine{seed};
        std::cout << "seed " << seed << ": " << survivors(100, 0.8, engine)
                  << " of 100 survive\n";
    }
    return 0;
}
