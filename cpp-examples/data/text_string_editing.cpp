// Title: Editing, comparing and converting strings
// Standard: C++17
// Abbreviating a species name, building a file name, comparing site codes,
// and converting between text and numbers.

#include <iostream>
#include <string>

int main() {
    const std::string species = "Parus major";
    const std::string::size_type space = species.find(' ');
    const std::string shortName = species.substr(0, 1) + ". " + species.substr(space + 1);
    std::cout << shortName << '\n';

    std::string file = "counts_2024.csv";
    file.insert(7, "site3_");                     // insert before position 7
    std::cout << file << '\n';
    file.replace(file.find(".csv"), 4, ".tsv");   // replace 4 characters
    std::cout << file << '\n';
    file.erase(0, 7);                             // erase 7 characters from position 0
    std::cout << file << '\n';

    const std::string::size_type where = file.find("2023");
    if (where == std::string::npos) {
        std::cout << "\"2023\" does not occur in " << file << '\n';
    }

    const std::string plot9 = "PLOT9";
    const std::string plot10 = "PLOT10";
    const std::string plot09 = "PLOT09";
    std::cout << std::boolalpha;
    std::cout << "PLOT10 < PLOT9: " << (plot10 < plot9) << '\n';
    std::cout << "PLOT09 < PLOT10: " << (plot09 < plot10) << '\n';

    const double survival = std::stod("0.85");
    const int eggs = std::stoi("12 eggs");        // reads the leading number only
    std::cout << survival * 2 << ' ' << eggs + 1 << '\n';
    std::cout << std::to_string(survival) << '\n';
    return 0;
}
