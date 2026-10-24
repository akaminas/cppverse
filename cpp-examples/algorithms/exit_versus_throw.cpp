// Title: Throwing unwinds the stack; std::exit does not
// Standard: C++17
// A small object announces when it is destroyed. A thrown exception destroys
// every local object on its way to the handler; std::exit skips them all.

#include <cstdlib>
#include <iostream>
#include <stdexcept>
#include <string>

struct Announcer {
    std::string name;
    ~Announcer() { std::cout << "  destroyed: " << name << '\n'; }
};

void failByThrowing() {
    const Announcer local{"local object in failByThrowing"};
    throw std::runtime_error("parameter file is incomplete");
}

void failByExiting() {
    const Announcer local{"local object in failByExiting"};
    std::exit(EXIT_SUCCESS);  // exit status 0 only so that this demonstration counts as a success
}

int main() {
    std::cout << "1. throw\n";
    try {
        const Announcer inTry{"local object in the try block"};
        failByThrowing();
    } catch (const std::exception& e) {
        std::cout << "  caught: " << e.what() << '\n';
    }

    std::cout << "2. std::exit\n";
    const Announcer inMain{"local object in main"};
    failByExiting();
    std::cout << "this line is never reached\n";
    return 0;
}
