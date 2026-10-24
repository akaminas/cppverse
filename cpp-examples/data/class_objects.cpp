// Title: Objects behave like values
// Standard: C++17
// Copies of an object are independent; objects can be returned from and
// passed to functions, by value or by reference; a member function can
// read the private data of another object of its own class.

#include <algorithm>
#include <iostream>

class Population {
public:
    int size() const { return size_; }
    void addBirths(int births) {
        if (births > 0) size_ += births;
    }
    void removeDeaths(int deaths) {
        if (deaths > 0) size_ -= std::min(deaths, size_);  // never below zero
    }
    bool isLargerThan(const Population& other) const {
        return size_ > other.size_;   // allowed: other is also a Population
    }
private:
    int size_ = 0;  // invariant: size_ >= 0
};

Population founders(int n) {          // returns a new object
    Population p;
    p.addBirths(n);
    return p;
}

int sizeIfHalved(Population p) {      // works on a copy
    p.removeDeaths(p.size() / 2);
    return p.size();
}

void harshWinter(Population& p) {     // works on the caller's object
    p.removeDeaths(p.size() / 2);
}

int main() {
    Population island = founders(40);
    const Population before = island;  // a copy: a snapshot of the state
    island.addBirths(25);
    std::cout << "before: " << before.size() << ", now: " << island.size() << '\n';

    std::cout << "a halved copy would have " << sizeIfHalved(island) << '\n';
    std::cout << "the island still has " << island.size() << '\n';
    harshWinter(island);
    std::cout << "after the winter: " << island.size() << '\n';

    Population mainland = founders(50);
    std::cout << std::boolalpha << "island larger than mainland: "
              << island.isLargerThan(mainland) << '\n';
    mainland = island;                 // assignment copies every member
    std::cout << "after assignment the mainland has " << mainland.size() << '\n';
    return 0;
}
