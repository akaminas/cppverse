// Title: Memory-one strategies meeting in a repeated donation game
// Standard: C++17
// A strategy is an immutable value: a first move and a reply to each outcome
// of the previous round. The game's parameters are a separate struct and play()
// is a free function, so strategies know nothing about payoffs or populations.

#include <array>
#include <iomanip>
#include <iostream>
#include <string>

enum class Move { cooperate, defect };

struct Strategy {
    std::string name;
    Move first;
    Move afterCC, afterCD, afterDC, afterDD;  // reply to (my move, partner's move)

    Move reply(Move mine, Move theirs) const {
        if (mine == Move::cooperate) return theirs == Move::cooperate ? afterCC : afterCD;
        return theirs == Move::cooperate ? afterDC : afterDD;
    }
};

struct DonationGame {
    double benefit = 3.0;  // gain to the partner of one cooperative act
    double cost = 1.0;     // cost of that act to the cooperator
    int rounds = 10;
};

struct MatchResult {
    double focal;    // mean payoff per round to the first strategy
    double partner;  // ... and to the second
};

double payoff(Move mine, Move theirs, const DonationGame& g) {
    return (theirs == Move::cooperate ? g.benefit : 0.0) - (mine == Move::cooperate ? g.cost : 0.0);
}

MatchResult play(const Strategy& a, const Strategy& b, const DonationGame& g) {
    Move moveA = a.first;
    Move moveB = b.first;
    double totalA = 0.0;
    double totalB = 0.0;
    for (int round = 0; round < g.rounds; ++round) {
        totalA += payoff(moveA, moveB, g);
        totalB += payoff(moveB, moveA, g);
        const Move nextA = a.reply(moveA, moveB);  // both reply to the same round
        moveB = b.reply(moveB, moveA);
        moveA = nextA;
    }
    const double n = static_cast<double>(g.rounds);
    return {totalA / n, totalB / n};
}

int main() {
    constexpr Move C = Move::cooperate;
    constexpr Move D = Move::defect;
    const std::array<Strategy, 4> strategies{{
        {"AllD", D, D, D, D, D},
        {"TFT", C, C, D, C, D},   // copy the partner's last move
        {"Grim", C, C, D, D, D},  // cooperate only after mutual cooperation
        {"Alt", C, D, D, C, C},   // alternate, whatever the partner does
    }};
    const DonationGame game{};
    std::cout << "mean payoff per round to the row strategy\n" << std::fixed << std::setprecision(2);
    std::cout << std::setw(5) << "";
    for (const Strategy& column : strategies) std::cout << std::setw(7) << column.name;
    std::cout << '\n';
    for (const Strategy& row : strategies) {
        std::cout << std::setw(5) << row.name;
        for (const Strategy& column : strategies) std::cout << std::setw(7) << play(row, column, game).focal;
        std::cout << '\n';
    }
    return 0;
}
