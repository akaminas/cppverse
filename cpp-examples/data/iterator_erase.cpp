// Title: Erasing while iterating
// Standard: C++17
// Individuals aged 4 or more die. erase() returns the position after the
// removed element, so the loop continues from there instead of using the
// iterator that erase has just invalidated.

#include <iostream>
#include <vector>

int main() {
    std::vector<int> ages{2, 4, 1, 5, 3};

    for (auto it = ages.begin(); it != ages.end();) {  // no ++it in the header
        if (*it >= 4) {
            it = ages.erase(it);  // remove; it now points at the next element
        } else {
            ++it;                 // keep; move on
        }
    }

    std::cout << ages.size() << " survivors:";
    for (int age : ages) {
        std::cout << ' ' << age;
    }
    std::cout << '\n';
    return 0;
}
