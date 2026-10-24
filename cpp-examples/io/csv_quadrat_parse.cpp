// Title: Splitting CSV lines with std::istringstream and std::getline
// Standard: C++17
// Reads quadrat_counts.csv line by line, splits each line at the commas and
// converts the count. Malformed lines are reported on std::cerr and skipped.

#include <cstdlib>
#include <fstream>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

struct Record {
    std::string quadrat;
    std::string species;
    int count{0};
};

// Splits one line into its comma-separated fields (spaces are kept).
std::vector<std::string> splitFields(const std::string& line) {
    std::vector<std::string> fields;
    std::istringstream stream{line};
    std::string field;
    while (std::getline(stream, field, ',')) {
        fields.push_back(field);
    }
    return fields;
}

// The whole field must be a non-negative whole number: "two" and "12b" are rejected.
int toCount(const std::string& text) {
    std::size_t used{0};
    const int value = std::stoi(text, &used);  // throws if there is no number at all
    if (used != text.size() || value < 0) throw std::invalid_argument{"bad count '" + text + "'"};
    return value;
}

int main() {
    std::ifstream in{"quadrat_counts.csv"};
    if (!in.is_open()) {
        std::cerr << "error: cannot open quadrat_counts.csv\n";
        return EXIT_FAILURE;
    }
    std::string line;
    std::getline(in, line);  // skip the header row: quadrat,species,count

    std::vector<Record> records;
    int lineNumber{1};
    while (std::getline(in, line)) {
        ++lineNumber;
        if (!line.empty() && line.back() == '\r') line.pop_back();  // Windows line ending
        const std::vector<std::string> fields = splitFields(line);
        try {
            if (fields.size() != 3) throw std::invalid_argument{"expected 3 fields"};
            records.push_back(Record{fields[0], fields[1], toCount(fields[2])});
        } catch (const std::exception& e) {
            std::cerr << "line " << lineNumber << " skipped: " << e.what() << '\n';
        }
    }

    int total{0};
    for (const Record& r : records) {
        std::cout << r.quadrat << " | " << r.species << " | " << r.count << '\n';
        total += r.count;
    }
    std::cout << "records: " << records.size() << ", individuals: " << total << '\n';
    return EXIT_SUCCESS;
}
