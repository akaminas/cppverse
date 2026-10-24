// Title: Plants competing with their neighbours (an individual-based model)
// Standard: C++17
// Perennial plants live on a square plot whose edges wrap around (a torus).
// Each year:
//   1. Survival: a plant with n neighbours within radius R survives with
//      probability s0 / (1 + c n).
//   2. Reproduction: each survivor sets a Poisson(f) number of seeds; each
//      seed lands at a normally distributed offset (sd sigma) from its parent.
// Scheduling:
//   synchronous   every plant counts its neighbours in the same census
//   random-order  plants are visited in random order and deaths take effect
//                 immediately, so later plants see fewer neighbours
// Interaction:
//   local   neighbours are counted in space
//   global  every plant experiences the mean crowding (N - 1) pi R^2,
//           the exact mean-field limit with equilibrium
//           N* = (s0 (1 + f) - 1) / (c pi R^2)
// Usage:  plants [synchronous|random-order] [local|global] [seed] [years]
// Output: CSV with the columns year,N,mean_crowding,csr_crowding.

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <random>
#include <string>
#include <utility>
#include <vector>

constexpr double kPi = 3.14159265358979323846;

struct Parameters {
    double s0 = 0.9;      // survival probability of an uncrowded plant
    double c = 0.25;      // strength of crowding per neighbour
    double R = 0.05;      // interaction radius (plot side = 1)
    double f = 1.2;       // mean seeds per surviving plant
    double sigma = 0.02;  // dispersal distance (sd per axis)
    bool randomOrder = false;
    bool globalInteraction = false;
};

struct Plant {
    double x = 0.0;
    double y = 0.0;
    int age = 0;
    double crowding = 0.0;  // neighbours counted at this year's census
};

// Shortest distance along one axis of the torus.
double torusDelta(double a, double b) {
    const double d = std::abs(a - b);
    return d > 0.5 ? 1.0 - d : d;
}

double wrap(double v) {
    return v - std::floor(v);
}

class Population {
public:
    Population(const Parameters& p, int initialSize, std::uint64_t seed) : params_(p), rng_(seed) {
        std::uniform_real_distribution<double> unit(0.0, 1.0);
        for (int i = 0; i < initialSize; ++i) plants_.push_back(Plant{unit(rng_), unit(rng_), 0, 0.0});
    }

    std::size_t size() const { return plants_.size(); }

    struct Census {
        std::size_t N;
        double meanCrowding;
        double csrCrowding;
    };

    // Advance one year and report the census.
    Census step() {
        const std::size_t N = plants_.size();
        const double csr = N > 0 ? static_cast<double>(N - 1) * kPi * params_.R * params_.R : 0.0;
        std::vector<char> alive(N, 1);
        std::vector<std::size_t> order(N);
        for (std::size_t i = 0; i < N; ++i) order[i] = i;
        if (params_.randomOrder) std::shuffle(order.begin(), order.end(), rng_);

        // 1. Survival.
        if (!params_.randomOrder && !params_.globalInteraction) {
            for (std::size_t i = 0; i < N; ++i) plants_[i].crowding = countNeighbours(i, alive);
        }
        std::uniform_real_distribution<double> unit(0.0, 1.0);
        double crowdingSum = 0.0;
        for (std::size_t i : order) {
            Plant& plant = plants_[i];
            if (params_.globalInteraction) plant.crowding = csr;
            else if (params_.randomOrder) plant.crowding = countNeighbours(i, alive);
            crowdingSum += plant.crowding;
            const double survival = params_.s0 / (1.0 + params_.c * plant.crowding);
            if (unit(rng_) >= survival) alive[i] = 0;  // dies immediately
        }

        // 2. Reproduction by the survivors.
        std::vector<Plant> next;
        for (std::size_t i = 0; i < N; ++i) {
            if (alive[i]) {
                next.push_back(plants_[i]);
                ++next.back().age;
            }
        }
        const std::size_t survivors = next.size();
        std::poisson_distribution<int> seeds(params_.f);
        std::normal_distribution<double> offset(0.0, params_.sigma);
        for (std::size_t i = 0; i < survivors; ++i) {
            const int k = seeds(rng_);
            for (int s = 0; s < k; ++s) {
                const double x = wrap(next[i].x + offset(rng_));
                const double y = wrap(next[i].y + offset(rng_));
                next.push_back(Plant{x, y, 0, 0.0});
            }
        }
        plants_ = std::move(next);
        return {plants_.size(), N > 0 ? crowdingSum / static_cast<double>(N) : 0.0, csr};
    }

private:
    // Living plants other than i within distance R (straightforward O(N) scan).
    double countNeighbours(std::size_t i, const std::vector<char>& alive) const {
        const double R2 = params_.R * params_.R;
        int count = 0;
        for (std::size_t j = 0; j < plants_.size(); ++j) {
            if (j == i || !alive[j]) continue;
            const double dx = torusDelta(plants_[i].x, plants_[j].x);
            const double dy = torusDelta(plants_[i].y, plants_[j].y);
            if (dx * dx + dy * dy <= R2) ++count;
        }
        return count;
    }

    Parameters params_;
    std::mt19937_64 rng_;
    std::vector<Plant> plants_;
};

int main(int argc, char* argv[]) {
    Parameters p;
    const std::string schedule = argc > 1 ? argv[1] : "synchronous";
    const std::string interaction = argc > 2 ? argv[2] : "local";
    const std::uint64_t seed = argc > 3 ? std::stoull(argv[3]) : 7ULL;
    const int years = argc > 4 ? std::stoi(argv[4]) : 160;
    if ((schedule != "synchronous" && schedule != "random-order") || (interaction != "local" && interaction != "global")) {
        std::cerr << "usage: plants [synchronous|random-order] [local|global] [seed] [years]\n";
        return EXIT_FAILURE;
    }
    p.randomOrder = (schedule == "random-order");
    p.globalInteraction = (interaction == "global");

    const double equilibrium = (p.s0 * (1.0 + p.f) - 1.0) / (p.c * kPi * p.R * p.R);
    Population population(p, 300, seed);

    std::cout << "# mean-field equilibrium N* = " << std::setprecision(6) << equilibrium << '\n';
    std::cout << "year,N,mean_crowding,csr_crowding\n";
    std::cout << 0 << ',' << population.size() << ",,\n";
    for (int year = 1; year <= years && population.size() > 0; ++year) {
        const Population::Census c = population.step();
        std::cout << year << ',' << c.N << ',' << c.meanCrowding << ',' << c.csrCrowding << '\n';
    }
    return EXIT_SUCCESS;
}
