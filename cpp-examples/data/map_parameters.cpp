// Title: Looking parameters up by name
// Standard: C++17
// A std::map from parameter names to values. find and at look a name up
// safely; operator[] inserts any name it does not find, even a misspelt one.

#include <iostream>
#include <map>
#include <stdexcept>
#include <string>

int main() {
    std::map<std::string, double> parameters{
        {"birth", 0.45},      // per individual per year
        {"death", 0.12},
        {"dispersal", 0.05},
    };
    parameters["death"] = 0.15;                 // existing key: [] assigns

    const auto it = parameters.find("birth");
    if (it != parameters.end()) {
        std::cout << it->first << " = " << it->second << '\n';
    }

    try {
        std::cout << parameters.at("mortality") << '\n';
    } catch (const std::out_of_range&) {
        std::cout << "no parameter called mortality\n";
    }

    const double typo = parameters["deaht"];    // missing key: [] inserts 0.0
    std::cout << "deaht = " << typo << "; the map now has " << parameters.size() << " entries:";
    for (const auto& [name, value] : parameters) {  // sorted by key
        std::cout << ' ' << name << '=' << value;
    }
    std::cout << '\n';
    return 0;
}
