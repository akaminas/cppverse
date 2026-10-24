// Title: Pass by value and pass by reference
// Standard: C++17
// grow_copy receives a copy of N and cannot change the caller's variable;
// grow_in_place receives a reference, an alias for the caller's N.

#include <iostream>

void grow_copy(double N, double lambda) {
    N = lambda * N;
    std::cout << "  inside grow_copy:     N = " << N << '\n';
}

void grow_in_place(double& N, double lambda) {
    N = lambda * N;
    std::cout << "  inside grow_in_place: N = " << N << '\n';
}

int main() {
    double N = 40.0;
    std::cout << "start:                  N = " << N << '\n';
    grow_copy(N, 1.5);
    std::cout << "after grow_copy:        N = " << N << '\n';
    grow_in_place(N, 1.5);
    std::cout << "after grow_in_place:    N = " << N << '\n';
    return 0;
}
