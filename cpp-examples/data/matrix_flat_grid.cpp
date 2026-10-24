// Title: A grid stored in one flat vector
// Standard: C++17
// A landscape of 3 x 5 patches kept in a single vector. The patch in row r
// and column c is element r * cols + c.

#include <cstddef>
#include <iostream>
#include <vector>

int main() {
    const std::size_t rows = 3;
    const std::size_t cols = 5;
    std::vector<int> occupied(rows * cols, 0);   // 15 patches, all empty

    // Colonise a block of patches: rows 1 and 2, columns 1 to 3.
    for (std::size_t r = 1; r < rows; ++r) {
        for (std::size_t c = 1; c <= 3; ++c) {
            occupied[r * cols + c] = 1;
        }
    }

    for (std::size_t r = 0; r < rows; ++r) {
        for (std::size_t c = 0; c < cols; ++c) {
            if (c > 0) {
                std::cout << ' ';
            }
            std::cout << occupied[r * cols + c];
        }
        std::cout << '\n';
    }
    std::cout << "patch (2, 3) is element " << 2 * cols + 3 << " of " << occupied.size() << '\n';
    return 0;
}
