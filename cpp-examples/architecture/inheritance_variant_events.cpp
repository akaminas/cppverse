// Title: The same seasonal events as a std::variant
// Standard: C++17
// Each event is a plain struct with apply() and name(); none derives from a
// base class. std::visit calls the right apply() for whichever alternative the
// variant holds. The output is identical to the virtual-function version.

#include <algorithm>
#include <iostream>
#include <variant>
#include <vector>

struct Population {
    int juveniles = 0;
    int adults = 0;
};

struct Breeding {
    int perPair;  // juveniles raised per pair of adults
    const char* name() const { return "breeding"; }
    void apply(Population& pop) const { pop.juveniles += (pop.adults / 2) * perPair; }
};

struct JuvenileSurvival {
    int percent;
    const char* name() const { return "survival"; }
    void apply(Population& pop) const { pop.juveniles = pop.juveniles * percent / 100; }
};

struct Maturation {
    const char* name() const { return "maturation"; }
    void apply(Population& pop) const {
        pop.adults += pop.juveniles;
        pop.juveniles = 0;
    }
};

struct Harvest {
    int quota;
    const char* name() const { return "harvest"; }
    void apply(Population& pop) const { pop.adults -= std::min(pop.adults, quota); }
};

using Event = std::variant<Breeding, JuvenileSurvival, Maturation, Harvest>;

int main() {
    const std::vector<Event> schedule{Breeding{3}, JuvenileSurvival{40}, Maturation{}, Harvest{8}};

    Population pop{0, 20};
    for (int year = 1; year <= 2; ++year) {
        for (const Event& event : schedule) {
            std::visit(
                [&pop, year](const auto& e) {
                    e.apply(pop);
                    std::cout << "year " << year << ", " << e.name() << ": juveniles " << pop.juveniles
                              << ", adults " << pop.adults << '\n';
                },
                event);
        }
    }
    return 0;
}
