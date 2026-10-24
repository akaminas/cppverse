// Title: An explicit constructor refuses a silent conversion
// Standard: C++17
// Expect: compile-error
// Individual(double) is explicit, so a bare double is not quietly turned into
// a newborn when a function expects an Individual.

#include <vector>

class Individual {
public:
    explicit Individual(double birthMassGrams) : massGrams_(birthMassGrams) {}
    double massGrams() const { return massGrams_; }

private:
    double massGrams_;
};

void addToPopulation(std::vector<Individual>& population, const Individual& ind) {
    population.push_back(ind);
}

int main() {
    std::vector<Individual> population;
    const double litterMass = 14.0;  // total mass of a litter, not one newborn
    addToPopulation(population, litterMass);  // error: no implicit conversion
    addToPopulation(population, Individual{2.8});  // fine: the intent is visible
    return 0;
}
