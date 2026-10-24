// Title: A header without an include guard
// Standard: C++17
// Deliberately unguarded: including it twice defines StageCounts twice.

struct StageCounts {
    int juveniles = 0;
    int adults = 0;
};
