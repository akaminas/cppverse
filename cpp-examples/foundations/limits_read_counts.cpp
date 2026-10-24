// Title: Counting sequencing reads without overflow
// Standard: C++17
// A sequencing run can yield more reads and bases than a 32-bit integer can
// hold. 64-bit integers are large enough; unsigned 32-bit arithmetic does
// not fail, it silently wraps around and gives a wrong count.

#include <cstdint>
#include <iostream>
#include <limits>

int main() {
    const std::int64_t readsPerLane = 400'000'000;   // illustrative run
    const std::int64_t lanes = 8;
    const std::int64_t readLength = 150;             // bases per read

    const std::int64_t reads = readsPerLane * lanes;
    const std::int64_t bases = reads * readLength;
    std::cout << "reads: " << reads << '\n';
    std::cout << "bases: " << bases << '\n';
    std::cout << "largest std::int32_t: "
              << std::numeric_limits<std::int32_t>::max() << '\n';

    // Unsigned arithmetic is defined to wrap around modulo 2^32.
    const std::uint32_t reads32 = 400'000'000u * 8u;
    const std::uint32_t bases32 = reads32 * 150u;
    std::cout << "bases counted in std::uint32_t: " << bases32 << '\n';

    // Signed overflow is undefined behaviour: test for room before adding.
    const std::int32_t total = std::numeric_limits<std::int32_t>::max() - 10;
    const std::int32_t more = 25;
    if (total > std::numeric_limits<std::int32_t>::max() - more) {
        std::cout << "adding " << more << " would overflow std::int32_t\n";
    }
    return 0;
}
