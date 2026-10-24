// Title: Von Bertalanffy growth: the interface
// Standard: C++17
// Declarations only: everything another file needs in order to call the growth
// functions, and nothing about how they work.

#ifndef GROWTH_MODEL_GROWTH_HPP
#define GROWTH_MODEL_GROWTH_HPP

// Parameters of L(t) = Linf - (Linf - L0) * exp(-k t).
struct GrowthParameters {
    double Linf = 60.0;  // asymptotic length (cm)
    double k = 0.25;     // growth coefficient (per year)
    double L0 = 5.0;     // length at age 0 (cm)
};

// Length (cm) at a given age (years).
double lengthAtAge(double age, const GrowthParameters& p);

// Age (years) at which a given length (cm) is reached; needs L0 <= length < Linf.
double ageAtLength(double length, const GrowthParameters& p);

#endif  // GROWTH_MODEL_GROWTH_HPP
