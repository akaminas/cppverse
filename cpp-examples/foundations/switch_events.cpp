// Title: Dispatching on an event type with switch
// Standard: C++17
// An enum class names the possible events and a switch applies the state
// change of each one. A stochastic simulation would choose each event at
// random; here the sequence of events is fixed.

#include <iostream>
#include <vector>

enum class Event { birth, death, immigration };

int main() {
    int n = 5;   // population size
    const std::vector<Event> events{Event::birth, Event::death, Event::death,
                                    Event::immigration, Event::birth};

    for (const Event e : events) {
        switch (e) {
        case Event::birth:
            n += 1;
            std::cout << "birth        N = " << n << '\n';
            break;
        case Event::death:
            n -= 1;
            std::cout << "death        N = " << n << '\n';
            break;
        case Event::immigration:
            n += 1;
            std::cout << "immigration  N = " << n << '\n';
            break;
        }
    }
    return 0;
}
