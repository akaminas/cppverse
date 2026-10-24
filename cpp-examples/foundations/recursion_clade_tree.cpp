// Title: Recursion over a nested tree of clades
// Standard: C++17
// A clade is either a leaf with a known number of species or a group of
// smaller clades. count_species calls itself on every subclade; leaves are
// the base case. The tree and its numbers are illustrative.

#include <iostream>
#include <string>
#include <vector>

struct Clade {
    std::string name;
    int species;                   // used by leaves only
    std::vector<Clade> subclades;  // empty for a leaf
};

int count_species(const Clade& clade) {
    if (clade.subclades.empty()) {
        return clade.species;      // base case: a leaf
    }
    int total = 0;
    for (const Clade& sub : clade.subclades) {
        total += count_species(sub);   // recursive case: one call per subclade
    }
    return total;
}

int main() {
    const Clade tree{"root", 0, {
        {"clade A", 0, {
            {"genus A1", 4, {}},
            {"genus A2", 7, {}},
        }},
        {"genus B", 12, {}},
        {"clade C", 0, {
            {"genus C1", 2, {}},
            {"clade C2", 0, {
                {"genus C2a", 1, {}},
                {"genus C2b", 3, {}},
            }},
        }},
    }};

    std::cout << "species in the whole tree: " << count_species(tree) << '\n';
    const Clade& c = tree.subclades[2];
    std::cout << "species in " << c.name << ": " << count_species(c) << '\n';
    return 0;
}
