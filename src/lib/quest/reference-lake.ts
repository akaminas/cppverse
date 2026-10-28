// The worked solution to the deep trial, in TypeScript: a two-layer tropical
// rift lake (surface mixed layer over a deep hypolimnion) with phosphorus as
// the currency of the food web, oxygen and the carbonate system coupled to it
// by fixed stoichiometry, a windy season that mixes the layers, and five
// cichlid guilds. cpp-examples/quest/lake_solution.cpp is the same model in
// C++. It is one approach among many; the checks look only at the output.
import { rk4Step } from '../simulations/ode.ts';
import { readFoodWeb, trophicLevels, type LakeNotes, type LakeSubmission } from './checks.ts';

export interface LakeOptions {
  years?: number;
  /** Daily harvest rate of the piscivore (the cascade experiment). */
  harvest?: number;
  /** Multiplier on the initial phosphorus (enrichment). */
  enrich?: number;
  /** Output interval in days. */
  every?: number;
}

const ZS = 30; // surface mixed layer depth (m)
const ZD = 120; // hypolimnion depth (m)
const O_PER_P = 0.13; // mg/L O2 per mg P m⁻³ fixed or respired
const C_PER_P = 3.42; // mmol C per mg P (Redfield)
const ALK = 2.4e-3; // alkalinity (eq/L), held constant
const PCO2 = 420e-6; // atmosphere (atm)

export const NAMES = [
  'phosphate', 'deep_phosphate', 'phytoplankton', 'periphyton', 'zooplankton', 'zoobenthos',
  'detritus', 'deep_detritus', 'fish_mbuna', 'fish_utaka', 'fish_aulonocara', 'fish_lethrinops',
  'fish_rhamphochromis', 'oxygen', 'deep_oxygen', 'dic', 'deep_dic',
] as const;
type Name = (typeof NAMES)[number];
const I = Object.fromEntries(NAMES.map((n, i) => [n, i])) as Record<Name, number>;
// Budgets and realised diets are integrated alongside the biology, as extra state:
// cumulative harvest, cumulative CO2 uptake from the air, and each consumer's
// cumulative intake of each prey. Integrated with the state, they close exactly.
const HARVEST = NAMES.length;
const AIR = NAMES.length + 1;
const INTAKE = NAMES.length + 2;
const intake = (ci: number, prey: Name) => INTAKE + ci * NAMES.length + I[prey];
const SURFACE_P: Name[] = [
  'phosphate', 'phytoplankton', 'periphyton', 'zooplankton', 'zoobenthos', 'detritus',
  'fish_mbuna', 'fish_utaka', 'fish_aulonocara', 'fish_lethrinops', 'fish_rhamphochromis',
];

export interface Consumer {
  self: Name;
  /** Prey → preference weight. */
  diet: [Name, number][];
  cmax: number;
  half: number;
  growthEff: number;
  resp: number;
  mort: number;
  /** Density-dependent (quadratic) mortality: territoriality, disease. */
  crowd: number;
}

export const CONSUMERS: Consumer[] = [
  { self: 'zooplankton', diet: [['phytoplankton', 1], ['detritus', 0.25]], cmax: 0.7, half: 5, growthEff: 0.35, resp: 0.02, mort: 0.02, crowd: 0 },
  { self: 'zoobenthos', diet: [['detritus', 1], ['periphyton', 0.05]], cmax: 0.3, half: 2, growthEff: 0.3, resp: 0.01, mort: 0.005, crowd: 0 },
  { self: 'fish_mbuna', diet: [['periphyton', 1], ['detritus', 0.1]], cmax: 0.04, half: 2, growthEff: 0.3, resp: 0.003, mort: 0.001, crowd: 0.004 },
  { self: 'fish_utaka', diet: [['zooplankton', 1], ['phytoplankton', 0.15]], cmax: 0.05, half: 2, growthEff: 0.3, resp: 0.003, mort: 0.001, crowd: 0.004 },
  { self: 'fish_aulonocara', diet: [['zoobenthos', 1], ['zooplankton', 3]], cmax: 0.04, half: 2, growthEff: 0.3, resp: 0.003, mort: 0.001, crowd: 0.004 },
  { self: 'fish_lethrinops', diet: [['zoobenthos', 1], ['detritus', 10]], cmax: 0.04, half: 3, growthEff: 0.3, resp: 0.003, mort: 0.001, crowd: 0.004 },
  {
    self: 'fish_rhamphochromis',
    diet: [['fish_utaka', 1], ['fish_mbuna', 0.4], ['fish_aulonocara', 0.5], ['fish_lethrinops', 0.4]],
    cmax: 0.025, half: 0.8, growthEff: 0.3, resp: 0.002, mort: 0.0005, crowd: 0.01,
  },
];

