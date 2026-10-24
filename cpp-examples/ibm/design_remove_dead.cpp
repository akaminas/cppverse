// Title: Removing the dead with erase-remove and with swap-and-pop
// Standard: C++17
// Two correct ways to delete dead individuals from a std::vector. The
// erase-remove idiom keeps the survivors in their original order; swap-and-pop
// does less copying but changes the order of the survivors.

#include <algorithm>
#include <cstddef>
#include <iostream>
#include <vector>

struct Plant {
    int id;
    bool alive;
};

void report(const char* label, const std::vector<Plant>& plants) {
    std::cout << label << ':';
    for (const Plant& p : plants) std::cout << ' ' << p.id;
    std::cout << '\n';
}

int main() {
    const std::vector<Plant> census{{0, true}, {1, false}, {2, false}, {3, true},
                                    {4, true}, {5, false}, {6, true}};
    report("after the census ", census);

    // 1. Erase-remove: remove_if moves the survivors to the front, keeping
    //    their order, and returns the start of the leftover tail; erase cuts it.
    std::vector<Plant> a = census;
    a.erase(std::remove_if(a.begin(), a.end(), [](const Plant& p) { return !p.alive; }), a.end());
    report("erase-remove     ", a);

    // 2. Swap-and-pop: overwrite a dead plant with the last plant, then shrink.
    std::vector<Plant> b = census;
    std::size_t i = 0;
    while (i < b.size()) {
        if (!b[i].alive) {
            b[i] = b.back();
            b.pop_back();  // do not advance i: the plant moved into slot i is unchecked
        } else {
            ++i;
        }
    }
    report("swap-and-pop     ", b);
    return 0;
}
