// Title: Conflicting template arguments
// Standard: C++17
// Expect: compile-error
// The first argument says T is double, the other two say T is int. The
// compiler refuses to choose; write clampTo<double>(...) or use 0.0 and 1.0.

template <typename T>
T clampTo(T value, T low, T high) {
    if (value < low) {
        return low;
    }
    if (value > high) {
        return high;
    }
    return value;
}

int main() {
    const double germination = clampTo(0.35, 0, 1);
    return germination > 0.5 ? 1 : 0;
}
