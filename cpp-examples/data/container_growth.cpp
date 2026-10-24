// Title: Watching a vector grow
// Standard: C++17
// Prints size() and capacity() whenever appending an element forces a
// reallocation, then repeats the experiment after reserve(). Growth factors
// differ between standard libraries, so the output differs between compilers.

#include <cstddef>
#include <iostream>
#include <vector>

int main() {
    std::vector<double> masses;
    std::size_t lastCapacity = masses.capacity();
    int reallocations = 0;
    std::cout << "size capacity\n";
    for (int i = 0; i < 20; ++i) {
        masses.push_back(0.5 * i);
        if (masses.capacity() != lastCapacity) {   // the storage was replaced
            ++reallocations;
            lastCapacity = masses.capacity();
            std::cout << masses.size() << ' ' << masses.capacity() << '\n';
        }
    }
    std::cout << reallocations << " reallocations for 20 elements\n";

    std::vector<double> planned;
    planned.reserve(20);                            // room for 20; size is still 0
    const std::size_t reserved = planned.capacity();
    for (int i = 0; i < 20; ++i) {
        planned.push_back(0.5 * i);
    }
    std::cout << "after reserve(20): capacity " << reserved << ", unchanged after 20 push_backs: "
              << std::boolalpha << (planned.capacity() == reserved) << '\n';
    return 0;
}
