// Title: A census that owns its records
// Standard: C++17
// The class Census keeps a private vector of plot records. Its nested type
// Record is public, so other code names it Census::Record. find() fills an
// in/out reference parameter and returns whether it found the plot.

#include <cstddef>
#include <iostream>
#include <string>
#include <vector>

class Census {
public:
    struct Record {
        std::string plot;  // plot code, e.g. "PLOT07"
        int adults;
        int juveniles;
    };

    void add(const Record& record);
    bool find(const std::string& plot, Record& result) const;
    int totalAdults() const;
    std::size_t size() const { return records_.size(); }

private:
    std::vector<Record> records_;  // one record per plot
};

void Census::add(const Record& record) {
    records_.push_back(record);    // the census stores its own copy
}

bool Census::find(const std::string& plot, Record& result) const {
    for (const Record& r : records_) {
        if (r.plot == plot) {
            result = r;            // write into the caller's object
            return true;
        }
    }
    return false;                  // result is left unchanged
}

int Census::totalAdults() const {
    int total = 0;
    for (const Record& r : records_) {
        total += r.adults;
    }
    return total;
}

// A free function that changes the caller's census: hence Census&.
void addSurvey(Census& census, const std::vector<Census::Record>& survey) {
    for (const Census::Record& r : survey) {
        census.add(r);
    }
}

int main() {
    Census census;
    const std::vector<Census::Record> spring{
        {"PLOT03", 14, 22},
        {"PLOT07", 9, 31},
        {"PLOT12", 17, 5},
    };
    addSurvey(census, spring);
    std::cout << census.size() << " plots, " << census.totalAdults() << " adults\n";

    Census::Record found{"none", 0, 0};
    const std::vector<std::string> queries{"PLOT07", "PLOT08"};
    for (const std::string& code : queries) {
        if (census.find(code, found)) {
            std::cout << code << ": " << found.adults << " adults, "
                      << found.juveniles << " juveniles\n";
        } else {
            std::cout << "no record for " << code << '\n';
        }
    }
    return 0;
}
