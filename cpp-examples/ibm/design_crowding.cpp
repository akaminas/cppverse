// Title: Valid plants and their crowding on a torus
// Standard: C++17
// A Plant is constructed in a valid state: its position is wrapped onto the
// unit torus and a negative age is rejected. A plant's crowding is the number
// of other plants within radius R, measured along the shortest path on the
// torus, and its survival probability is s0 / (1 + c n).

#include <cmath>
#include <cstddef>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <vector>

double wrapUnit(double v) { return v - std::floor(v); }

struct Plant {
    double x;
    double y;
    int age;
    Plant(double xPos, double yPos, int ageYears) : x{wrapUnit(xPos)}, y{wrapUnit(yPos)}, age{ageYears} {
        if (ageYears < 0) throw std::invalid_argument("a plant cannot have a negative age");
    }
};

// Shortest separation along one axis of the unit torus.
double torusDelta(double a, double b) {
    const double d = std::abs(a - b);
    return d > 0.5 ? 1.0 - d : d;
}

int countNeighbours(const std::vector<Plant>& plants, std::size_t i, double R) {
    int n = 0;
    for (std::size_t j = 0; j < plants.size(); ++j) {
        if (j == i) continue;  // a plant does not crowd itself
        const double dx = torusDelta(plants[i].x, plants[j].x);
        const double dy = torusDelta(plants[i].y, plants[j].y);
        if (dx * dx + dy * dy <= R * R) ++n;
    }
    return n;
}

int main() {
    const double s0 = 0.9;  // survival of an uncrowded plant
    const double c = 0.25;  // effect of each neighbour
    const double R = 0.1;   // interaction radius (plot side = 1)
    const std::vector<Plant> plants{Plant{0.50, 0.50, 3}, Plant{0.55, 0.52, 1}, Plant{0.47, 0.44, 0},
                                    Plant{0.98, 0.30, 2}, Plant{1.03, 0.33, 0}, Plant{0.20, 0.80, 5}};

    std::cout << std::fixed << std::setprecision(2);
    std::cout << "plant     x     y  age  neighbours  survival\n";
    for (std::size_t i = 0; i < plants.size(); ++i) {
        const int n = countNeighbours(plants, i, R);
        const double survival = s0 / (1.0 + c * n);
        std::cout << std::setw(5) << i << std::setw(6) << plants[i].x << std::setw(6) << plants[i].y
                  << std::setw(5) << plants[i].age << std::setw(12) << n << std::setw(10) << survival << '\n';
    }

    try {
        const Plant impossible{0.1, 0.1, -1};
        std::cout << "created a plant of age " << impossible.age << '\n';
    } catch (const std::invalid_argument& e) {
        std::cout << "rejected: " << e.what() << '\n';
    }
    return 0;
}