export const temperature = (t: number) => 24.5 + 1.6 * Math.cos((2 * Math.PI * (t - 45)) / 365);
const light = (t: number) => 0.8 + 0.2 * Math.cos((2 * Math.PI * (t - 355)) / 365);
/** Exchange velocity between the layers (m/day): the south-east trades of May–September. */
const mixing = (t: number) => 0.02 + 1.5 * (0.5 * (1 + Math.cos((2 * Math.PI * (t - 200)) / 365))) ** 4;

/** Oxygen saturation in fresh water (mg/L). */
const oxygenSat = (T: number) => 14.652 - 0.41022 * T + 0.007991 * T * T - 0.000077774 * T ** 3;

/** Carbonate speciation from DIC (µmol/L) at fixed alkalinity: pH and CO2 (µmol/L). */
export function carbonate(dic: number, T: number) {
  const Tk = T + 273.15;
  const K1 = 10 ** -(3404.71 / Tk + 0.032786 * Tk - 14.8435);
  const K2 = 10 ** -(2902.39 / Tk + 0.02379 * Tk - 6.498);
  const Kw = 10 ** -(4470.99 / Tk - 6.0875 + 0.01706 * Tk);
  const C = dic * 1e-6;
  const excess = (pH: number) => {
    const H = 10 ** -pH;
    return (C * (K1 * H + 2 * K1 * K2)) / (H * H + K1 * H + K1 * K2) + Kw / H - H - ALK;
  };
  let lo = 4;
  let hi = 12;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    // The alkalinity the carbonate system carries rises with pH.
    if (excess(mid) > 0) hi = mid;
    else lo = mid;
  }
  const pH = (lo + hi) / 2;
  const H = 10 ** -pH;
  const co2 = (dic * H * H) / (H * H + K1 * H + K1 * K2);
  const K0 = Math.exp(-58.0931 + 90.5069 * (100 / Tk) + 22.294 * Math.log(Tk / 100));
  return { pH, co2, co2Sat: K0 * PCO2 * 1e6 };
}


