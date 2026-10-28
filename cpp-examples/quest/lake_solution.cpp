// Title: The deep trial, worked: a two-layer cichlid lake with a food web
// Standard: C++20
// One way to pass the final trial, not the only one. A surface layer sits on a
// deep layer; wind mixes them in the dry season. Phosphorus is the currency of
// the food web and is conserved. Photosynthesis and respiration move oxygen and
// dissolved carbon by Redfield stoichiometry; pH comes from the carbonate
// system at fixed alkalinity. Five cichlid guilds, a piscivore, plankton,
// benthos and detritus eat each other with multi-prey type II responses.
//
// Budgets and realised diets are integrated with the biology as extra state,
// so they close exactly. Every process adds to one derivative vector.
//
//   ./lake_solution            baseline run, CSV (the file lake_run.csv)
//   ./lake_solution web        realised diets, CSV (food_web.csv)
//   ./lake_solution cascade    the run with the piscivore harvested (lake_cascade.csv)

#include <algorithm>
#include <array>
#include <cmath>
#include <cstddef>
#include <iomanip>
#include <iostream>
#include <numbers>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

namespace lake {

// Pools of the lake, biomass in mg P per cubic metre of surface water except
// the deep pools (per cubic metre of deep water), oxygen in mg/L and dissolved
// inorganic carbon in micromoles per litre.
enum Pool : std::size_t {
  phosphate, deep_phosphate, phytoplankton, periphyton, zooplankton, zoobenthos, detritus, deep_detritus,
  fish_mbuna, fish_utaka, fish_aulonocara, fish_lethrinops, fish_rhamphochromis,
  oxygen, deep_oxygen, dic, deep_dic,
  pool_count
};
constexpr std::array<std::string_view, pool_count> names{
    "phosphate", "deep_phosphate", "phytoplankton", "periphyton", "zooplankton", "zoobenthos", "detritus", "deep_detritus",
    "fish_mbuna", "fish_utaka", "fish_aulonocara", "fish_lethrinops", "fish_rhamphochromis",
    "oxygen", "deep_oxygen", "dic", "deep_dic"};

constexpr double depth_surface = 30.0;  // m
constexpr double depth_deep = 120.0;    // m
constexpr double oxygen_per_p = 0.13;   // mg/L of O2 per mg P m^-3 fixed or respired
constexpr double carbon_per_p = 3.42;   // micromol C per mg P (Redfield)
constexpr double alkalinity = 2.4e-3;   // eq/L, held constant
constexpr double pco2_air = 420e-6;     // atm

struct Consumer {
  Pool self;
  std::vector<std::pair<Pool, double>> diet;  // prey and preference weight
  double max_intake, half_saturation, efficiency, respiration, mortality, crowding;
};

// zooplankton, zoobenthos, four cichlid guilds, and the piscivore.
const std::vector<Consumer> consumers{
    {zooplankton, {{phytoplankton, 1}, {detritus, 0.25}}, 0.7, 5, 0.35, 0.02, 0.02, 0},
    {zoobenthos, {{detritus, 1}, {periphyton, 0.05}}, 0.3, 2, 0.3, 0.01, 0.005, 0},
    {fish_mbuna, {{periphyton, 1}, {detritus, 0.1}}, 0.04, 2, 0.3, 0.003, 0.001, 0.004},
    {fish_utaka, {{zooplankton, 1}, {phytoplankton, 0.15}}, 0.05, 2, 0.3, 0.003, 0.001, 0.004},
    {fish_aulonocara, {{zoobenthos, 1}, {zooplankton, 3}}, 0.04, 2, 0.3, 0.003, 0.001, 0.004},
    {fish_lethrinops, {{zoobenthos, 1}, {detritus, 10}}, 0.04, 3, 0.3, 0.003, 0.001, 0.004},
    {fish_rhamphochromis,
     {{fish_utaka, 1}, {fish_mbuna, 0.4}, {fish_aulonocara, 0.5}, {fish_lethrinops, 0.4}},
     0.025, 0.8, 0.3, 0.002, 0.0005, 0.01},
};

// State = the pools, then cumulative harvest, cumulative CO2 taken from the
// air, and each consumer's cumulative intake of each pool.
constexpr std::size_t harvest_total = pool_count;
constexpr std::size_t air_total = pool_count + 1;
constexpr std::size_t intake_base = pool_count + 2;
constexpr std::size_t state_size = intake_base + 7 * pool_count;
using State = std::array<double, state_size>;

constexpr std::size_t intake_slot(std::size_t consumer, Pool prey) { return intake_base + consumer * pool_count + prey; }

constexpr double two_pi = 2.0 * std::numbers::pi;
double temperature(double day) { return 24.5 + 1.6 * std::cos(two_pi * (day - 45.0) / 365.0); }
double light(double day) { return 0.8 + 0.2 * std::cos(two_pi * (day - 355.0) / 365.0); }
// Exchange velocity between the layers, m/day: the south-east trades of May to September.
double mixing(double day) { return 0.02 + 1.5 * std::pow(0.5 * (1.0 + std::cos(two_pi * (day - 200.0) / 365.0)), 4); }

// Oxygen saturation of fresh water, mg/L.
double oxygen_saturation(double T) { return 14.652 - 0.41022 * T + 0.007991 * T * T - 0.000077774 * T * T * T; }

struct Carbonate {
  double ph, co2, co2_saturation;  // co2 in micromol/L
};

// pH from dissolved inorganic carbon at fixed alkalinity, by bisection on pH.
Carbonate carbonate(double dissolved_carbon, double T) {
  const double Tk = T + 273.15;
  const double K1 = std::pow(10.0, -(3404.71 / Tk + 0.032786 * Tk - 14.8435));
  const double K2 = std::pow(10.0, -(2902.39 / Tk + 0.02379 * Tk - 6.498));
  const double Kw = std::pow(10.0, -(4470.99 / Tk - 6.0875 + 0.01706 * Tk));
  const double C = dissolved_carbon * 1e-6;
  const auto excess = [&](double pH) {
    const double H = std::pow(10.0, -pH);
    return C * (K1 * H + 2 * K1 * K2) / (H * H + K1 * H + K1 * K2) + Kw / H - H - alkalinity;
  };
  double lo = 4.0;
  double hi = 12.0;
  for (int k = 0; k < 60; ++k) {
    const double mid = 0.5 * (lo + hi);
    (excess(mid) > 0 ? hi : lo) = mid;  // the alkalinity the carbonate system carries rises with pH
  }
  const double pH = 0.5 * (lo + hi);
  const double H = std::pow(10.0, -pH);
  const double co2 = dissolved_carbon * H * H / (H * H + K1 * H + K1 * K2);
  const double K0 = std::exp(-58.0931 + 90.5069 * (100.0 / Tk) + 22.294 * std::log(Tk / 100.0));
  return {pH, co2, K0 * pco2_air * 1e6};
}

State derivative(double day, const State& state, double harvest_rate) {
  State d{};
  State v = state;
  for (double& x : v) x = std::max(x, 0.0);  // a guard against tiny negative values from the integrator
  const double T = temperature(day);
  const double temp_factor = std::pow(1.07, T - 25.0);
  const double exchange = mixing(day);
  double respired = 0;       // phosphorus mineralised in the surface layer, mg P m^-3 d^-1
  double respired_deep = 0;  // and in the deep layer

  // Primary producers, limited by phosphate, light and temperature.
  const double p = v[phosphate];
  const double growth_algae = 1.6 * temp_factor * light(day) * (p / (p + 0.5)) * v[phytoplankton];
  const double growth_film = 0.5 * temp_factor * light(day) * (p / (p + 0.2)) * v[periphyton] * (1 - v[periphyton] / 12.0);
  const double production = growth_algae + growth_film;
  d[phytoplankton] += growth_algae - 0.03 * v[phytoplankton] - 0.03 * v[phytoplankton];
  d[periphyton] += growth_film - 0.02 * v[periphyton];
  d[phosphate] -= production;
  d[detritus] += 0.03 * v[phytoplankton] + 0.02 * v[periphyton];
  d[deep_detritus] += 0.03 * v[phytoplankton] * depth_surface / depth_deep;  // sinking

  // Consumers: multi-prey type II functional response.
  for (std::size_t c = 0; c < consumers.size(); ++c) {
    const Consumer& k = consumers[c];
    double food = 0;
    for (const auto& [prey, weight] : k.diet) food += weight * v[prey];
    const double scale = k.max_intake * temp_factor * v[k.self] / (k.half_saturation + food);
    double eaten = 0;
    for (const auto& [prey, weight] : k.diet) {
      const double bite = scale * weight * v[prey];
      d[prey] -= bite;
      d[intake_slot(c, prey)] += bite;
      eaten += bite;
    }
    const double grown = k.efficiency * eaten;
    const double egested = 0.2 * eaten;
    const double excreted = eaten - grown - egested;
    const double basal = k.respiration * temp_factor * v[k.self];
    const double died = k.mortality * v[k.self] + k.crowding * v[k.self] * v[k.self];
    d[k.self] += grown - basal - died;
    d[detritus] += egested + died;
    d[phosphate] += excreted + basal;
    respired += excreted + basal;
  }
  if (harvest_rate > 0) {
    const double caught = harvest_rate * v[fish_rhamphochromis];
    d[fish_rhamphochromis] -= caught;
    d[harvest_total] += caught * depth_surface;  // per square metre of lake
  }

  // Remineralisation, slowed when oxygen runs out; deposition to the deep layer.
  const double remineralised = 0.08 * temp_factor * v[detritus] * (v[oxygen] / (v[oxygen] + 0.5));
  d[detritus] -= remineralised + 0.08 * v[detritus];
  d[phosphate] += remineralised;
  d[deep_detritus] += 0.08 * v[detritus] * depth_surface / depth_deep;
  respired += remineralised;
  const double deep_remineralised = 0.05 * v[deep_detritus] * (v[deep_oxygen] / (v[deep_oxygen] + 0.5));
  d[deep_detritus] -= deep_remineralised;
  d[deep_phosphate] += deep_remineralised;
  respired_deep += deep_remineralised;

  // Exchange between the layers, wind-driven.
  const auto mix = [&](Pool surface, Pool deep) {
    const double flux = exchange * (v[deep] - v[surface]);
    d[surface] += flux / depth_surface;
    d[deep] -= flux / depth_deep;
  };
  mix(phosphate, deep_phosphate);
  mix(oxygen, deep_oxygen);
  mix(dic, deep_dic);

  // Oxygen and carbon by stoichiometry, plus exchange with the air.
  const Carbonate chem = carbonate(v[dic], T);
  const double air = 0.6 * (chem.co2_saturation - chem.co2);
  d[oxygen] += oxygen_per_p * (production - respired) + 0.6 * (oxygen_saturation(T) - v[oxygen]) / depth_surface;
  d[deep_oxygen] -= oxygen_per_p * respired_deep;
  d[dic] += carbon_per_p * (respired - production) + air / depth_surface;
  d[deep_dic] += carbon_per_p * respired_deep;
  d[air_total] += air;
  return d;
}

State rk4(double day, const State& x, double h, double harvest_rate) {
  const auto advance = [&](const State& base, double scale, const State& slope) {
    State out{};
    for (std::size_t i = 0; i < state_size; ++i) out[i] = base[i] + scale * slope[i];
    return out;
  };
  const State k1 = derivative(day, x, harvest_rate);
  const State k2 = derivative(day + h / 2, advance(x, h / 2, k1), harvest_rate);
  const State k3 = derivative(day + h / 2, advance(x, h / 2, k2), harvest_rate);
  const State k4 = derivative(day + h, advance(x, h, k3), harvest_rate);
  State next{};
  for (std::size_t i = 0; i < state_size; ++i) next[i] = x[i] + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  return next;
}

State initial_state() {
  State x{};
  x[phosphate] = 2;
  x[deep_phosphate] = 12;
  x[phytoplankton] = 2;
  x[periphyton] = 8;
  x[zooplankton] = 1.5;
  x[zoobenthos] = 2;
  x[detritus] = 2;
  x[deep_detritus] = 2;
  x[fish_mbuna] = 0.5;
  x[fish_utaka] = 0.5;
  x[fish_aulonocara] = 0.4;
  x[fish_lethrinops] = 0.4;
  x[fish_rhamphochromis] = 0.15;
  x[oxygen] = 7.8;
  x[deep_oxygen] = 5;
  x[dic] = 2350;
  x[deep_dic] = 2400;
  return x;
}

void write_header() {
  std::cout << "day,temperature,ph,co2";
  for (const auto name : names) std::cout << ',' << name;
  std::cout << ",total_p,cum_p_out,total_c,cum_c_in,cum_c_out\n";
}

void write_row(double day, const State& x) {
  const double T = temperature(day);
  const Carbonate chem = carbonate(x[dic], T);
  // Phosphorus held by everything in the surface layer, then per square metre of lake.
  double surface_p = 0;
  for (const Pool pool : {phosphate, phytoplankton, periphyton, zooplankton, zoobenthos, detritus, fish_mbuna, fish_utaka,
                          fish_aulonocara, fish_lethrinops, fish_rhamphochromis})
    surface_p += x[pool];
  const double total_p = depth_surface * surface_p + depth_deep * (x[deep_phosphate] + x[deep_detritus]);
  const double organic = surface_p - x[phosphate];
  const double total_c = depth_surface * (x[dic] + carbon_per_p * organic) + depth_deep * (x[deep_dic] + carbon_per_p * x[deep_detritus]);
  std::cout << day << ',' << T << ',' << chem.ph << ',' << chem.co2;
  for (std::size_t i = 0; i < pool_count; ++i) std::cout << ',' << x[i];
  // Carbon leaves with the harvest in Redfield proportion; CO2 comes in from the air.
  std::cout << ',' << total_p << ',' << x[harvest_total] << ',' << total_c << ',' << x[air_total] << ',' << carbon_per_p * x[harvest_total] << '\n';
}

// The diets the run realised: each consumer's cumulative intake, as fractions.
void write_web(const State& x) {
  std::cout << "consumer,resource,fraction\n" << std::fixed << std::setprecision(4);
  for (std::size_t c = 0; c < consumers.size(); ++c) {
    double total = 0;
    for (const auto& [prey, weight] : consumers[c].diet) total += x[intake_slot(c, prey)];
    for (const auto& [prey, weight] : consumers[c].diet)
      std::cout << names[consumers[c].self] << ',' << names[prey] << ',' << x[intake_slot(c, prey)] / total << '\n';
  }
}

}  // namespace lake

int main(int argc, char** argv) {
  const std::string mode = argc > 1 ? argv[1] : "run";
  if (mode != "run" && mode != "web" && mode != "cascade") {
    std::cerr << "usage: lake_solution [run|web|cascade]\n";
    return 2;
  }
  constexpr int years = 6;
  constexpr int steps_per_day = 8;
  constexpr double h = 1.0 / steps_per_day;
  const double harvest_rate = mode == "cascade" ? 0.004 : 0.0;

  lake::State x = lake::initial_state();
  if (mode != "web") {
    std::cout << std::setprecision(8);
    lake::write_header();
    lake::write_row(0, x);
  }
  for (int day = 0; day < 365 * years; ++day) {
    for (int k = 0; k < steps_per_day; ++k) x = lake::rk4(day + k * h, x, h, harvest_rate);
    if (mode != "web") lake::write_row(day + 1, x);
  }
  if (mode == "web") lake::write_web(x);
}
