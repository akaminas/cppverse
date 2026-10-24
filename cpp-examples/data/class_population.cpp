// Title: A population whose size can never become negative
// Standard: C++17
// The count is private. Births and deaths go through public member
// functions, which maintain the invariant: the size is never negative.

#include <iostream>

// Interface: what users of the class may do.
class Population {
public:
    int size() const;              // number of individuals
    void addBirths(int births);    // negative numbers are ignored
    int removeDeaths(int deaths);  // returns how many actually died
private:
    int size_ = 0;                 // invariant: size_ >= 0
};

// Implementation: how the class does it.
int Population::size() const {
    return size_;
}

void Population::addBirths(int births) {
    if (births > 0) {
        size_ += births;
    }
}

int Population::removeDeaths(int deaths) {
    if (deaths <= 0) {
        return 0;
    }
    int removed = deaths;
    if (removed > size_) {
        removed = size_;           // no more can die than are alive
    }
    size_ -= removed;
    return removed;
}

// Application: code that uses the class through its interface only.
int main() {
    Population beetles;            // starts with 0 individuals
    beetles.addBirths(30);
    std::cout << "after births: " << beetles.size() << '\n';

    const int died = beetles.removeDeaths(12);
    std::cout << "died: " << died << ", alive: " << beetles.size() << '\n';

    const int frost = beetles.removeDeaths(50);
    std::cout << "a frost killing 50 removed " << frost << ", alive: " << beetles.size() << '\n';

    beetles.addBirths(-5);
    std::cout << "after a negative birth count: " << beetles.size() << '\n';
    return 0;
}