function rates(t: number, x: readonly number[], harvest: number): number[] {
  const d = new Array(x.length).fill(0);
  const v = x.map((xi) => Math.max(xi, 0));
  const T = temperature(t);
  const fT = 1.07 ** (T - 25);
  const k = mixing(t);
  let resp = 0; // surface respiration, in mg P m⁻³ d⁻¹ mineralised
  let deepResp = 0;

  // Primary producers.
  const P = v[I.phosphate];
  const gA = 1.6 * fT * light(t) * (P / (P + 0.5)) * v[I.phytoplankton];
  const gE = 0.5 * fT * light(t) * (P / (P + 0.2)) * v[I.periphyton] * (1 - v[I.periphyton] / 12);
  const production = gA + gE;
  d[I.phytoplankton] += gA - 0.03 * v[I.phytoplankton] - 0.03 * v[I.phytoplankton];
  d[I.periphyton] += gE - 0.02 * v[I.periphyton];
  d[I.phosphate] -= gA + gE;
  d[I.detritus] += 0.03 * v[I.phytoplankton] + 0.02 * v[I.periphyton];
  d[I.deep_detritus] += (0.03 * v[I.phytoplankton] * ZS) / ZD;

  // Consumers: multi-prey Holling type II.
  CONSUMERS.forEach((c, ci) => {
    const X = v[I[c.self]];
    const food = c.diet.reduce((s, [p, w]) => s + w * v[I[p]], 0);
    const scale = (c.cmax * fT * X) / (c.half + food);
    let total = 0;
    for (const [p, w] of c.diet) {
      const eat = scale * w * v[I[p]];
      d[I[p]] -= eat;
      total += eat;
      d[intake(ci, p)] += eat;
    }
    const grow = c.growthEff * total;
    const egest = 0.2 * total;
    const excrete = total - grow - egest;
    const basal = c.resp * fT * X;
    const die = c.mort * X + c.crowd * X * X;
    d[I[c.self]] += grow - basal - die;
    d[I.detritus] += egest + die;
    d[I.phosphate] += excrete + basal;
    resp += excrete + basal;
  });
  if (harvest > 0) {
    const h = harvest * v[I.fish_rhamphochromis];
    d[I.fish_rhamphochromis] -= h;
    d[HARVEST] += h * ZS;
  }

  // Remineralisation, slowed when oxygen runs out.
  const remin = 0.08 * fT * v[I.detritus] * (v[I.oxygen] / (v[I.oxygen] + 0.5));
  d[I.detritus] -= remin + 0.08 * v[I.detritus];
  d[I.phosphate] += remin;
  d[I.deep_detritus] += (0.08 * v[I.detritus] * ZS) / ZD;
  resp += remin;
  const deepRemin = 0.05 * v[I.deep_detritus] * (v[I.deep_oxygen] / (v[I.deep_oxygen] + 0.5));
  d[I.deep_detritus] -= deepRemin;
  d[I.deep_phosphate] += deepRemin;
  deepResp += deepRemin;

  // Exchange between the layers.
  const mix = (surface: number, deep: number) => {
    const flux = k * (v[deep] - v[surface]);
    d[surface] += flux / ZS;
    d[deep] -= flux / ZD;
  };
  mix(I.phosphate, I.deep_phosphate);
  mix(I.oxygen, I.deep_oxygen);
  mix(I.dic, I.deep_dic);

  // Oxygen and carbon by stoichiometry, plus exchange with the air.
  const { co2, co2Sat } = carbonate(v[I.dic], T);
  const air = 0.6 * (co2Sat - co2);
  d[I.oxygen] += O_PER_P * (production - resp) + (0.6 * (oxygenSat(T) - v[I.oxygen])) / ZS;
  d[I.deep_oxygen] -= O_PER_P * deepResp;
  d[I.dic] += C_PER_P * (resp - production) + air / ZS;
  d[I.deep_dic] += C_PER_P * deepResp;
  d[AIR] += air;
  return d;
}

export interface LakeRun {
  columns: string[];
  rows: number[][];
  /** Realised diet fractions, consumer → prey → fraction. */
  diets: Record<string, Record<string, number>>;
}

