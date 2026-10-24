// Title: A priority queue of future events
// Standard: C++17
// Events are (time, description) pairs. With std::greater the queue always
// hands out the EARLIEST event first, whatever the order of insertion, and
// handling one event may schedule another.

#include <functional>
#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>

using Event = std::pair<double, std::string>;   // (time in days, what happens)

int main() {
    std::priority_queue<Event, std::vector<Event>, std::greater<Event>> events;
    events.push({4.5, "female 2 lays eggs"});
    events.push({1.2, "female 1 lays eggs"});
    events.push({3.0, "predator visits"});

    while (!events.empty()) {
        const Event next = events.top();             // the earliest event
        events.pop();
        std::cout << "day " << next.first << ": " << next.second << '\n';
        if (next.second == "female 1 lays eggs") {
            events.push({next.first + 2.5, "eggs of female 1 hatch"});
        }
    }
    return 0;
}
