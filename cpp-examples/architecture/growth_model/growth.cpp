// Title: Von Bertalanffy growth: the implementation
// Standard: C++17
// Definitions of the functions declared in growth.hpp. This file has no main;
// it is compiled separately and linked with the program that uses it.

#include "growth.hpp"

#include <cmath>

double lengthAtAge(double age, const GrowthParameters& p) {
    return p.Linf - (p.Linf - p.L0) * std::exp(-p.k * age);
}

double ageAtLength(double length, const GrowthParameters& p) {
    return std::log((p.Linf - p.L0) / (p.Linf - length)) / p.k;
}
