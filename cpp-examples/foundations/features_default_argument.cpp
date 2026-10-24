// Title: A default argument for an output option
// Standard: C++17
// The default precision is written once, in the declaration. A call may
// omit that argument or supply its own value.

#include <iomanip>
#include <iostream>

void print_state(int t, double N, int precision = 2);   // the default lives here

int main() {
    print_state(0, 12.0);
    print_state(1, 15.6);
    print_state(2, 20.28, 4);
    return 0;
}

void print_state(int t, double N, int precision) {      // and is not repeated here
    std::cout << "t = " << t << "  N = " << std::fixed << std::setprecision(precision)
              << N << '\n';
}