export function simulateLake(opts: LakeOptions = {}): LakeRun {
  const years = opts.years ?? 8;
  const every = opts.every ?? 1;
  const harvest = opts.harvest ?? 0;
  const enrich = opts.enrich ?? 1;
  const init: Record<Name, number> = {
    phosphate: 2 * enrich, deep_phosphate: 12 * enrich, phytoplankton: 2, periphyton: 8,
    zooplankton: 1.5, zoobenthos: 2, detritus: 2, deep_detritus: 2,
    fish_mbuna: 0.5, fish_utaka: 0.5, fish_aulonocara: 0.4, fish_lethrinops: 0.4,
    fish_rhamphochromis: 0.15, oxygen: 7.8, deep_oxygen: 5, dic: 2350, deep_dic: 2400,
  };
  let x = [...NAMES.map((n) => init[n]), 0, 0, ...new Array(CONSUMERS.length * NAMES.length).fill(0)];
  const h = 0.125;
  const columns = ['day', 'temperature', 'ph', 'co2', ...NAMES, 'total_p', 'cum_p_out', 'total_c', 'cum_c_in', 'cum_c_out'];
  const rows: number[][] = [];
  const record = (t: number) => {
    const T = temperature(t);
    const { pH, co2 } = carbonate(x[I.dic], T);
    const surfaceP = SURFACE_P.reduce((s, n) => s + x[I[n]], 0);
    const totalP = ZS * surfaceP + ZD * (x[I.deep_phosphate] + x[I.deep_detritus]);
    const organicSurface = surfaceP - x[I.phosphate];
    const totalC = ZS * (x[I.dic] + C_PER_P * organicSurface) + ZD * (x[I.deep_dic] + C_PER_P * x[I.deep_detritus]);
    // Phosphorus leaves with the harvest; its carbon (Redfield) leaves with it, and CO2 enters from the air.
    rows.push([t, T, pH, co2, ...x.slice(0, NAMES.length), totalP, x[HARVEST], totalC, x[AIR], C_PER_P * x[HARVEST]]);
  };
  const f = (t: number, s: readonly number[]) => rates(t, s, harvest);
  record(0);
  for (let day = 0; day < years * 365; day++) {
    for (let s = 0; s < 1 / h; s++) x = rk4Step(f, day + s * h, x, h);
    if ((day + 1) % every === 0) record(day + 1);
  }
  const diets: LakeRun['diets'] = {};
  CONSUMERS.forEach((c, ci) => {
    const total = c.diet.reduce((sum, [p]) => sum + x[intake(ci, p)], 0);
    diets[c.self] = Object.fromEntries(c.diet.map(([p]) => [p, x[intake(ci, p)] / total]));
  });
  return { columns, rows, diets };
}

export function toCsv(run: { columns: string[]; rows: number[][] }): string {
  return [run.columns.join(','), ...run.rows.map((r) => r.map((v) => +v.toPrecision(8)).join(','))].join('\n');
}

export function foodWebCsv(diets: LakeRun['diets']): string {
  const lines = ['consumer,resource,fraction'];
  for (const [c, prey] of Object.entries(diets)) for (const [p, f] of Object.entries(prey)) lines.push(`${c},${p},${f.toFixed(4)}`);
  return lines.join('\n');
}

export const SOLUTION_CHAIN = 'fish_rhamphochromis > fish_utaka > zooplankton > phytoplankton';
export const SOLUTION_HARVEST = 0.004;

/** Everything the worked solution hands in: three files, the chain and the notes. */
export function solutionSubmission(years = 6): Required<Omit<LakeSubmission, 'notes'>> & { notes: Required<LakeNotes> } {
  const base = simulateLake({ years });
  const cascade = simulateLake({ years, harvest: SOLUTION_HARVEST });
  const foodWeb = foodWebCsv(base.diets);
  const web = readFoodWeb(foodWeb);
  if (typeof web === 'string') throw new Error(web);
  const end = base.rows[base.rows.length - 1][0];
  const finalYear = base.rows.filter((r) => r[0] > end - 365);
  const col = (name: string) => base.columns.indexOf(name);
  const argBy = (name: string, sign: 1 | -1) => finalYear.reduce((b, r) => (sign * r[col(name)] < sign * b[col(name)] ? r : b));
  const meanOf = (name: string) => finalYear.reduce((s, r) => s + r[col(name)], 0) / finalYear.length;
  const fish = base.columns.filter((c) => c.startsWith('fish_'));
  return {
    run: toCsv(base),
    foodWeb,
    cascade: toCsv(cascade),
    chain: SOLUTION_CHAIN,
    notes: {
      oxygenMinDay: Math.round(argBy('oxygen', 1)[0] % 365),
      zooplanktonPeakDay: Math.round(argBy('zooplankton', -1)[0] % 365),
      dominantFish: fish.reduce((b, f) => (meanOf(f) > meanOf(b) ? f : b)),
      topTrophicLevel: +Math.max(...trophicLevels(web).values()).toFixed(2),
      interpretation:
        'Harvesting the piscivore released the zooplanktivores, which grazed the zooplankton down and let the phytoplankton bloom: a trophic cascade down the food chain. Phosphorus is the limiting nutrient and is conserved. In the windy season mixing brings nutrients up from the deep layer and sets off a bloom; photosynthesis and respiration move oxygen and carbon in opposite directions, and pH follows the carbonate equilibrium.',
    },
  };
}
