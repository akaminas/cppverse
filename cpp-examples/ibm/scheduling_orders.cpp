// Title: One rule, three schedules, three outcomes
// Standard: C++17
// Seven plants stand in a row ('#' alive, '.' dead). Rule: a plant dies this
// year if both of its immediate neighbours are alive. Synchronous updating
// applies the rule to one census; sequential updating applies it plant by
// plant, so each death is seen by every plant visited after it.

#include <algorithm>
#include <cstddef>
#include <iostream>
#include <string>
#include <vector>

bool bothNeighboursAlive(const std::string& row, std::size_t i) {
    return i > 0 && i + 1 < row.size() && row[i - 1] == '#' && row[i + 1] == '#';
}

std::string synchronous(const std::string& census) {
    std::string next = census;
    for (std::size_t i = 0; i < census.size(); ++i) {
        if (census[i] == '#' && bothNeighboursAlive(census, i)) next[i] = '.';  // reads the census only
    }
    return next;
}

std::string sequential(std::string row, const std::vector<std::size_t>& order) {
    for (std::size_t i : order) {
        if (row[i] == '#' && bothNeighboursAlive(row, i)) row[i] = '.';  // takes effect at once
    }
    return row;
}

void report(const char* label, const std::string& row) {
    std::cout << label << row << "  (" << std::count(row.begin(), row.end(), '#') << " survive)\n";
}

int main() {
    const std::string start = "#######";
    report("start          ", start);
    report("synchronous    ", synchronous(start));
    report("left to right  ", sequential(start, {0, 1, 2, 3, 4, 5, 6}));
    report("evens first    ", sequential(start, {0, 2, 4, 6, 1, 3, 5}));
    return 0;
}
