// Title: Last in, first out; first in, first out
// Standard: C++17
// A forager retraces its path home with a stack: the patch visited last is
// left first. Birds at a feeder are served in order of arrival with a queue.

#include <initializer_list>
#include <iostream>
#include <queue>
#include <stack>
#include <string>

int main() {
    std::stack<int> path;                   // patches visited, most recent on top
    for (int patch : {3, 7, 2, 9}) {
        path.push(patch);
    }
    std::cout << "way home:";
    while (!path.empty()) {
        std::cout << ' ' << path.top();     // the most recent patch
        path.pop();
    }
    std::cout << '\n';

    std::queue<std::string> feeder;         // birds waiting, first arrival at the front
    feeder.push("robin");
    feeder.push("great tit");
    feeder.push("chaffinch");
    for (int minute = 1; minute <= 3; ++minute) {
        std::cout << "minute " << minute << ": " << feeder.front() << " feeds";
        feeder.pop();                       // it leaves ...
        if (minute == 1) {
            feeder.push("blue tit");        // ... and a new bird joins at the back
        }
        std::cout << ", " << feeder.size() << " waiting\n";
    }
    return 0;
}
