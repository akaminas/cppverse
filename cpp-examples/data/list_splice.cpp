// Title: Splicing and sorting a list
// Standard: C++17
// Two groups of tagged animals are merged with splice, which relinks the
// elements instead of copying them. A list sorts itself with its member sort.

#include <iostream>
#include <iterator>
#include <list>
#include <string>

void print(const std::string& label, const std::list<std::string>& tags) {
    std::cout << label << ':';
    for (const std::string& tag : tags) {
        std::cout << ' ' << tag;
    }
    std::cout << '\n';
}

int main() {
    std::list<std::string> groupA{"A17", "A03", "A11"};
    std::list<std::string> groupB{"B02", "B09"};

    groupA.push_front("A20");                    // a list grows cheaply at both ends
    const auto pos = std::next(groupA.begin(), 2);
    groupA.splice(pos, groupB);                  // move all of groupB before pos
    print("merged", groupA);
    std::cout << "group B now has " << groupB.size() << " animals\n";

    groupA.sort();                               // member sort: std::sort needs random access
    print("sorted", groupA);

    groupA.remove("A11");                        // erase every element equal to "A11"
    print("without A11", groupA);
    return 0;
}
