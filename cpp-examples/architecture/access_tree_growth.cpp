// Title: A tree whose state can be read freely but changed only by growing
// Standard: C++17
// Read-only accessors are const member functions; the only way to change the
// diameter is grow(), which keeps the diameter between 0 and the maximum.
// Static members are shared by all trees: a constant and an identifier counter.

#include <iomanip>
#include <iostream>
#include <stdexcept>

constexpr double kPi = 3.14159265358979323846;

class Tree {
public:
    static constexpr double kMaxDiameterCm = 120.0;  // one value for every tree

    explicit Tree(double diameterCm) : id_(nextId_++), diameterCm_(checked(diameterCm)) {}

    int id() const { return id_; }
    double diameterCm() const { return diameterCm_; }
    double basalAreaM2() const {  // derived from the state when asked, never stored
        const double radiusM = diameterCm_ / 200.0;
        return kPi * radiusM * radiusM;
    }

    // Growth slows as the tree approaches its maximum diameter.
    void grow(double rate) {
        if (!(rate >= 0.0 && rate <= 1.0)) throw std::invalid_argument("rate must lie in [0, 1]");
        diameterCm_ += rate * (kMaxDiameterCm - diameterCm_);
    }

    static int treesCreated() { return nextId_ - 1; }

private:
    static double checked(double d) {  // private helper for the constructor
        if (!(d > 0.0 && d <= kMaxDiameterCm)) throw std::invalid_argument("diameter out of range");
        return d;
    }

    inline static int nextId_ = 1;  // one counter shared by all trees
    int id_;
    double diameterCm_;
};

void report(const Tree& tree) {  // a const reference: only const members may be called
    std::cout << "tree " << tree.id() << ": diameter " << tree.diameterCm() << " cm, basal area "
              << tree.basalAreaM2() << " m2\n";
}

int main() {
    std::cout << std::fixed << std::setprecision(3);
    Tree oak{30.0};
    Tree birch{12.0};
    for (int year = 0; year < 5; ++year) {
        oak.grow(0.02);
        birch.grow(0.05);
    }
    report(oak);
    report(birch);
    std::cout << "trees created: " << Tree::treesCreated() << '\n';
    std::cout << "maximum diameter: " << Tree::kMaxDiameterCm << " cm\n";
    return 0;
}
