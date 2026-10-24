// Title: Counting close pairs by brute force and with a spatial grid
// Standard: C++17
// Scatters N points in the unit square and counts the pairs closer than R twice:
// by comparing every pair, O(N^2), and by sorting points into grid cells at
// least R wide so that only the 3 x 3 block of cells around each point is searched.
// The counts go to standard output; the timings go to std::clog.

#include <algorithm>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <random>
#include <vector>

struct Point {
    double x;
    double y;
};

bool withinRange(const Point& a, const Point& b, double R2) {
    const double dx = a.x - b.x;
    const double dy = a.y - b.y;
    return dx * dx + dy * dy <= R2;
}

long long countAllPairs(const std::vector<Point>& pts, double R) {
    const double R2 = R * R;
    long long pairs = 0;
    for (std::size_t i = 0; i < pts.size(); ++i)
        for (std::size_t j = i + 1; j < pts.size(); ++j)
            if (withinRange(pts[i], pts[j], R2)) ++pairs;
    return pairs;
}

long long countWithGrid(const std::vector<Point>& pts, double R) {
    const double R2 = R * R;
    const std::size_t side = static_cast<std::size_t>(1.0 / R);  // cells per side, each >= R wide
    const auto cellOf = [side](double v) {
        return std::min(static_cast<std::size_t>(v * static_cast<double>(side)), side - 1);
    };
    std::vector<std::vector<std::size_t>> cells(side * side);  // point indices in each cell
    for (std::size_t i = 0; i < pts.size(); ++i) cells[cellOf(pts[i].y) * side + cellOf(pts[i].x)].push_back(i);

    long long pairs = 0;
    for (std::size_t i = 0; i < pts.size(); ++i) {
        const std::size_t cx = cellOf(pts[i].x);
        const std::size_t cy = cellOf(pts[i].y);
        for (std::size_t gy = cy > 0 ? cy - 1 : std::size_t{0}; gy <= std::min(cy + 1, side - 1); ++gy)
            for (std::size_t gx = cx > 0 ? cx - 1 : std::size_t{0}; gx <= std::min(cx + 1, side - 1); ++gx)
                for (const std::size_t j : cells[gy * side + gx])
                    if (j > i && withinRange(pts[i], pts[j], R2)) ++pairs;  // each pair once
    }
    return pairs;
}

template <typename F>
long long timed(const char* label, F count) {
    const auto start = std::chrono::steady_clock::now();
    const long long result = count();
    const std::chrono::duration<double, std::milli> ms = std::chrono::steady_clock::now() - start;
    std::clog << label << ": " << ms.count() << " ms\n";
    return result;
}

int main() {
    const std::size_t N = 20000;
    const double R = 0.005;
    const std::uint64_t seed = 42;
    std::mt19937_64 rng{seed};
    const auto unit = [&rng] { return static_cast<double>(rng() >> 11) / 9007199254740992.0; };  // [0, 1)
    std::vector<Point> pts;
    pts.reserve(N);
    for (std::size_t i = 0; i < N; ++i) pts.push_back(Point{unit(), unit()});

    const long long scanned = timed("all-pairs scan", [&] { return countAllPairs(pts, R); });
    const long long gridded = timed("grid search", [&] { return countWithGrid(pts, R); });
    std::cout << "points: " << N << ", radius: " << R << ", seed: " << seed << '\n';
    std::cout << "close pairs, all-pairs scan: " << scanned << '\n';
    std::cout << "close pairs, grid search:    " << gridded << '\n';
    return 0;
}
