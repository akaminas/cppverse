// Title: An off-by-one error caught by .at()
// Standard: C++17
// Year-to-year changes need N[t + 1], which does not exist for the last t.
// The faulty loop uses .at(), so the mistake raises an exception instead of
// silently reading memory that does not belong to the vector.

#include <cstddef>
#include <iostream>
#include <stdexcept>
#include <vector>

int main() {
    const std::vector<int> N{120, 132, 150, 141, 158};  // five annual counts (illustrative)

    // Correct: five counts give four changes, so t stops at N.size() - 2.
    for (std::size_t t = 0; t + 1 < N.size(); ++t) {
        std::cout << "change " << t << " to " << t + 1 << ": " << N[t + 1] - N[t] << '\n';
    }

    // Faulty: t reaches N.size() - 1, and then t + 1 is past the end.
    try {
        for (std::size_t t = 0; t < N.size(); ++t) {
            const int change = N.at(t + 1) - N.at(t);
            std::cout << "change " << t << ": " << change << '\n';
        }
    } catch (const std::out_of_range&) {
        std::cout << "stopped: there is no element " << N.size() << " in a vector of size "
                  << N.size() << '\n';
    }
    return 0;
}
