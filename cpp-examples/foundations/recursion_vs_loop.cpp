// Title: The same count by recursion and by a loop
// Standard: C++17
// Both functions count the descendants of one founder over n generations.
// The loop adds up the size of each generation; the recursion follows the
// definition. They agree for every n.

#include <iostream>

int descendants_recursive(int generations, int offspring) {
    if (generations == 0) {
        return 0;
    }
    return offspring * (1 + descendants_recursive(generations - 1, offspring));
}

int descendants_loop(int generations, int offspring) {
    int total = 0;
    int born = 1;   // generation 0: the founder alone
    for (int g = 1; g <= generations; ++g) {
        born = born * offspring;   // individuals born in generation g
        total += born;
    }
    return total;
}

int main() {
    const int offspring = 3;
    for (int n = 0; n <= 8; n += 2) {
        std::cout << "n = " << n << ": recursive " << descendants_recursive(n, offspring)
                  << ", loop " << descendants_loop(n, offspring) << '\n';
    }
    return 0;
}
