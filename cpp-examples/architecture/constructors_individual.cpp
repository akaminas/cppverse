// Title: An individual that cannot start in an invalid state
// Standard: C++17
// The constructors check their arguments and throw if the new object would be
// invalid. A delegating constructor creates newborns, and default member
// initialisers give the remaining members the same start values in every case.

#include <iostream>
#include <stdexcept>
#include <string>

enum class Stage { juvenile, adult };

class Individual {
public:
    Individual(int ageYears, Stage stage, double massGrams)
        : ageYears_(ageYears), stage_(stage), massGrams_(massGrams) {
        if (ageYears < 0) throw std::invalid_argument("age must not be negative");
        if (!(massGrams > 0.0)) throw std::invalid_argument("body mass must be positive");
    }

    // A newborn is a juvenile of age 0: delegate to the constructor above.
    explicit Individual(double birthMassGrams) : Individual(0, Stage::juvenile, birthMassGrams) {}

    int ageYears() const { return ageYears_; }
    Stage stage() const { return stage_; }
    double massGrams() const { return massGrams_; }
    int offspring() const { return offspring_; }
    bool alive() const { return alive_; }

private:
    int ageYears_;
    Stage stage_;
    double massGrams_;
    int offspring_ = 0;  // default member initialisers: the same start value
    bool alive_ = true;  // whichever constructor created the object
};

std::string stageName(Stage s) {
    return s == Stage::adult ? "adult" : "juvenile";
}

void report(const std::string& label, const Individual& ind) {
    std::cout << label << ": " << stageName(ind.stage()) << ", age " << ind.ageYears() << ", "
              << ind.massGrams() << " g, offspring " << ind.offspring() << '\n';
}

int main() {
    const Individual female{3, Stage::adult, 41.5};
    const Individual newborn{2.8};
    report("female", female);
    report("newborn", newborn);

    try {
        const Individual impossible{2, Stage::adult, -5.0};
        report("impossible", impossible);
    } catch (const std::invalid_argument& error) {
        std::cout << "rejected: " << error.what() << '\n';
    }
    return 0;
}
