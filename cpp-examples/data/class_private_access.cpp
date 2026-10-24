// Title: Private members are out of reach
// Standard: C++17
// Expect: compile-error
// Code outside the class may not touch size_, so it cannot break the
// invariant. The compiler rejects the assignment in main.

class Population {
public:
    int size() const { return size_; }
private:
    int size_ = 0;  // invariant: size_ >= 0
};

int main() {
    Population beetles;
    beetles.size_ = -5;
    return beetles.size();
}
