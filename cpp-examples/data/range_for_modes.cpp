// Title: auto, type aliases and range-for
// Standard: C++17
// A range-for variable can be a copy, a reference or a const reference.
// Only a reference changes the elements; a const reference reads them
// without copying. Aliases and auto shorten long type names.

#include <iostream>
#include <map>
#include <string>
#include <vector>

using Masses = std::vector<double>;              // a type alias (modern form)
typedef std::map<std::string, int> NestCounts;   // the same idea, older form

int main() {
    Masses masses{12.5, 9.8, 14.1};              // grams

    std::cout << "copies:";
    for (double m : masses) {                    // m is a copy of each element
        m += 1.0;
        std::cout << ' ' << m;
    }
    std::cout << "; first element still " << masses[0] << '\n';

    for (double& m : masses) {                   // m refers to each element
        m += 1.0;
    }
    std::cout << "after the reference loop, first element " << masses[0] << '\n';

    const std::vector<std::string> sites{"DUNE-04", "MARSH-02", "HEATH-11"};
    for (const std::string& site : sites) {      // read only, no copies
        std::cout << site << (site == sites.back() ? "\n" : ", ");
    }

    NestCounts nests{{"DUNE-04", 12}, {"MARSH-02", 7}};
    for (auto& [site, count] : nests) {          // structured binding, by reference
        count += 1;                              // one more nest found at every site
    }
    for (const auto& [site, count] : nests) {
        std::cout << site << ": " << count << " nests\n";
    }

    const auto found = nests.find("MARSH-02");   // NestCounts::iterator, deduced
    if (found != nests.end()) {
        std::cout << "MARSH-02 has " << found->second << " nests\n";
    }
    return 0;
}
