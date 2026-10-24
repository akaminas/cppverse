// Title: Event-driven scheduling with per-individual clocks
// Standard: C++17
// Every vole has its own clocks: a time of death and a time of its next
// litter. All pending events wait in one priority queue, earliest on top.
// Robust and frail voles differ only in their death rate; a pup inherits its
// mother's type. A dead vole's pending birth is discarded when it surfaces.

#include <cstddef>
#include <cstdint>
#include <iostream>
#include <queue>
#include <random>
#include <vector>

struct Vole {
    bool robust;
    bool alive;
};

enum class Kind { Birth, Death };

struct Event {
    double time;
    std::size_t vole;  // index into the vector of voles
    Kind kind;
};

struct Later {  // the queue keeps the "largest" on top, so invert the order
    bool operator()(const Event& a, const Event& b) const { return a.time > b.time; }
};

int main() {
    const std::uint64_t seed = 2024;
    const double birthRate = 1.0;    // litters per vole per year
    const double robustDeath = 0.8;  // deaths per vole per year
    const double frailDeath = 1.4;
    const double tEnd = 8.0;         // years
    std::mt19937_64 rng(seed);
    auto waitingTime = [&rng](double rate) { return std::exponential_distribution<double>(rate)(rng); };

    std::vector<Vole> voles;
    std::priority_queue<Event, std::vector<Event>, Later> queue;
    auto addVole = [&](double now, bool robust) {
        voles.push_back(Vole{robust, true});
        const std::size_t id = voles.size() - 1;
        queue.push(Event{now + waitingTime(robust ? robustDeath : frailDeath), id, Kind::Death});
        queue.push(Event{now + waitingTime(birthRate), id, Kind::Birth});
    };
    auto census = [&voles](double t) {
        int robust = 0;
        int frail = 0;
        for (const Vole& v : voles) {
            if (v.alive && v.robust) ++robust;
            if (v.alive && !v.robust) ++frail;
        }
        std::cout << t << ',' << robust << ',' << frail << '\n';
    };

    for (int k = 0; k < 20; ++k) {
        addVole(0.0, true);
        addVole(0.0, false);
    }
    std::cout << "# seed " << seed << "\ntime,robust,frail\n";
    double nextCensus = 0.0;
    while (!queue.empty() && queue.top().time <= tEnd) {
        const Event e = queue.top();  // copy it: pop() destroys the original
        queue.pop();
        for (; nextCensus < e.time; nextCensus += 1.0) census(nextCensus);
        if (!voles[e.vole].alive) continue;  // stale event of a vole that has died
        if (e.kind == Kind::Death) {
            voles[e.vole].alive = false;
        } else {
            // No reference into voles is kept across addVole, which may reallocate.
            addVole(e.time, voles[e.vole].robust);  // the pup inherits its mother's type
            queue.push(Event{e.time + waitingTime(birthRate), e.vole, Kind::Birth});  // her next litter
        }
    }
    for (; nextCensus <= tEnd; nextCensus += 1.0) census(nextCensus);
    return 0;
}
