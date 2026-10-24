// Title: Seedlings must not reproduce in the year of their birth
// Standard: C++17
// A plot has 10 microsites. Each plant sets one seed, which establishes if a
// microsite is still free. The buggy loop re-reads plants.size(), so it also
// visits the seedlings it has just appended. The correct loop fixes the
// number of parents before any seedling is added.

#include <cstddef>
#include <iostream>
#include <vector>

struct Plant {
    int id;
    int parent;  // -1 for a founder
};

constexpr std::size_t kMicrosites = 10;

void reproduceBuggy(std::vector<Plant>& plants) {
    for (std::size_t i = 0; i < plants.size(); ++i) {  // size() grows inside the loop
        if (plants.size() < kMicrosites) {
            const int id = static_cast<int>(plants.size());
            plants.push_back(Plant{id, plants[i].id});
        }
    }
}

void reproduceCorrect(std::vector<Plant>& plants) {
    const std::size_t parents = plants.size();  // fixed before any seedling is added
    for (std::size_t i = 0; i < parents; ++i) {
        if (plants.size() < kMicrosites) {
            const int id = static_cast<int>(plants.size());
            plants.push_back(Plant{id, plants[i].id});
        }
    }
}

void report(const char* label, const std::vector<Plant>& plants) {
    std::cout << label << ": " << plants.size() << " plants; seedling<-parent:";
    for (const Plant& p : plants) {
        if (p.parent >= 0) std::cout << ' ' << p.id << "<-" << p.parent;
    }
    std::cout << '\n';
}

int main() {
    const std::vector<Plant> founders{{0, -1}, {1, -1}, {2, -1}};
    std::vector<Plant> buggy = founders;
    std::vector<Plant> correct = founders;
    reproduceBuggy(buggy);
    reproduceCorrect(correct);
    report("buggy  ", buggy);
    report("correct", correct);
    return 0;
}
