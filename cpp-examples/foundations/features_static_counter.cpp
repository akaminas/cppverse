// Title: A static local variable keeps its value between calls
// Standard: C++17
// next_id hands out identification numbers to new individuals. Its counter
// is initialised once and then persists from one call to the next.

#include <iostream>

int next_id() {
    static int last_id = 0;   // initialised once, not on every call
    ++last_id;
    return last_id;
}

int main() {
    for (int i = 0; i < 3; ++i) {
        std::cout << "new individual, id " << next_id() << '\n';
    }
    std::cout << "second replicate\n";
    std::cout << "new individual, id " << next_id() << '\n';
    return 0;
}
