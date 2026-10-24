// Title: Addresses, pointers, references and an owning smart pointer
// Standard: C++17
// A pointer stores an address; it can be null and can be re-pointed. A reference
// is a second name for one object. std::unique_ptr owns an object on the heap,
// deletes it automatically, and can hand ownership on but cannot be copied.

#include <iostream>
#include <memory>
#include <utility>

struct Habitat {
    double areaHa;            // hectares
    double carryingCapacity;  // individuals
};

// A pointer parameter can say "there may be no habitat": it may be nullptr.
double density(double count, const Habitat* habitat) {
    if (habitat == nullptr) return 0.0;
    return count / habitat->areaHa;
}

int main() {
    double mass = 12.5;  // grams
    double* p = &mass;   // p holds the address of mass
    *p += 0.5;           // change mass through the pointer
    std::cout << "mass after *p += 0.5: " << mass << '\n';

    double& alias = mass;  // a reference: another name for mass
    alias *= 2.0;
    std::cout << "mass after alias *= 2: " << *p << '\n';

    double other = 7.0;
    p = &other;  // a pointer can be re-pointed; a reference cannot
    std::cout << "*p is now " << *p << ", mass is still " << mass << '\n';

    auto habitat = std::make_unique<Habitat>(Habitat{40.0, 300.0});
    std::cout << "density: " << density(120.0, habitat.get()) << " per ha\n";
    std::cout << "density with no habitat: " << density(120.0, nullptr) << '\n';

    std::unique_ptr<Habitat> owner = std::move(habitat);  // hand on ownership
    std::cout << std::boolalpha << "habitat is empty: " << (habitat == nullptr) << '\n';
    std::cout << "owner's capacity: " << owner->carryingCapacity << '\n';
    return 0;
}  // owner is destroyed here, and it deletes the Habitat
