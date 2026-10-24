// Title: Counting descendants recursively
// Standard: C++17
// Every individual has the same number of offspring. The descendants of a
// founder over n generations are its offspring plus their own descendants
// over the remaining n - 1 generations.

#include <iostream>

int descendants(int generations, int offspring) {
    if (generations == 0) {
        return 0;                                               // base case
    }
    const int below = descendants(generations - 1, offspring);  // recursive call
    const int result = offspring * (1 + below);
    std::cout << "descendants(" << generations << ") = " << result << '\n';
    return result;
}

int main() {
    const int total = descendants(3, 2);
    std::cout << "Total after 3 generations: " << total << '\n';
    return 0;
}
