// Title: A grid of quadrat counts as a vector of rows
// Standard: C++17
// Seedlings counted in a 3 x 4 grid: rows are transects, columns are quadrats
// along each transect. Nested loops print the grid with row and column totals.

#include <cstddef>
#include <iostream>
#include <vector>

int main() {
    const std::size_t transects = 3;   // rows
    const std::size_t quadrats = 4;    // columns

    // transects rows, each a vector of quadrats zeros
    std::vector<std::vector<int>> seedlings(transects, std::vector<int>(quadrats, 0));

    seedlings[0][1] = 5;               // transect 0, quadrat 1
    seedlings[1][3] = 2;
    seedlings[2][0] = 8;
    seedlings[2][1] = 4;

    for (std::size_t i = 0; i < seedlings.size(); ++i) {          // each row
        int rowTotal = 0;
        for (std::size_t j = 0; j < seedlings[i].size(); ++j) {   // each column of row i
            std::cout << seedlings[i][j] << ' ';
            rowTotal += seedlings[i][j];
        }
        std::cout << "| " << rowTotal << '\n';
    }

    std::vector<int> columnTotals(quadrats, 0);
    for (std::size_t i = 0; i < seedlings.size(); ++i) {
        for (std::size_t j = 0; j < seedlings[i].size(); ++j) {
            columnTotals[j] += seedlings[i][j];
        }
    }
    std::cout << "column totals:";
    for (int total : columnTotals) {
        std::cout << ' ' << total;
    }
    std::cout << '\n';
    return 0;
}
