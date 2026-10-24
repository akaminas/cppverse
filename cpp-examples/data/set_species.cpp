// Title: A set of species codes
// Standard: C++17
// Building a set from a list of sightings removes the duplicates and sorts
// the codes. count and find answer "has this species been seen?".

#include <iostream>
#include <set>
#include <string>
#include <vector>

int main() {
    const std::vector<std::string> sightings{"PARMAJ", "CYACAE", "PARMAJ", "FICHYP", "CYACAE"};
    std::set<std::string> species(sightings.begin(), sightings.end());

    std::cout << sightings.size() << " sightings of " << species.size() << " species:";
    for (const std::string& code : species) {    // always in sorted order
        std::cout << ' ' << code;
    }
    std::cout << '\n';

    species.insert("SITEUR");                    // new: added
    species.insert("PARMAJ");                    // already present: ignored
    std::cout << "after two inserts: " << species.size() << " species\n";

    std::cout << "FICHYP seen: " << species.count("FICHYP")
              << ", ERIRUB seen: " << species.count("ERIRUB") << '\n';
    const auto it = species.find("CYACAE");
    if (it != species.end()) {
        species.erase(it);                       // erase at a position found by find
    }
    std::cout << "first code after erasing CYACAE: " << *species.begin() << '\n';
    return 0;
}
