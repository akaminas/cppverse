// Title: Taking a sample code apart
// Standard: C++17
// A sample identifier such as "PLOT07-Q3" encodes a plot and a quadrat.
// find, substr and std::stoi recover the numbers; + builds a new code.

#include <iostream>
#include <string>

int main() {
    const std::string code = "PLOT07-Q3";
    const std::string::size_type dash = code.find('-');
    const std::string plot = code.substr(0, dash);
    const std::string quadrat = code.substr(dash + 1);
    const int plotNumber = std::stoi(plot.substr(4));
    const int quadratNumber = std::stoi(quadrat.substr(1));

    std::cout << "plot " << plotNumber << ", quadrat " << quadratNumber << '\n';
    const std::string next = plot + "-Q" + std::to_string(quadratNumber + 1);
    std::cout << "next sample: " << next << " (" << next.size() << " characters)\n";
    return 0;
}
