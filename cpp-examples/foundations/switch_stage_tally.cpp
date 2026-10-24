// Title: Stacked case labels and deliberate fall-through
// Standard: C++17
// Field codes are tallied with a switch. Stacked labels accept upper- and
// lower-case codes; [[fallthrough]] lets an individual at a late stage
// count towards every earlier stage it has passed through.

#include <iostream>
#include <string>

int main() {
    const std::string codes = "aPlE?";   // one code per individual
    int larva = 0;   // individuals that reached at least the larval stage
    int pupa = 0;
    int adult = 0;
    int unknown = 0;

    for (const char c : codes) {
        switch (c) {
        case 'A':
        case 'a':
            ++adult;
            [[fallthrough]];
        case 'P':
        case 'p':
            ++pupa;
            [[fallthrough]];
        case 'L':
        case 'l':
            ++larva;
            break;
        case 'E':
        case 'e':
            break;   // still an egg: no later stage reached
        default:
            ++unknown;
            break;
        }
    }
    std::cout << "reached larva: " << larva << '\n';
    std::cout << "reached pupa:  " << pupa << '\n';
    std::cout << "reached adult: " << adult << '\n';
    std::cout << "unrecognised:  " << unknown << '\n';
    return 0;
}
