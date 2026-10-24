// Title: Seasonal events as a class hierarchy with virtual functions
// Standard: C++17
// Every kind of event derives from the abstract base class Event and overrides
// apply(). The yearly schedule stores std::unique_ptr<Event>, so a single loop
// runs every kind of event without knowing which kinds exist.

#include <algorithm>
#include <iostream>
#include <memory>
#include <string>
#include <vector>

struct Population {
    int juveniles = 0;
    int adults = 0;
};

class Event {
public:
    virtual ~Event() = default;  // deleting through a base pointer must be safe
    virtual std::string name() const = 0;
    virtual void apply(Population& pop) const = 0;
};

class Breeding final : public Event {
public:
    explicit Breeding(int perPair) : perPair_(perPair) {}
    std::string name() const override { return "breeding"; }
    void apply(Population& pop) const override { pop.juveniles += (pop.adults / 2) * perPair_; }

private:
    int perPair_;  // juveniles raised per pair of adults
};

class JuvenileSurvival final : public Event {
public:
    explicit JuvenileSurvival(int percent) : percent_(percent) {}
    std::string name() const override { return "survival"; }
    void apply(Population& pop) const override { pop.juveniles = pop.juveniles * percent_ / 100; }

private:
    int percent_;
};

class Maturation final : public Event {
public:
    std::string name() const override { return "maturation"; }
    void apply(Population& pop) const override {
        pop.adults += pop.juveniles;
        pop.juveniles = 0;
    }
};

class Harvest final : public Event {
public:
    explicit Harvest(int quota) : quota_(quota) {}
    std::string name() const override { return "harvest"; }
    void apply(Population& pop) const override { pop.adults -= std::min(pop.adults, quota_); }

private:
    int quota_;
};

int main() {
    std::vector<std::unique_ptr<Event>> schedule;
    schedule.push_back(std::make_unique<Breeding>(3));
    schedule.push_back(std::make_unique<JuvenileSurvival>(40));
    schedule.push_back(std::make_unique<Maturation>());
    schedule.push_back(std::make_unique<Harvest>(8));

    Population pop{0, 20};
    for (int year = 1; year <= 2; ++year) {
        for (const auto& event : schedule) {
            event->apply(pop);  // calls the override of the actual event type
            std::cout << "year " << year << ", " << event->name() << ": juveniles " << pop.juveniles
                      << ", adults " << pop.adults << '\n';
        }
    }
    return 0;
}
