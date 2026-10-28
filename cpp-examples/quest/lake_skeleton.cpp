// Title: A skeleton for the deep trial: a lake as fluxes between pools
// Standard: C++20
// Not a solution: scaffolding an ecosystem model can grow on. Every process
// returns fluxes from one named pool to another, so the limiting nutrient is
// conserved by construction, and the integrator never sees the biology. Three
// toy processes (growth, death, decay) show the shape. The lake is yours to
// build: oxygen and the carbonate system, zooplankton, the aufwuchs, the
// cichlid guilds, a windy season that mixes the layers.
// Output: CSV on standard output, e.g.  ./lake_skeleton > lake_run.csv

#include <array>
#include <cmath>
#include <concepts>
#include <cstddef>
#include <iostream>
#include <numbers>
#include <tuple>
#include <vector>

namespace lake {

enum class Pool : std::size_t { phosphate, phytoplankton, detritus, count };
constexpr std::size_t N = static_cast<std::size_t>(Pool::count);
using State = std::array<double, N>;

constexpr std::size_t at(Pool p) { return static_cast<std::size_t>(p); }

// Mass moved per day from one pool to another (mg P per m^3 per day).
struct Flux {
  Pool from;
  Pool to;
  double rate;
};
using Fluxes = std::vector<Flux>;

// A process reads the state and appends the fluxes it causes.
template <class P>
concept Process = requires(const P& p, double t, const State& x, Fluxes& out) {
  { p(t, x, out) } -> std::same_as<void>;
};

double temperature(double day) {
  return 24.5 + 1.6 * std::cos(2.0 * std::numbers::pi * (day - 45.0) / 365.0);
}

struct Growth {
  double mu_max = 1.2;    // per day at 25 degrees C
  double half_sat = 0.5;  // mg P per m^3
  void operator()(double t, const State& x, Fluxes& out) const {
    const double p = x[at(Pool::phosphate)];
    const double a = x[at(Pool::phytoplankton)];
    const double f_t = std::pow(1.07, temperature(t) - 25.0);
    out.push_back({Pool::phosphate, Pool::phytoplankton, mu_max * f_t * p / (p + half_sat) * a});
  }
};

struct Death {
  double rate = 0.1;  // per day
  void operator()(double, const State& x, Fluxes& out) const {
    out.push_back({Pool::phytoplankton, Pool::detritus, rate * x[at(Pool::phytoplankton)]});
  }
};

struct Decay {
  double rate = 0.05;  // per day
  void operator()(double, const State& x, Fluxes& out) const {
    out.push_back({Pool::detritus, Pool::phosphate, rate * x[at(Pool::detritus)]});
  }
};

// The right-hand side is the sum of every process's fluxes. What leaves one
// pool enters another, so the total can drift only by rounding.
template <Process... Ps>
class Model {
 public:
  explicit Model(Ps... ps) : processes_(ps...) {}

  State derivative(double t, const State& x) const {
    Fluxes fluxes;
    std::apply([&](const auto&... p) { (p(t, x, fluxes), ...); }, processes_);
    State dx{};
    for (const Flux& f : fluxes) {
      dx[at(f.from)] -= f.rate;
      dx[at(f.to)] += f.rate;
    }
    return dx;
  }

 private:
  std::tuple<Ps...> processes_;
};

template <class F>
State rk4(const F& f, double t, const State& x, double h) {
  const auto axpy = [](const State& a, double s, const State& b) {
    State r{};
    for (std::size_t i = 0; i < N; ++i) r[i] = a[i] + s * b[i];
    return r;
  };
  const State k1 = f(t, x);
  const State k2 = f(t + h / 2, axpy(x, h / 2, k1));
  const State k3 = f(t + h / 2, axpy(x, h / 2, k2));
  const State k4 = f(t + h, axpy(x, h, k3));
  State next{};
  for (std::size_t i = 0; i < N; ++i) next[i] = x[i] + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  return next;
}

double total(const State& x) {
  double s = 0;
  for (const double v : x) s += v;
  return s;
}

}  // namespace lake

int main() {
  using lake::Pool;
  using lake::at;
  const lake::Model model{lake::Growth{}, lake::Death{}, lake::Decay{}};
  const auto f = [&](double t, const lake::State& s) { return model.derivative(t, s); };

  lake::State x{};
  x[at(Pool::phosphate)] = 2.0;
  x[at(Pool::phytoplankton)] = 0.5;
  x[at(Pool::detritus)] = 0.5;

  constexpr int years = 6;
  constexpr int steps_per_day = 8;
  constexpr double h = 1.0 / steps_per_day;
  std::cout << "day,temperature,phosphate,phytoplankton,detritus,total_p\n";
  for (int day = 0; day <= 365 * years; ++day) {
    std::cout << day << ',' << lake::temperature(day) << ',' << x[at(Pool::phosphate)] << ','
              << x[at(Pool::phytoplankton)] << ',' << x[at(Pool::detritus)] << ',' << lake::total(x) << '\n';
    for (int k = 0; k < steps_per_day; ++k) x = lake::rk4(f, day + k * h, x, h);
  }
}
